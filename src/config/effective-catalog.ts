import rawOverrides from "../../catalog.overrides.json";
import {
  products as baseProducts,
  type Product,
} from "./businessData";

/**
 * The live catalogue: repo defaults merged with rate overrides committed
 * through the Telegram bot (catalog.overrides.json at the repo root).
 *
 * Every UI surface must read `products` from HERE — never from
 * `@/config/businessData` directly — so a rate change made from the shop
 * owner's phone reaches the entire site on the next deploy. `businessData`
 * remains the owner-approved base copy; the bot never invents products,
 * labels, art or copy, only price strings.
 *
 * The overrides file is a tracked, build-time import: the bot commits it,
 * Vercel rebuilds on push, and every server and client surface — cards,
 * detail pages, JSON-LD offers, bulk chips, kit builder and cart — picks
 * up the new rates together.
 */
type OverridesFile = {
  version?: number;
  updatedAt?: string | null;
  rates?: Record<
    string,
    { price?: string; variants?: Record<string, string> }
  >;
};

const overrides = rawOverrides as OverridesFile;

function applyRate(product: Product): Product {
  const rate = overrides.rates?.[product.id];
  if (!rate) return product;
  if (product.kind === "simple") {
    return rate.price ? { ...product, price: rate.price } : product;
  }
  let changed = false;
  const variants = product.variants.map((variant) => {
    const price = rate.variants?.[variant.label];
    if (!price) return variant;
    changed = true;
    return { ...variant, price };
  });
  return changed ? { ...product, variants } : product;
}

export const products: readonly Product[] = baseProducts.map(applyRate);

export const productCategories = Array.from(
  new Set(products.map((product) => product.category)),
).sort();

export type {
  PriceType,
  Product,
  ProductVariant,
  SimpleProduct,
  VariantProduct,
} from "./businessData";
