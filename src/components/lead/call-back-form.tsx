"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
 * One-field lead capture, deliberately without OTP. The number ships itself:
 * the moment a complete, valid 10-digit number sits in the field it is sent
 * to the server — no second tap. A short debounce lets corrections cancel
 * the pending send, and closing the form with a complete number flushes it
 * rather than losing it. WhatsApp stays one tap away as an optional channel
 * with a plain "Hello Mahesh" greeting; anyone who chats there is reachable
 * at that chat's number anyway.
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

  const sendLead = useCallback(async (digits: string) => {
    if (sentRef.current) return;
    sentRef.current = true;
    setStatus("sending");
    let stored = false;
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        // keepalive lets the request finish even if the visitor closes the
        // popup or navigates while it is in flight.
        keepalive: true,
        body: JSON.stringify({ phone: digits, source }),
      });
      if (response.ok) stored = true;
    } catch {
      stored = false;
    }

    trackEvent("generate_lead", { source, stored });
    setStatus("done");
    onDone?.();
  }, [source, onDone]);

  // Latest-value mirrors so the unmount flush below reads the state as of
  // the last committed render, independent of cleanup ordering.
  const inputRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef({ local10: "", status: "idle" as Status, phone: "" });
  const sendLeadRef = useRef(sendLead);
  const sentRef = useRef(false);
  useEffect(() => {
    stateRef.current = { local10, status, phone };
    sendLeadRef.current = sendLead;
  });

  // Browser autofill writes its value without an event React can observe,
  // so the field can sit filled while state stays empty. Poll the DOM and
  // pull any unobserved value into state — the normal auto-send takes over
  // from there.
  useEffect(() => {
    if (status !== "idle" && status !== "error") return;
    const poll = window.setInterval(() => {
      const el = inputRef.current;
      if (!el) return;
      if (el.value !== stateRef.current.phone) {
        setPhone(el.value);
        if (stateRef.current.status === "error") setStatus("idle");
      }
    }, 250);
    return () => window.clearInterval(poll);
  }, [status]);

  // Auto-send: a complete, valid number ships itself after a short pause —
  // no second tap. Edits cancel the pending send.
  useEffect(() => {
    if (status !== "idle" || !valid) return;
    const timer = window.setTimeout(() => void sendLead(local10), 500);
    return () => window.clearTimeout(timer);
  }, [local10, valid, status, sendLead]);

  // Flush on dismiss: a complete number the visitor finished typing right
  // before leaving must still reach the shop. pagehide/visibilitychange
  // cover hard navigation, refresh and tab close (React cleanups do not
  // run there); the cleanup return covers SPA unmounts like popup close.
  useEffect(() => {
    const flush = () => {
      if (stateRef.current.status !== "idle") return;
      // Prefer the DOM value: a just-autofilled field may not be in state
      // yet, and a complete number must not be lost to a fast bounce.
      const el = inputRef.current;
      const digits = normalizeIndianMobile(
        el?.value ?? stateRef.current.phone,
      );
      if (/^([6-9]\d{9})$/.test(digits)) {
        void sendLeadRef.current(digits);
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
      flush();
    };
  }, []);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (status !== "idle") return;
    if (!valid) {
      setStatus("error");
      return;
    }
    void sendLead(local10);
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
                ref={inputRef}
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
              en="Your number is used only to call back about your enquiry. It sends itself once the number is complete."
              hi="आपका नंबर सिर्फ़ पूछताछ के call back में इस्तेमाल होगा। नंबर पूरा होते ही अपने-आप चला जाएगा।"
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
