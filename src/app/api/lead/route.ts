import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

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
 * Lead capture without OTP: the visitor submits a mobile number, the server
 * stores it for the business, and the visitor is handed to WhatsApp with the
 * callback request pre-filled to the shop's number.
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
  };

  // Best-effort durable log for the business; the enquiry still proceeds
  // when the filesystem is read-only on exotic hosts.
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

  return Response.json({ ok: true, stored });
}
