"use client";

import { useState } from "react";
import { ArrowRightIcon, CheckCircle2Icon, PhoneIcon } from "lucide-react";
import { greetingWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";
import { Localized } from "@/i18n/Localized";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "done" | "error";

function normalizeIndianMobile(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

/**
 * One-field lead capture, deliberately without OTP: the visitor enters a
 * mobile number, the server records it for the business, and the visit ends
 * there — nothing is opened, nothing has to be sent. WhatsApp stays one tap
 * away as an optional channel with a plain "Hello Mahesh" greeting; anyone
 * who chats there is reachable at that chat's number anyway.
 */
export function CallBackForm({
  source,
  className,
  onDone,
}: {
  source: string;
  className?: string;
  /** Fires once the lead is stored server-side. */
  onDone?: () => void;
}) {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const local10 = normalizeIndianMobile(phone);
  const valid = /^([6-9]\d{9})$/.test(local10);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status === "sending" || !valid) {
      if (!valid) setStatus("error");
      return;
    }
    setStatus("sending");

    let stored = false;
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone: local10, source }),
      });
      if (response.ok) stored = true;
    } catch {
      stored = false;
    }

    trackEvent("generate_lead", { source, stored });
    setStatus("done");
    onDone?.();
  };

  const whatsappLabel = (
    <Localized
      en="Message the shop directly"
      hi="दुकान को सीधे message करें"
    />
  );

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-4 sm:p-5",
        className,
      )}
    >
      {status === "done" ? (
        <div className="flex items-start gap-3" role="status" aria-live="polite">
          <CheckCircle2Icon
            className="mt-0.5 size-5 shrink-0 text-[#0d7a5f]"
            aria-hidden
          />
          <div>
            <p className="text-sm font-bold">
              <Localized
                en="Thanks — your number is with the shop."
                hi="शुक्रिया — आपका नंबर दुकान तक पहुँच गया।"
              />
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              <Localized
                en="Expect a call back with rates and availability."
                hi="रेट और उपलब्धता के साथ call back आएगा।"
              />
            </p>
            <p className="mt-2 text-[0.66rem] leading-relaxed text-muted-foreground">
              <Localized
                en="Want to chat instead?"
                hi="बातचीत WhatsApp पर करनी हो?"
              />{" "}
              <a
                href={greetingWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`lead-whatsapp-${source}`}
                onClick={() =>
                  trackEvent("click_whatsapp", { source: `${source}-lead` })
                }
                className="font-semibold text-primary underline underline-offset-4"
              >
                {whatsappLabel}
              </a>
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <p className="flex items-center gap-1.5 text-sm font-bold">
            <PhoneIcon className="size-4 text-primary" aria-hidden />
            <Localized
              en="Get a call back"
              hi="कॉल बैक पाएँ"
            />
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            <Localized
              en="Leave your number — it goes straight to the shop. No OTP, no sign-up."
              hi="नंबर छोड़ें — सीधे दुकान तक पहुँचेगा। ना OTP, ना साइन-अप।"
            />
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <div className="flex-1">
              <label htmlFor={`lead-phone-${source}`} className="sr-only">
                <Localized en="Mobile number" hi="मोबाइल नंबर" />
              </label>
              <input
                id={`lead-phone-${source}`}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="10-digit mobile number"
                aria-invalid={status === "error"}
                aria-describedby={
                  status === "error" ? `lead-error-${source}` : undefined
                }
                maxLength={16}
                className={cn(
                  "h-12 w-full rounded-full border bg-background px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring/30",
                  status === "error"
                    ? "border-destructive"
                    : "border-input focus:border-ring",
                )}
              />
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              className="dana-texture inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#0d7a5f] px-5 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            >
              <PhoneIcon className="size-4.5" aria-hidden />
              <Localized
                en={status === "sending" ? "Sending…" : "Send number"}
                hi={status === "sending" ? "भेज रहे हैं…" : "नंबर भेजें"}
              />
              <ArrowRightIcon className="size-4" aria-hidden />
            </button>
          </div>
          {status === "error" && (
            <p
              id={`lead-error-${source}`}
              role="alert"
              className="mt-2 text-xs font-semibold text-destructive"
            >
              <Localized
                en="Enter a valid 10-digit Indian mobile number."
                hi="मान्य 10 अंकों का भारतीय मोबाइल नंबर डालें।"
              />
            </p>
          )}
          <p className="mt-2 text-[0.66rem] leading-relaxed text-muted-foreground">
            <Localized
              en="Your number is used only to call back about your enquiry. Submitting is enough — the shop calls you."
              hi="आपका नंबर सिर्फ़ पूछताछ के call back में इस्तेमाल होगा। भेजना काफ़ी है — call दुकान की तरफ़ से आएगा।"
            />
          </p>
          <p className="mt-1.5 text-[0.66rem] leading-relaxed text-muted-foreground">
            <Localized
              en="Prefer WhatsApp?"
              hi="WhatsApp पसंद है?"
            />{" "}
            <a
              href={greetingWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`lead-whatsapp-${source}`}
              onClick={() =>
                trackEvent("click_whatsapp", { source: `${source}-lead` })
              }
              className="font-semibold text-primary underline underline-offset-4"
            >
              {whatsappLabel}
            </a>
          </p>
        </form>
      )}
    </div>
  );
}
