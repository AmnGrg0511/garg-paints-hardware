"use client";

import { useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlusIcon, ArrowUpRightIcon } from "lucide-react";
import { toast } from "sonner";
import { parsePrice, getUnitLabel } from "@/lib/pricing";
import { quoteWhatsappUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";
import { dispatchFlyToCart, prefersReducedMotion } from "@/lib/ui-events";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useVariantSelection } from "@/store/variant-selection";
import { useLocale } from "@/i18n/LocaleProvider";
import { Localized } from "@/i18n/Localized";
import { TrackedLink } from "@/components/analytics/tracked-link";

const toneTint = {
  terracotta: "#A84328",
  peach: "#F0A868",
  slate: "#5F6F7D",
  gold: "#E9B84B",
  cream: "#F2ECDD",
} as const;

/**
 * Slim card DTO. Cards hydrate on every listing page, so they receive only
 * the fields they render — never the full catalogue entry (FAQs, guides and
 * long summaries stay server-only and out of the flight payload).
 */
export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  kind: "simple" | "variant";
  category: string;
  description: string;
  image: string;
  imageAlt: string;
  tone: "terracotta" | "peach" | "slate" | "gold" | "cream";
  price?: string;
  variants?: readonly {
    label: string;
    price: string;
    image?: string;
    tint?: string;
  }[];
};

export function ProductCard({
  product,
  priority = false,
  compact = false,
}: {
  product: ProductCardData;
  priority?: boolean;
  compact?: boolean;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const addItem = useCartStore((state) => state.addItem);
  const selectVariant = useVariantSelection((state) => state.select);
  const { t } = useLocale();

  const [selectedLabel, setSelectedLabel] = useState<string | null>(
    product.kind === "variant" ? product.variants?.[0]?.label ?? null : null,
  );

  const selectedVariant:
    | { label: string; price: string; image?: string; tint?: string }
    | null =
    product.kind === "variant"
      ? product.variants?.find((variant) => variant.label === selectedLabel) ??
        product.variants?.[0] ??
        null
      : null;

  const variantImage = selectedVariant?.image ?? product.image;
  const variantImageAlt = selectedVariant
    ? `${selectedVariant.label} — ${product.name}`
    : product.imageAlt;
  const variantTint = selectedVariant?.tint ?? toneTint[product.tone];

  const displayPrice =
    product.kind === "variant"
      ? selectedVariant?.price ?? "Contact for Price"
      : (product.price ?? "");
  const price = parsePrice(displayPrice);

  const resetTilt = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--ty", "0px");
  };

  const handleTouchLift = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "touch" || prefersReducedMotion()) return;
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--ty", "-3px");
  };

  const handleAdd = () => {
    if (price.onRequest) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variantLabel: selectedVariant?.label ?? null,
      displayPrice,
      amount: price.amount ?? null,
      unit: price.unit ?? null,
      image: variantImage,
      tone: product.tone,
      qty: 1,
    });

    trackEvent("add_to_cart", {
      item_id: product.id,
      item_name: product.name,
      variant: selectedVariant?.label ?? null,
      quantity: 1,
      value: price.amount ?? 0,
      currency: "INR",
    });

    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      dispatchFlyToCart({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        tone: product.tone,
      });
    }

    toast.success(t("common.added"), {
      description: selectedVariant
        ? `${product.name} — ${selectedVariant.label}`
        : product.name,
    });
  };

  return (
    <article
      ref={cardRef}
      onPointerDown={handleTouchLift}
      onPointerUp={resetTilt}
      onPointerCancel={resetTilt}
      className="surface-card group relative flex h-full flex-col overflow-hidden rounded-2xl transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_hsl(var(--shadow-color)/0.28)]"
    >
      <div
        className={cn(
          "relative aspect-square overflow-hidden",
        )}
      >
        <Link
          href={`/products/${product.slug}`}
          className="absolute inset-0 z-10"
          aria-label={`View ${product.name}`}
        >
          <span className="sr-only">{product.name}</span>
        </Link>
        {/* Dim backdrop in the selected shade — never invented, only the
            variant's own colour, dimmed and softened. */}
        <div
          className="dana-texture absolute inset-0 transition-colors duration-500"
          style={{
            background: `linear-gradient(165deg, ${variantTint}38 0%, ${variantTint}14 55%, transparent 100%)`,
          }}
          aria-hidden
        />
        <div
          className="absolute inset-3 overflow-hidden rounded-xl"
          aria-hidden
        >
          <Image
            key={variantImage}
            src={variantImage}
            alt={variantImageAlt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 32vw, (min-width: 640px) 46vw, 92vw"
            className="object-cover"
          />
        </div>
        <span className="absolute left-3 top-3 z-20 rounded-full bg-white px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-[#15203B] shadow-sm">
          {product.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[1.05rem] font-bold leading-snug tracking-tight sm:text-lg">
            <Link
              href={`/products/${product.slug}`}
              className="transition-colors hover:text-primary"
            >
              {product.name}
            </Link>
          </h3>
          <Link
            href={`/products/${product.slug}`}
            aria-label={`Details for ${product.name}`}
            className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-border/80 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowUpRightIcon className="size-3.5" aria-hidden />
          </Link>
        </div>

        {!compact && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        )}

        {product.kind === "variant" && (
          <div
            className="mt-3 flex flex-wrap gap-1.5"
            role="group"
            aria-label={`${product.name} variants`}
          >
            {(product.variants ?? []).map((variant) => {
              const isSelected = selectedVariant?.label === variant.label;
              return (
                <button
                  key={variant.label}
                  type="button"
                  onClick={() => {
                    setSelectedLabel(variant.label);
                    selectVariant(product.id, variant.label);
                  }}
                  aria-pressed={isSelected}
                  className={cn(
                    "min-h-9 rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
                  )}
                >
                  {variant.label.replace(" Madrasi Dana", "").replace(" CMC Powder", "").replace(" Chamki Powder", "")}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div aria-live="polite">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {price.onRequest ? t("common.quoteOnly") : "Listed price"}
            </p>
            <p className="mt-0.5 text-xl font-extrabold tracking-tight sm:text-2xl">
              {price.onRequest ? (
                <span className="text-base font-bold">{t("common.priceOnRequest")}</span>
              ) : (
                <>
                  <span className="rupee">₹</span>
                  {new Intl.NumberFormat("en-IN").format(price.amount ?? 0)}
                  <span className="ml-1 text-xs font-semibold text-muted-foreground">
                    /{getUnitLabel(price.unit)}
                  </span>
                </>
              )}
            </p>
          </div>

          {price.onRequest ? (
            <TrackedLink
              event="click_whatsapp"
              params={{ source: "product_card_quote", item: product.name }}
              href={quoteWhatsappUrl(product.name, selectedVariant?.label)}
              target="_blank"
              rel="noopener noreferrer"
              className="dana-texture inline-flex min-h-11 max-w-[9.5rem] items-center justify-center rounded-full bg-[#0d7a5f] px-3 text-center text-xs font-bold leading-tight text-white transition-transform hover:brightness-110 active:scale-[0.98]"
            >
              <Localized en="Request quote" hi="Rate poochein" />
            </TrackedLink>
          ) : (
            <button
              ref={buttonRef}
              type="button"
              onClick={handleAdd}
              className="dana-texture inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
              aria-label={`${t("common.addToCart")}: ${product.name}${selectedVariant ? `, ${selectedVariant.label}` : ""}`}
            >
              <PlusIcon className="size-4" aria-hidden />
              <Localized en="Add to cart" hi="Cart mein daalein" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
