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
            hi="Aapki order list khaali hai."
          />
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          <Localized
            en="Add a priced product to start an order. Items marked “Contact for Price” open a WhatsApp quote instead of a fake cart price."
            hi="Order shuru karne ke liye listed-price product add karein. “Contact for Price” items fake cart rate ke bajaye WhatsApp quote kholte hain."
          />
        </p>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <Link
            href="/products"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
          >
            <Localized en="Browse products" hi="Products dekhein" />
            <ArrowRightIcon className="size-4" aria-hidden />
          </Link>
          <Link
            href="/faq"
            className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-card/60 px-6 text-sm font-semibold"
          >
            <Localized en="How ordering works" hi="Ordering kaise hoti hai" />
          </Link>
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
            hi="Checkout · Koi payment gateway nahi"
          />
        </p>
        <h1 className="display-lg mt-2">
          <Localized en="Finish your order." hi="Order complete karein." />
        </h1>
        <p className="mt-3 text-[0.98rem] leading-relaxed text-muted-foreground">
          <Localized
            en="Choose one of two channels. Both open a new tab; your list stays saved in this browser until you clear it."
            hi="Do channels mein se ek chunein. Dono naya tab kholte hain; aapki list clear karne tak is browser mein saved rehti hai."
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
                    hi="Order enquiry shuru hui"
                  />
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {started === "whatsapp"
                    ? locale === "hi"
                      ? "WhatsApp tab mein message ready hai — send dabayein. Team confirm karegi."
                      : "Your WhatsApp tab has the message ready. Press send so the team can confirm."
                    : locale === "hi"
                      ? "IndiaMART tab khula hai. Listing par seller ke saath aage badhein."
                      : "The IndiaMART tab is open. Continue with the seller on the listing."}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                clear();
                toast.success(
                  locale === "hi" ? "Order list clear ho gayi" : "Order list cleared",
                );
              }}
              className="h-11 shrink-0 rounded-full"
            >
              <Trash2Icon className="size-4" aria-hidden />
              <Localized en="Clear order list" hi="Order list clear karein" />
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
              <Localized en="Order summary" hi="Order summary" />
            </h2>
            <button
              type="button"
              onClick={openCart}
              className="inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-primary"
            >
              <PencilIcon className="size-3.5" aria-hidden />
              <Localized en="Edit list" hi="List edit karein" />
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
                    <Localized en="Qty" hi="Qty" /> {line.qty}
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
                <Localized en="Estimated total" hi="Anumaanit total" />
              </p>
              <p className="font-display text-3xl">
                <span className="rupee">₹</span>
                {formatAmount(amount)}
              </p>
              {hasQuoteLines && (
                <p className="mt-1 text-xs text-primary">
                  <Localized
                    en="Some lines are quote-only."
                    hi="Kuch lines quote-only hain."
                  />
                </p>
              )}
            </div>
            <p className="max-w-[15rem] text-right text-[0.68rem] leading-relaxed text-muted-foreground">
              <Localized
                en="Estimate covers listed-priced items only. The final GST invoice is shared on confirmation."
                hi="Estimate sirf listed-price items ka hai. Final GST invoice confirm hone par bheja jayega."
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
              hi="Order channel chunein"
            />
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <Localized
              en="No card, UPI or payment is taken on this website."
              hi="Is website par card, UPI ya payment nahi liya jaata."
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
                      hi="IndiaMART se purchase karein"
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
                    hi="Hamari IndiaMART seller listing naye tab mein khulti hai. Order wahan aage badhayein."
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
                      hi="WhatsApp se fast order"
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
                    hi="WhatsApp khulta hai jisme har item, variant aur quantity pehle se likhi hai."
                  />
                </span>
              </span>
            </TrackedLink>
          </div>

          <details className="mt-3 rounded-2xl border border-border/70 bg-background/40 p-4">
            <summary className="cursor-pointer list-none text-xs font-semibold text-foreground [&::-webkit-details-marker]:hidden">
              <Localized
                en="Preview the WhatsApp message"
                hi="WhatsApp message preview"
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

          <div className="mt-4 rounded-2xl border border-border/70 bg-card/50 p-4 text-xs leading-relaxed text-muted-foreground">
            <p className="font-semibold text-foreground">
              <Localized
                en="What happens next"
                hi="Aage kya hota hai"
              />
            </p>
            <ol className="mt-2 space-y-1.5">
              <li>
                1. The team confirms availability, pack size and the current
                rate.
              </li>
              <li>
                2. The final GST invoice is shared after confirmation.
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
