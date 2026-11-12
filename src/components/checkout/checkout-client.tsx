"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  MessageCircleIcon,
  PencilIcon,
  ShoppingBagIcon,
  StoreIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCartStore,
  useEstimatedTotal,
} from "@/store/cart";
import {
  buildCartOrderMessage,
  indiaMartUrl,
  whatsappUrl,
} from "@/lib/whatsapp";
import { formatAmount, getUnitLabel } from "@/lib/pricing";
import { trackEvent } from "@/lib/analytics";
import { useIsClient } from "@/lib/use-is-client";
import { CallBackForm } from "@/components/lead/call-back-form";
import { Localized } from "@/i18n/Localized";
import { useLocale } from "@/i18n/LocaleProvider";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const toneClasses = {
  terracotta: "swatch-terracotta",
  peach: "swatch-peach",
  slate: "swatch-slate",
  gold: "swatch-gold",
  cream: "swatch-cream",
} as const;

export function CheckoutClient() {
  const lines = useCartStore((state) => state.lines);
  const hydrated = useCartStore((state) => state.hydrated);
  const openCart = useCartStore((state) => state.open);
  const clear = useCartStore((state) => state.clear);
  const { amount, hasQuoteLines } = useEstimatedTotal();
  const { locale } = useLocale();
  const isClient = useIsClient();
  const [started, setStarted] = useState<"indiamart" | "whatsapp" | null>(null);
  const trackedCheckout = useRef(false);

  const message = buildCartOrderMessage(
    lines.map((line) => ({
      name: line.name,
      variant: line.variantLabel,
      qty: line.qty,
      unit: line.unit,
    })),
  );
  const whatsappHref = whatsappUrl(message);

  useEffect(() => {
    if (!hydrated || lines.length === 0 || trackedCheckout.current) return;
    trackedCheckout.current = true;
    trackEvent("begin_checkout", {
      items: lines.reduce((total, line) => total + line.qty, 0),
      value: amount,
      currency: "INR",
      has_quote_lines: hasQuoteLines,
    });
  }, [hydrated, lines, amount, hasQuoteLines]);

  const visibleLines = isClient && hydrated ? lines : [];
  const ready = isClient && hydrated;

  if (!ready) {
    return (
      <div className="container-page pb-20 pt-10" aria-busy="true">
        <div className="h-4 w-40 animate-pulse rounded-full bg-border/60" />
        <div className="mt-6 h-12 w-2/3 max-w-md animate-pulse rounded-2xl bg-border/60" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="h-72 animate-pulse rounded-3xl bg-card/70" />
          <div className="h-72 animate-pulse rounded-3xl bg-card/70" />
        </div>
      </div>
    );
  }

  if (visibleLines.length === 0) {
    return (
      <div className="container-page flex flex-col items-center pb-24 pt-16 text-center">
        <span className="grid size-20 place-items-center rounded-full bg-secondary text-primary">
          <ShoppingBagIcon className="size-8" aria-hidden />
        </span>
        <h1 className="display-lg mt-6 max-w-lg">
          <Localized
            en="Your order list is empty."
            hi="आपकी ऑर्डर लिस्ट खाली है।"
          />
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          <Localized
            en="Add a priced product to start an order. Items marked “Contact for Price” open a WhatsApp quote instead of a fake cart price."
            hi="शुरू करने के लिए लिस्टेड-रेट वाला उत्पाद जोड़ें। “Contact for Price” वाले items अनुमानित रेट की जगह WhatsApp quote खोलते हैं।"
          />
        </p>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <Link
            href="/products"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
          >
            <Localized en="Browse products" hi="उत्पाद देखें" />
            <ArrowRightIcon className="size-4" aria-hidden />
          </Link>
          <Link
            href="/faq"
            className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-card/60 px-6 text-sm font-semibold"
          >
            <Localized en="How ordering works" hi="ऑर्डरिंग कैसे होती है" />
          </Link>
        </div>

        <div className="mx-auto mt-8 w-full max-w-md">
          <p className="text-center text-sm font-semibold text-foreground">
            <Localized
              en="Not ready to browse yet?"
              hi="अभी ब्राउज़ नहीं करना?"
            />
          </p>
          <p className="mx-auto mt-1 max-w-sm text-center text-xs leading-relaxed text-muted-foreground">
            <Localized
              en="Leave your number — the shop calls you back with prices and availability."
              hi="नंबर छोड़ें — दुकान रेट और उपलब्धता के साथ call करेगी।"
            />
          </p>
          <CallBackForm source="checkout-empty" className="mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="container-page pb-20 pt-6 sm:pt-10">
      <div className="max-w-2xl">
        <p className="eyebrow">
          <Localized
            en="Checkout · No payment gateway"
            hi="चेकआउट · कोई payment gateway नहीं"
          />
        </p>
        <h1 className="display-lg mt-2">
          <Localized en="Finish your order." hi="ऑर्डर पूरा करें।" />
        </h1>
        <p className="mt-3 text-[0.98rem] leading-relaxed text-muted-foreground">
          <Localized
            en="Choose one of two channels. Both open a new tab; your list stays saved in this browser until you clear it."
            hi="दो तरीकों में से एक चुनें। दोनों नए tab में खुलते हैं; आपकी लिस्ट खाली करने तक इस browser में सेव रहती है।"
          />
        </p>
      </div>

      {started && (
        <div
          role="status"
          aria-live="polite"
          className="relative mt-6 overflow-hidden rounded-2xl border border-primary/35 bg-secondary/70 p-5 sm:p-6"
        >
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <CheckCircle2Icon
                className="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden
              />
              <div>
                <p className="font-display text-xl">
                  <Localized
                    en="Order enquiry started"
                    hi="ऑर्डर की पूछताछ शुरू हुई"
                  />
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {started === "whatsapp"
                    ? locale === "hi"
                      ? "WhatsApp tab में मैसेज तैयार है — send दबाएँ। टीम कन्फ़र्म करेगी。"
                      : "Your WhatsApp tab has the message ready. Press send so the team can confirm."
                    : locale === "hi"
                      ? "IndiaMART tab खुला है। listing पर सेलर के साथ आगे बढ़ें。"
                      : "The IndiaMART tab is open. Continue with the seller on the listing."}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                clear();
                toast.success(
                  locale === "hi" ? "ऑर्डर लिस्ट खाली हो गई" : "Order list cleared",
                );
              }}
              className="h-11 shrink-0 rounded-full"
            >
              <Trash2Icon className="size-4" aria-hidden />
              <Localized en="Clear order list" hi="ऑर्डर लिस्ट खाली करें" />
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <section
          aria-labelledby="summary-heading"
          className="surface-card order-2 rounded-3xl p-5 sm:p-6 lg:order-1"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 id="summary-heading" className="font-display text-2xl">
              <Localized en="Order summary" hi="ऑर्डर की झलक" />
            </h2>
            <button
              type="button"
              onClick={openCart}
              className="inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-primary"
            >
              <PencilIcon className="size-3.5" aria-hidden />
              <Localized en="Edit list" hi="लिस्ट बदलें" />
            </button>
          </div>

          <ul className="mt-4 divide-y divide-border/60">
            {visibleLines.map((line) => (
              <li key={line.key} className="flex gap-3 py-4 first:pt-0">
                <span
                  className={cn(
                    "relative size-16 shrink-0 overflow-hidden rounded-xl",
                    toneClasses[line.tone],
                  )}
                  aria-hidden
                >
                  <Image
                    src={line.image}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-snug">
                    {line.name}
                  </p>
                  {line.variantLabel && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {line.variantLabel}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    <Localized en="Qty" hi="मात्रा" /> {line.qty}
                    {line.unit ? (
                      <>
                        {" × "}
                        <span className="rupee">₹</span>
                        {formatAmount(line.amount ?? 0)}/{getUnitLabel(line.unit)}
                      </>
                    ) : null}
                  </p>
                </div>
                <p className="shrink-0 text-right text-sm font-semibold">
                  {line.amount !== null ? (
                    <>
                      <span className="rupee">₹</span>
                      {formatAmount(line.amount * line.qty)}
                    </>
                  ) : (
                    "Quote"
                  )}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <Localized en="Estimated total" hi="अनुमानित total" />
              </p>
              <p className="font-display text-3xl">
                <span className="rupee">₹</span>
                {formatAmount(amount)}
              </p>
              {hasQuoteLines && (
                <p className="mt-1 text-xs text-primary">
                  <Localized
                    en="Some lines are quote-only."
                    hi="कुछ lines रेट-पूछने वाली हैं।"
                  />
                </p>
              )}
            </div>
            <p className="max-w-[15rem] text-right text-[0.68rem] leading-relaxed text-muted-foreground">
              <Localized
                en="Estimate covers listed-priced items only. Listed rates are starting points — the shop confirms your best final rate on WhatsApp."
                hi="अनुमानित total सिर्फ़ लिस्टेड-रेट वाले items का है। लिस्टेड रेट शुरुआती हैं — फ़ाइनल बेस्ट रेट दुकान WhatsApp पर कन्फ़र्म करेगी।"
              />
            </p>
          </div>
        </section>

        <section
          aria-labelledby="channel-heading"
          className="order-1 lg:order-2 lg:sticky lg:top-28"
        >
          <h2 id="channel-heading" className="font-display text-2xl">
            <Localized
              en="Choose your order channel"
              hi="ऑर्डर का तरीका चुनें"
            />
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <Localized
              en="No card, UPI or payment is taken on this website."
              hi="इस वेबसाइट पर card, UPI या payment नहीं लिया जाता।"
            />
          </p>

          <div className="mt-4 space-y-3">
            <TrackedLink
              event="click_indiamart"
              params={{ source: "checkout", items: visibleLines.length }}
              href={indiaMartUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setStarted("indiamart")}
              className="group surface-card flex items-start gap-4 rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
                <StoreIcon className="size-5" aria-hidden />
              </span>
              <span className="flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-display text-xl">
                    <Localized
                      en="Purchase via IndiaMART"
                      hi="IndiaMART से ख़रीदें"
                    />
                  </span>
                  <ArrowRightIcon
                    className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  <Localized
                    en="Opens our IndiaMART seller listing in a new tab. Continue the order there."
                    hi="हमारी IndiaMART seller listing नए tab में खुलती है। ऑर्डर वहीं आगे बढ़ाएँ।"
                  />
                </span>
              </span>
            </TrackedLink>

            <TrackedLink
              event="click_whatsapp"
              params={{ source: "checkout", items: visibleLines.length }}
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setStarted("whatsapp")}
              className="group flex items-start gap-4 rounded-2xl border border-[#0d7a5f]/40 bg-[#0d7a5f] p-5 text-white shadow-[0_20px_40px_-24px_rgba(13,122,95,0.8)] transition-transform hover:-translate-y-0.5"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/15">
                <MessageCircleIcon className="size-5" aria-hidden />
              </span>
              <span className="flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-display text-xl">
                    <Localized
                      en="Fast Order via WhatsApp"
                      hi="WhatsApp से तुरंत ऑर्डर"
                    />
                  </span>
                  <ArrowRightIcon
                    className="size-4 text-white/70 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-white/75">
                  <Localized
                    en="Opens WhatsApp with every item, variant and quantity already written."
                    hi="WhatsApp खुलता है जिसमें हर item, वेरिएंट और मात्रा पहले से लिखी है।"
                  />
                </span>
              </span>
            </TrackedLink>
          </div>

          <details className="mt-3 rounded-2xl border border-border/70 bg-background/40 p-4">
            <summary className="cursor-pointer list-none text-xs font-semibold text-foreground [&::-webkit-details-marker]:hidden">
              <Localized
                en="Preview the WhatsApp message"
                hi="WhatsApp मैसेज की झलक"
              />
            </summary>
            <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
              {message}
            </p>
            <p className="mt-2 text-[0.68rem] leading-relaxed text-muted-foreground">
              The message is URL-encoded automatically and opens with every
              item, variant and quantity already filled in.
            </p>
          </details>

          <div className="mt-4 rounded-2xl border border-border/70 bg-card/50 p-4 sm:p-5">
            <p className="font-semibold text-foreground">
              <Localized
                en="Too busy to chat now?"
                hi="अभी बात करने का समय नहीं?"
              />
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              <Localized
                en="Leave your number — our team calls you back with your best rate and availability."
                hi="नंबर छोड़ें — टीम आपका बेस्ट रेट और उपलब्धता के साथ call back करेगी।"
              />
            </p>
            <CallBackForm source="checkout" className="mt-3 border-0 bg-transparent p-0 sm:p-0" />
          </div>

          <div className="mt-4 rounded-2xl border border-border/70 bg-card/50 p-4 text-xs leading-relaxed text-muted-foreground">
            <p className="font-semibold text-foreground">
              <Localized
                en="What happens next"
                hi="आगे क्या होता है"
              />
            </p>
            <ol className="mt-2 space-y-1.5">
              <li>
                1. The team confirms availability, pack size and the current
                rate.
              </li>
              <li>
                2. Your best final rate is confirmed on WhatsApp.
              </li>
              <li>
                3. Any next steps are agreed directly with the business.
              </li>
            </ol>
            <p className="mt-2 text-[0.68rem]">
              This website does not process payments and does not promise a
              delivery time.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
