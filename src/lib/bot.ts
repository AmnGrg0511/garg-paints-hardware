import { products } from "@/config/effective-catalog";
import { products as baseProducts } from "@/config/businessData";
import type { Product } from "@/config/effective-catalog";
import { parsePrice } from "@/lib/pricing";

/**
 * Command engine for @GargPaintsBot — the shop's rate-control channel.
 *
 * The owner chats with the bot the way they would dictate a price change.
 * What /rates shows is exactly what the commands accept:
 *
 *   pidicryl - ₹ 6,500/Drum
 *   madrasi white - ₹ 150/Bag
 *   ...
 *
 *   /rates                    — the list above
 *   /price madrasi white 165  — set a variant rate
 *   /price pidicryl 6800      — set a simple-product rate
 *   /quote cmc yellow         — back to "Contact for …"
 *   /reset                    — clear every override
 *   /help
 *
 * This module is pure: it parses, validates and computes the new overrides
 * file content. Networking (Telegram reply, GitHub commit) lives in the
 * webhook route, so every branch here is unit-testable without a network.
 */

export type OverridesFile = {
  version: number;
  updatedAt: string | null;
  rates: Record<
    string,
    { price?: string; variants?: Record<string, string> }
  >;
};

export type RateChange = {
  /** Git commit message. */
  message: string;
  /** Human summary of what changed (already in the reply). */
  summary: string;
  /** Full new content of catalog.overrides.json. */
  content: string;
};

export type BotOutcome = {
  reply: string;
  change?: RateChange;
};

/** Short chat keys per product — what the owner types and sees. */
const PRODUCT_KEYS: { id: string; key: string; aliases: string[] }[] = [
  { id: "gph-01", key: "pidicryl", aliases: ["binder", "126m", "126"] },
  { id: "gph-02", key: "madrasi", aliases: ["dana", "texture"] },
  { id: "gph-03", key: "trowel", aliases: ["gurmala"] },
  { id: "gph-04", key: "cmc", aliases: [] },
  { id: "gph-05", key: "chamki", aliases: ["glitter"] },
];

function productKey(productId: string): string {
  return PRODUCT_KEYS.find((entry) => entry.id === productId)?.key ?? productId;
}

/** Variant short key = the distinguishing first word of the label. */
function variantKey(label: string): string {
  return label.split(/\s+/)[0].toLowerCase();
}

function variantKeys(product: Product): string {
  if (product.kind !== "variant") return "";
  return product.variants.map((v) => variantKey(v.label)).join(", ");
}

function findProduct(token: string): Product | undefined {
  const t = token.toLowerCase().replace(/^gph[- ]?0*(\d)$/i, "gph-0$1");
  const mapped = PRODUCT_KEYS.find(
    (entry) => entry.key === t || entry.aliases.includes(t),
  );
  if (mapped) return products.find((p) => p.id === mapped.id);
  const byIdOrSlug = products.find((p) => p.id === t || p.slug === t);
  if (byIdOrSlug) return byIdOrSlug;
  const hits = products.filter((p) => p.name.toLowerCase().includes(t));
  return hits.length === 1 ? hits[0] : undefined;
}

function findVariant(product: Product, token: string) {
  if (product.kind !== "variant") return undefined;
  const t = token.toLowerCase();
  const exact = product.variants.find((v) => variantKey(v.label) === t);
  if (exact) return exact;
  const hits = product.variants.filter((v) =>
    v.label.toLowerCase().includes(t),
  );
  return hits.length === 1 ? hits[0] : undefined;
}

/** One display line in the same terms the commands use. */
function rateLine(product: Product, variant?: { label: string; price: string }): string {
  const key = productKey(product.id);
  if (variant) return `${key} ${variantKey(variant.label)} - ${variant.price}`;
  if (product.kind === "variant") {
    return product.variants
      .map((v) => `${key} ${variantKey(v.label)} - ${v.price}`)
      .join("\n");
  }
  return `${key} - ${product.price}`;
}

function listProducts(): string {
  return products.map((product) => rateLine(product)).join("\n");
}

function parseRate(token: string): number | null {
  const digits = token.replace(/[₹,\s]/g, "");
  if (!/^\d+$/.test(digits)) return null;
  const n = Number(digits);
  return n >= 1 && n <= 10_000_000 ? n : null;
}

function formatRate(amount: number, unit: string): string {
  return `₹ ${amount.toLocaleString("en-IN")}/${unit}`;
}

function serialize(file: OverridesFile): string {
  return `${JSON.stringify(file, null, 2)}\n`;
}

function baseVariantQuote(product: Product, label: string): string | null {
  const base = baseProducts.find((p) => p.id === product.id);
  if (!base || base.kind !== "variant") return null;
  return base.variants.find((v) => v.label === label)?.price ?? null;
}

function withRate(
  current: OverridesFile,
  product: Product,
  variantLabel: string | null,
  newPrice: string,
): OverridesFile {
  const rates = { ...current.rates };
  const entry = { ...rates[product.id] };
  if (variantLabel === null) {
    entry.price = newPrice;
    delete entry.variants;
  } else {
    const variants = { ...entry.variants };
    variants[variantLabel] = newPrice;
    entry.variants = variants;
    if (entry.price === undefined) delete entry.price;
  }
  rates[product.id] = entry;
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    rates,
  };
}

const HELP = [
  "Rate control for the website. What /rates shows is what you type:",
  "",
  "/rates — current rates",
  "/price pidicryl 6800",
  "/price madrasi white 165",
  "/quote madrasi green — back to Contact for Price",
  "/reset — clear every override",
  "",
  "Products: pidicryl, madrasi, trowel, cmc, chamki",
  "Shades come from the first word of each shade in /rates.",
  "",
  "A change commits to the repo and goes live in about a minute.",
].join("\n");

export function handleBotCommand(
  text: string,
  current: OverridesFile = { version: 1, updatedAt: null, rates: {} },
): BotOutcome {
  const parts = text.trim().split(/\s+/);
  const command = (parts[0] ?? "").toLowerCase().split("@")[0];
  const args = parts.slice(1);

  if (command === "/help" || command === "/start") {
    return { reply: HELP };
  }

  if (command === "/rates" || (command === "/price" && args.length === 0)) {
    return {
      reply: `Current rates on the site:\n\n${listProducts()}\n\nUpdate: /price <product> <rate>\nShade: /price madrasi white 165\nQuote-only: /quote cmc white\nReset: /reset`,
    };
  }

  if (command === "/price" || command === "/quote") {
    const isQuote = command === "/quote";

    if (args.length === 0) {
      return { reply: `Which product? Example: /price madrasi white 165\n\n${listProducts()}` };
    }

    const product = findProduct(args[0]);
    if (!product) {
      return {
        reply: `No product matches "${args[0]}". Known products: ${PRODUCT_KEYS.map((p) => p.key).join(", ")}.`,
      };
    }

    if (isQuote) {
      const variantToken = args[1];
      if (product.kind === "variant") {
        if (!variantToken) {
          return {
            reply: `${productKey(product.id)} shades: ${variantKeys(product)}\nWhich one? Example: /quote cmc white`,
          };
        }
        const variant = findVariant(product, variantToken);
        if (!variant) {
          return {
            reply: `No shade "${variantToken}" on ${productKey(product.id)}. Shades: ${variantKeys(product)}`,
          };
        }
        const basePrice = baseVariantQuote(product, variant.label);
        // If the repo copy for this shade is itself quote-only, restore it
        // verbatim ("Contact for Bulk Quote" etc.); otherwise fall back to
        // the generic quote-only copy.
        const quotePrice =
          basePrice && parsePrice(basePrice).onRequest
            ? basePrice
            : "Contact for Price";
        if (variant.price === quotePrice) {
          return {
            reply: `${productKey(product.id)} ${variantKey(variant.label)} is already quote-only (${quotePrice}). No change.`,
          };
        }
        const file = withRate(current, product, variant.label, quotePrice);
        return {
          reply: `✅ ${productKey(product.id)} ${variantKey(variant.label)}\n${variant.price} → ${quotePrice}\nCommitting to the repo — live on the site in about a minute.`,
          change: {
            message: `Rate via bot: ${variant.label} → quote-only (${quotePrice})`,
            summary: `${productKey(product.id)} ${variantKey(variant.label)}: ${variant.price} → ${quotePrice}`,
            content: serialize(file),
          },
        };
      }
      return { reply: `${product.name} has a single rate — mark it quote-only by removing the price in the repo, or use /price ${args[0]} <rate>.` };
    }

    // /price <product> [variant] <rate>
    const last = args[args.length - 1];
    const amount = parseRate(last);
    if (amount === null) {
      return {
        reply: `"${last}" is not a rate. Use a number, e.g. /price madrasi white 165.`,
      };
    }

    if (product.kind === "simple") {
      if (args.length > 2) {
        return { reply: `${product.name} has a single rate. Use: /price ${args[0]} <rate>` };
      }
      const price = formatRate(amount, product.quantity.unit);
      const file = withRate(current, product, null, price);
      return {
        reply: `✅ ${productKey(product.id)}\n${product.price} → ${price}\nCommitting to the repo — live on the site in about a minute.`,
        change: {
          message: `Rate via bot: ${product.name} → ${price}`,
          summary: `${productKey(product.id)}: ${product.price} → ${price}`,
          content: serialize(file),
        },
      };
    }

    const variantToken = args.length >= 3 ? args[args.length - 2] : null;
    if (!variantToken) {
      return {
        reply: `${productKey(product.id)} shades: ${variantKeys(product)}\nWhich one? Example: /price madrasi white 165`,
      };
    }
    const variant = findVariant(product, variantToken);
    if (!variant) {
      return {
        reply: `No shade "${variantToken}" on ${productKey(product.id)}. Shades: ${variantKeys(product)}`,
      };
    }
    const price = formatRate(amount, product.quantity.unit);
    const file = withRate(current, product, variant.label, price);
    return {
      reply: `✅ ${productKey(product.id)} ${variantKey(variant.label)}\n${variant.price} → ${price}\nCommitting to the repo — live on the site in about a minute.`,
      change: {
        message: `Rate via bot: ${variant.label} → ${price}`,
        summary: `${productKey(product.id)} ${variantKey(variant.label)}: ${variant.price} → ${price}`,
        content: serialize(file),
      },
    };
  }

  if (command === "/reset") {
    const file: OverridesFile = { version: 1, updatedAt: null, rates: {} };
    return {
      reply: "✅ All overrides cleared. The site goes back to the repo copy — live in about a minute.",
      change: {
        message: "Rate via bot: reset all overrides to repo copy",
        summary: "All overrides cleared",
        content: serialize(file),
      },
    };
  }

  return {
    reply: `Use /rates, /price, /quote, /reset or /help.\n\n${HELP}`,
  };
}
