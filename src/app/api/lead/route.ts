import { appendFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
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
 * Privacy-first lead storage:
 *  1. The visitor submits a mobile number.
 *  2. The server stores it durably, but as **private** data:
 *     - On Vercel: a private Blob object (dashboard-only visibility).
 *     - Self-hosted: `data/leads.jsonl` (git-ignored, owner-controlled).
 *  3. No raw phone numbers or user agents in application logs. Only a
 *     coarse event line with the source and whether storage succeeded.
 *  4. If `LEAD_WEBHOOK_URL` is configured, the lead is forwarded to the
 *     owner over HTTPS, optionally with a bearer token when
 *     `LEAD_WEBHOOK_TOKEN` is set. The visitor never needs WhatsApp.
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
    return Response.json({ ok: false, error: "invalid_number" }, { status: 400 });
  }

  const source =
    typeof body?.source === "string" ? body.source.slice(0, 40) : "unknown";
  const record = {
    phone: `+91${local10}`,
    source,
    at: new Date().toISOString(),
  };

  // Durable file log (self-hosted only). Serverless filesystems are
  // read-only, so failures here are non-fatal. The file is git-ignored and
  // accessible only to the owner running the process.
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

  // Private cloud store: each lead becomes a private object in the
  // project's Vercel Blob store. Access requires the project's own
  // credentials; the object path includes a random suffix so it cannot be
  // guessed from the timestamp/phone pattern.
  let cloudStored = false;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await put(
        `leads/${Date.now()}-${randomUUID().slice(0, 8)}-${local10.slice(-4)}.json`,
        JSON.stringify(record),
        {
          access: "private",
          contentType: "application/json",
        },
      );
      cloudStored = true;
    } catch {
      cloudStored = false;
    }
  }

  // Do not log the full phone number. A coarse event line is enough to
  // confirm submission and routing without exposing PII in platform logs.
  console.log(
    `[lead] source=${source} stored=${stored} cloud=${cloudStored} tail=${local10.slice(-4)}`,
  );

  // Optional push channel: forward the lead to the configured webhook so
  // the owner receives it without any visitor action. The webhook must be
  // HTTPS and may include a bearer token when LEAD_WEBHOOK_TOKEN is set.
  let forwarded = false;
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (webhookUrl) {
    let target: URL | null = null;
    try {
      target = new URL(webhookUrl);
    } catch {
      target = null;
    }
    if (target && target.protocol === "https:") {
      const headers: Record<string, string> = {
        "content-type": "application/json",
      };
      const webhookToken = process.env.LEAD_WEBHOOK_TOKEN;
      if (webhookToken) {
        headers.authorization = `Bearer ${webhookToken}`;
      }
      try {
        const response = await fetch(target, {
          method: "POST",
          headers,
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
  }

  return Response.json({ ok: true, stored, cloudStored, forwarded });
}
