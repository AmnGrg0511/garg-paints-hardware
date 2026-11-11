"use client";

import { useRef, useState } from "react";
import { ShoppingBagIcon } from "lucide-react";
import { toast } from "sonner";
import type { Product, ProductVariant } from "@/config/businessData";
import { getQuantityConfig, parsePrice, getUnitLabel } from "@/lib/pricing";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { quoteWhatsappUrl, callUrl, indiaMartUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";
import {
  dispatchCartGlow,
  dispatchFlyToCart,
  prefersReducedMotion,
} from "@/lib/ui-events";
import { useCartStore } from "@/store/cart";
import { useVariantSelection } from "@/store/variant-selection";
import { useLocale } from "@/i18n/LocaleProvider";
import { Localized } from "@/i18n/Localized";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/analytics/tracked-link";

export function ProductDetailActions({ product }: { product: Product }) {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(
    product.kind === "variant" ? product.variants[0]?.label ?? null : null,
  );
  const selectVariant = useVariantSelection((state) => state.select);
  const chooseVariant = (label: string) => {
    setSelectedLabel(label);
    selectVariant(product.id, label);
  };
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const quantityConfig = getQuantityConfig(product.id);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const { t } = useLocale();

  const selectedVariant: ProductVariant | null =
    product.kind === "variant"
      ? product.variants.find((variant) => variant.label === selectedLabel) ??
        product.variants[0] ??
        null
      : null;

  const displayPrice =
    product.kind === "variant"
      ? selectedVariant?.price ?? "Contact for Price"
      : product.price;
  const price = parsePrice(displayPrice);

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
      image: selectedVariant?.image ?? product.image,
      tone: product.tone,
      qty,
    });

    trackEvent("add_to_cart", {
      item_id: product.id,
      item_name: product.name,
      variant: selectedVariant?.label ?? null,
      quantity: qty,
      value: (price.amount ?? 0) * qty,
      currency: "INR",
    });

    const rect = addButtonRef.current?.getBoundingClientRect();
    if (rect && !prefersReducedMotion()) {
      dispatchFlyToCart({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        tone: product.tone,
      });
    }

    dispatchCartGlow();

    toast.success(t("common.added"), {
      duration: 2200,
      description: `${selectedVariant ? `${selectedVariant.label} × ` : ""}${qty}`,
    });
  };

  return (
    <div className="mt-6 space-y-4">
      {product.kind === "variant" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Localized en="Choose a variant" hi="वेरिएंट चुनें" />
          </p>
          <div
            className="mt-2 grid gap-2 sm:grid-cols-2"
            role="group"
            aria-label={`${product.name} variants`}
          >
            {product.variants.map((variant) => {
              const variantPrice = parsePrice(variant.price);
              const isSelected = selectedVariant?.label === variant.label;
              return (
                <button
                  key={variant.label}
                  type="button"
                  onClick={() => chooseVariant(variant.label)}
                  aria-pressed={isSelected}
                  className={cn(
                    "min-h-12 rounded-2xl border px-3.5 py-2.5 text-left transition-colors",
                    isSelected
                      ? "border-primary bg-secondary ring-1 ring-primary/30"
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                    {variant.label}
                    <span className="text-xs font-medium text-primary">
                      {variantPrice.onRequest
                        ? t("common.quoteOnly")
                        : variantPrice.display}
                    </span>
                  </span>
                  {variant.description && (
                    <span className="mt-1 block text-[0.72rem] leading-snug text-muted-foreground">
                      {variant.description}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-end justify-between gap-3" aria-live="polite">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
              {price.onRequest ? t("common.quoteOnly") : "Listed price"}
            </p>
            <p className="font-display text-3xl tracking-tight">
              {price.onRequest ? (
                <span className="text-xl">{t("common.priceOnRequest")}</span>
              ) : (
                <>
                  <span className="rupee">₹</span>
                  {new Intl.NumberFormat("en-IN").format(price.amount ?? 0)}
                  <span className="ml-1 text-sm font-sans font-medium text-muted-foreground">
                    /{getUnitLabel(price.unit)}
                  </span>
                </>
              )}
            </p>
          </div>

          <QuantityStepper
            value={qty}
            onChange={setQty}
            steps={quantityConfig.steps}
            max={quantityConfig.max}
            label={`Quantity in ${quantityConfig.unit.toLowerCase()}${quantityConfig.unit === "Kg" ? "s" : "s"}`}
          />
        </div>

        {quantityConfig.note && (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {quantityConfig.note}
          </p>
        )}
        <div className="mt-4 space-y-2.5">
          {price.onRequest ? (
            <>
              <Button
                render={
                  <TrackedLink
                    event="click_whatsapp"
                    params={{
                      source: "product_detail_quote",
                      item: product.name,
                      variant: selectedVariant?.label ?? "",
                    }}
                    href={quoteWhatsappUrl(
                      product.name,
                      selectedVariant?.label,
                      qty,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                className="h-12 w-full rounded-full bg-[#0d7a5f] text-sm font-bold text-white hover:bg-[#0b6a52]"
              >
                {t("common.requestQuoteWhatsApp")}
              </Button>
              <p className="text-center text-[0.7rem] leading-relaxed text-muted-foreground">
                <Localized
                  en="This item has no published price. The team replies with pack sizes and a bulk rate on WhatsApp."
                  hi="इस item का रेट सूचित नहीं है। टीम WhatsApp पर pack size और बल्क रेट भेजेगी।"
                />
              </p>
            </>
          ) : (
            <Button
              ref={addButtonRef}
              onClick={handleAdd}
              className="h-12 w-full rounded-full text-sm font-bold"
            >
              <ShoppingBagIcon className="size-4" aria-hidden />
              {t("common.addToCart")}
            </Button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <TrackedLink
              event="click_call"
              params={{ source: "product_detail", item: product.name }}
              href={callUrl}
              className="inline-flex min-h-11 items-center justify-center dana-texture rounded-full border border-border bg-card px-3 text-xs font-semibold transition-colors hover:bg-secondary"
            >
              {t("common.call")}
            </TrackedLink>
            <TrackedLink
              event="click_indiamart"
              params={{ source: "product_detail", item: product.name }}
              href={indiaMartUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center dana-texture rounded-full border border-border bg-card px-3 text-xs font-semibold transition-colors hover:bg-secondary"
            >
              IndiaMART
            </TrackedLink>
          </div>
        </div>

        <p className="mt-3 text-center text-[0.68rem] leading-relaxed text-muted-foreground">
          <Localized
            en="Estimated total shown in the order list. Final GST invoice is shared on confirmation."
            hi="ऑर्डर लिस्ट में अनुमानित total दिखेगा। फ़ाइनल GST invoice कन्फ़र्म होने पर भेजा जाएगा।"
          />
        </p>
      </div>
    </div>
  );
}
