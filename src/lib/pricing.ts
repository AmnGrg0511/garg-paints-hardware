import { products, type PriceType, type Product, type ProductVariant } from "@/config/effective-catalog";

export type PriceInfo = {
  amount?: number;
  unit?: string;
  display: string;
  onRequest: boolean;
};

const PRICE_PATTERN = /₹\s*([\d,]+)(?:\s*\/\s*([A-Za-z]+))?/;

/**
 * Normalises an owner-facing price string such as "₹ 130/Kg" or
 * "Contact for Bulk Quote" into a structured value. Never invents a price:
 * anything without a rupee figure is marked `onRequest`.
 */
export function parsePrice(display: string): PriceInfo {
  const match = display.match(PRICE_PATTERN);

  if (!match) {
    return { display, onRequest: true };
  }

  return {
    display,
    amount: Number(match[1].replace(/,/g, "")),
    unit: match[2],
    onRequest: false,
  };
}

export function getVariantPrice(
  product: Product,
  variantLabel: string,
): PriceInfo | null {
  if (product.kind !== "variant") return null;
  const variant = product.variants.find((item) => item.label === variantLabel);
  return variant ? parsePrice(variant.price) : null;
}

export function getDefaultVariant(
  product: Product,
): ProductVariant | undefined {
  return product.kind === "variant" ? product.variants[0] : undefined;
}

/** True when no item or variant in the product has a numeric price. */
export function isQuoteOnly(product: Product): boolean {
  if (product.kind === "simple") return parsePrice(product.price).onRequest;
  return product.variants.every((variant) => parsePrice(variant.price).onRequest);
}

export function getPriceType(product: Product): PriceType {
  if (product.kind === "simple") {
    return parsePrice(product.price).onRequest
      ? "Quote on request"
      : "Listed price";
  }

  const priced = product.variants.filter(
    (variant) => !parsePrice(variant.price).onRequest,
  ).length;

  if (priced === 0) return "Quote on request";
  return "Listed price";
}

/** Human label for the price-type filter, including mixed variant pricing. */
export function getPriceTypeLabel(product: Product): string {
  if (product.kind === "variant") {
    const priced = product.variants.filter(
      (variant) => !parsePrice(variant.price).onRequest,
    ).length;
    if (priced > 0 && priced < product.variants.length) {
      return "Listed and quote variants";
    }
  }
  return getPriceType(product);
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    amount,
  );
}

export function getUnitLabel(unit?: string): string {
  if (!unit) return "";
  if (unit.toLowerCase() === "piece") return "piece";
  return unit;
}

/** Ordering config for a product: unit, bulk steps, sensible maximum. */
export function getQuantityConfig(productId: string): {
  unit: string;
  steps: readonly number[];
  max: number;
  note?: string;
} {
  const product = products.find((item) => item.id === productId);
  return (
    product?.quantity ?? { unit: "Piece", steps: [1, 10], max: 99 }
  );
}
