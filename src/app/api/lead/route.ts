import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

/** Normalises Indian mobile numbers: accepts +91XXXXXXXXXX, 0XXXXXXXXXX, XXXXXXXXXX. */
function normalizeIndianMobile(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  const local10 =
    digits.length === 12 && digits.startsWith("91")
      ? digits.slice(2)
      : digits.length === 11 && digits.startsWith("0")
        ? digits.slice(1)
        : digits;
  if (local10.length !== 10 || !/^[6-9]/.test(local10)) return null;
  return local10;
}

/**
 * Lead capture without OTP:
 *  1. The visitor submits a mobile number.
 *  2. The server stores it durably when the filesystem allows (self-hosted)
 *     and logs it (visible in Vercel logs on serverless).
 *  3. If LEAD_WEBHOOK_URL is configured, the lead is forwarded there so the
 *     owner gets it on their phone/inbox without any visitor action.
 *     Supported setups (see README): Telegram bot sendMessage or a Google
 *     Apps Script sheet-appender URL.
 *  4. Submission alone is enough — the visitor sees a confirmation and the
 *     shop calls back. WhatsApp remains an optional channel with a plain
 *     "Hello Mahesh" greeting; a chat there reveals the number anyway.
 */
export async function POST(request: Request) {
  let body: { phone?: unknown; source?: unknown } | null = null;
  try {
    body = (await request.json()) as { phone?: unknown; source?: unknown };
  } catch {
    return Response.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const raw = typeof body?.phone === "string" ? body.phone : "";
  const local10 = normalizeIndianMobile(raw);
  if (!local10) {
    return Response.json(
      { ok: false, error: "invalid_number" },
      { status: 400 },
    );
  }

  const source =
    typeof body?.source === "string" ? body.source.slice(0, 40) : "unknown";
  const record = {
    phone: `+91${local10}`,
    source,
    at: new Date().toISOString(),
    ua: request.headers.get("user-agent")?.slice(0, 120) ?? undefined,
  };

  // Durable file log (self-hosted). Serverless filesystems are read-only,
  // so failures here are non-fatal.
  let stored = false;
  try {
    await mkdir("data", { recursive: true });
    await appendFile(
      path.join("data", "leads.jsonl"),
      `${JSON.stringify(record)}\n`,
      "utf8",
    );
    stored = true;
  } catch {
    stored = false;
  }

  // Durable cloud store: each lead becomes a browsable object in the
  // project's Vercel Blob store (dashboard → Storage). Works when
  // BLOB_READ_WRITE_TOKEN is configured.
  let cloudStored = false;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await put(
        `leads/${Date.now()}-${local10}.json`,
        JSON.stringify(record),
        {
          access: "public",
          addRandomSuffix: false,
          contentType: "application/json",
        },
      );
      cloudStored = true;
    } catch {
      cloudStored = false;
    }
  }

  // Always visible in the platform logs, whatever the filesystem says.
  console.log(`[lead] ${JSON.stringify(record)} stored=${stored}`);

  // Optional push channel: forward the lead to the configured webhook so the
  // owner receives it without the visitor doing anything else.
  let forwarded = false;
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          phone: record.phone,
          source: record.source,
          at: record.at,
          text: `New website enquiry from ${source}\nMobile: ${record.phone}\nTime: ${record.at}`,
        }),
        signal: AbortSignal.timeout(5000),
      });
      forwarded = response.ok;
    } catch {
      forwarded = false;
    }
  }

  return Response.json({ ok: true, stored, cloudStored, forwarded });
}
