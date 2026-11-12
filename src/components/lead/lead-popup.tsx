"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, PhoneIcon, XIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { CallBackForm } from "@/components/lead/call-back-form";
import { useLocale } from "@/i18n/LocaleProvider";
import { Localized } from "@/i18n/Localized";

const DISMISS_KEY = "gph-lead-popup-dismissed";
const DONE_KEY = "gph-lead-submitted";

/**
 * A one-time-per-session modal asking for a callback number. Appears after
 * a short delay or when the visitor scrolls a third of the page — whichever
 * comes first.
 * No OTP; the submitted number is stored server-side and the shop calls
 * back — WhatsApp stays available as an optional channel.
 */
export function LeadPopup() {
  const pathname = usePathname();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/checkout")) return;
    let dismissed = false;
    let submitted = false;
    try {
      dismissed =
        window.sessionStorage.getItem(DISMISS_KEY) === "1" ||
        window.localStorage.getItem(DONE_KEY) === "1";
      submitted = window.localStorage.getItem(DONE_KEY) === "1";
    } catch {
      // Storage may be unavailable; fall back to showing once per mount.
    }
    if (dismissed || submitted) return;

    const frame = window.requestAnimationFrame(() => setArmed(true));
    const timer = window.setTimeout(() => setOpen(true), 8000);
    const onScroll = () => {
      const progress =
        window.scrollY /
        Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (progress > 0.3) {
        window.clearTimeout(timer);
        window.removeEventListener("scroll", onScroll);
        setOpen(true);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  const close = () => {
    setOpen(false);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Session-only dismissal; the popup may reappear next visit.
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const done = () => {
    try {
      window.localStorage.setItem(DONE_KEY, "1");
    } catch {
      // Ignore; the popup just closes for this visit.
    }
    window.setTimeout(() => setOpen(false), 2600);
  };

  if (!armed || pathname.startsWith("/checkout")) return null;

  return (
    <>
      {/* Floating trigger so the ask is always reachable */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Get a call back — leave your number"
        className="fixed bottom-[5.5rem] right-7 z-40 hidden size-11 items-center justify-center rounded-full border border-border bg-card text-primary shadow-[0_12px_30px_-12px_rgba(16,25,46,0.45)] transition-transform hover:scale-105 md:flex"
      >
        <PhoneIcon className="size-5" aria-hidden />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
          data-testid="lead-popup-overlay"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-popup-title"
            className="surface-card w-full max-w-md rounded-3xl p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p id="lead-popup-title" className="text-lg font-extrabold tracking-tight">
                  <Localized
                    en="Get rates on a call"
                    hi="रेट call पर पाएँ"
                  />
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  <Localized
                    en="Leave your mobile number — the shop sees it instantly and calls you back. No OTP, no spam."
                    hi="मोबाइल नंबर छोड़ें — दुकान को तुरंत दिखेगा और call back आएगा। ना OTP, ना स्पैम।"
                  />
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label={t("common.close")}
                className="tap-target grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
              >
                <XIcon className="size-4" aria-hidden />
              </button>
            </div>

            <CallBackForm source="popup" className="mt-4 border-0 bg-transparent p-0 sm:p-0" onDone={done} />

            <p className="mt-3 text-center text-[0.66rem] leading-relaxed text-muted-foreground">
              <Localized
                en="Prefer WhatsApp or IndiaMART? Continue browsing — the shop is one tap away."
                hi="WhatsApp या IndiaMART चाहिए? ब्राउज़ करते रहें — दुकान एक tap दूर है।"
              />
              <Link
                href="/products"
                onClick={close}
                className="ml-1 inline-flex items-center gap-0.5 font-semibold text-primary"
              >
                <Localized en="Browse products" hi="उत्पाद देखें" />
                <ArrowRightIcon className="size-3.5" aria-hidden />
              </Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
