import { products } from "@/config/effective-catalog";
import { products as baseProducts } from "@/config/businessData";
import type { Product } from "@/config/effective-catalog";
import { parsePrice } from "@/lib/pricing";
/**
 * Command engine for @GargPaintsBot — the shop's rate-control channel.
 *
 * The owner chats with the bot the way they would dictate a price change:
 *
 *   /rates                    — current rates, live on the site
 *   /price madrasi white 165  — set a variant rate
 *   /price pidicryl 6800      — set a simple-product rate
 *   /quote cmc yellow         — back to "Contact for …" (repo copy)
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

const PRODUCT_ALIASES: Record<string, string> = {
  pidicryl: "gph-01",
  binder: "gph-01",
  "126m": "gph-01",
  madrasi: "gph-02",
  dana: "gph-02",
  texture: "gph-02",
  trowel: "gph-03",
  gurmala: "gph-03",
  cmc: "gph-04",
  chamki: "gph-05",
  glitter: "gph-05",
};

const HELP = [
  "Rate control for the website. Commands:",
  "",
  "/rates — current rates shown on the site",
  "/price <product> <rate> — e.g. /price trowel 80",
  "/price <product> <shade> <rate> — e.g. /price madrasi white 165",
  "/quote <product> [shade] — back to Contact-for-price",
  "/reset — clear every override, back to repo copy",
  "",
  "Product keys: pidicryl, madrasi (dana), trowel (gurmala), cmc, chamki",
  "Shades: white, red, yellow, green, black, golden, silver",
  "",
  "A change commits to the repo and goes live in about a minute.",
].join("\n");

function findProduct(token: string): Product | undefined {
  const t = token.toLowerCase().replace(/^gph[- ]?0?(\d)$/i, "gph-0$1");
  const byIdOrSlug = products.find(
    (p) => p.id === t || p.slug === t,
  );
  if (byIdOrSlug) return byIdOrSlug;
  const alias = PRODUCT_ALIASES[t];
  if (alias) return products.find((p) => p.id === alias);
  const hits = products.filter(
    (p) =>
      p.name.toLowerCase().includes(t) || p.slug.toLowerCase().includes(t),
  );
  return hits.length === 1 ? hits[0] : undefined;
}

function findVariant(product: Product, token: string) {
  if (product.kind !== "variant") return undefined;
  const t = token.toLowerCase();
  const hits = product.variants.filter((v) =>
    v.label.toLowerCase().includes(t),
  );
  return hits.length === 1 ? hits[0] : undefined;
}

function listVariants(product: Product): string {
  if (product.kind !== "variant") return "";
  return product.variants
    .map((v) => `  ${v.label} — ${v.price}`)
    .join("\n");
}

function listProducts(): string {
  return products
    .map((p) =>
      p.kind === "variant"
        ? `• ${p.name}\n${listVariants(p)}`
        : `• ${p.name} — ${p.price}`,
    )
    .join("\n");
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
        reply: `No product matches "${args[0]}". Known keys: pidicryl, madrasi, trowel, cmc, chamki.`,
      };
    }

    if (isQuote) {
      const variantToken = args[1];
      if (product.kind === "variant") {
        if (!variantToken) {
          return {
            reply: `${product.name} has shades:\n${listVariants(product)}\n\nWhich one? Example: /quote cmc white`,
          };
        }
        const variant = findVariant(product, variantToken);
        if (!variant) {
          return {
            reply: `No shade matches "${variantToken}" on ${product.name}. Shades:\n${listVariants(product)}`,
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
            reply: `${variant.label} is already quote-only (${quotePrice}). No change.`,
          };
        }
        const file = withRate(current, product, variant.label, quotePrice);
        return {
          reply: `✅ ${variant.label}\n${variant.price} → ${quotePrice}\nCommitting to the repo — live on the site in about a minute.`,
          change: {
            message: `Rate via bot: ${variant.label} → quote-only (${quotePrice})`,
            summary: `${variant.label}: ${variant.price} → ${quotePrice}`,
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
        reply: `✅ ${product.name}\n${product.price} → ${price}\nCommitting to the repo — live on the site in about a minute.`,
        change: {
          message: `Rate via bot: ${product.name} → ${price}`,
          summary: `${product.name}: ${product.price} → ${price}`,
          content: serialize(file),
        },
      };
    }

    const variantToken = args.length >= 3 ? args[args.length - 2] : null;
    if (!variantToken) {
      return {
        reply: `${product.name} has shades:\n${listVariants(product)}\n\nWhich one? Example: /price madrasi white 165`,
      };
    }
    const variant = findVariant(product, variantToken);
    if (!variant) {
      return {
        reply: `No shade matches "${variantToken}" on ${product.name}. Shades:\n${listVariants(product)}`,
      };
    }
    const price = formatRate(amount, product.quantity.unit);
    const file = withRate(current, product, variant.label, price);
    return {
      reply: `✅ ${variant.label}\n${variant.price} → ${price}\nCommitting to the repo — live on the site in about a minute.`,
      change: {
        message: `Rate via bot: ${variant.label} → ${price}`,
        summary: `${variant.label}: ${variant.price} → ${price}`,
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
