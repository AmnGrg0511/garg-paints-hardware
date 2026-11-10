import {
  featuredProductIds,
  frequentlyBoughtTogether,
  products,
  type Product,
} from "@/config/businessData";
import type { ProductCardData } from "@/components/product/product-card";

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

/** Slim DTO for client-side cards: renders everything, ships nothing extra. */
export function toCardData(product: Product): ProductCardData {
  const base: ProductCardData = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    kind: product.kind,
    category: product.category,
    description: product.description,
    image: product.image,
    imageAlt: product.imageAlt,
    tone: product.tone,
  };
  if (product.kind === "variant") {
    return {
      ...base,
      kind: "variant",
      variants: product.variants.map((variant) => ({
        label: variant.label,
        price: variant.price,
        ...(variant.image ? { image: variant.image } : {}),
        ...(variant.tint ? { tint: variant.tint } : {}),
      })),
    };
  }
  return { ...base, kind: "simple", price: product.price };
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getFeaturedProducts(): ProductCardData[] {
  return featuredProductIds
    .map((id) => getProductById(id))
    .filter((product): product is Product => Boolean(product))
    .map(toCardData);
}

export function getFrequentlyBoughtTogether(product: Product): ProductCardData[] {
  return (frequentlyBoughtTogether[product.id] ?? [])
    .map((id) => getProductById(id))
    .filter((item): item is Product => Boolean(item))
    .map(toCardData);
}

export function getOtherProducts(product: Product): ProductCardData[] {
  return products
    .filter((item) => item.id !== product.id)
    .slice(0, 3)
    .map(toCardData);
}

export function getCatalogueCards(): ProductCardData[] {
  return products.map(toCardData);
}

export function getCategoryCounts(): { category: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
  }
  return Array.from(counts, ([category, count]) => ({ category, count })).sort(
    (a, b) => a.category.localeCompare(b.category),
  );
}
