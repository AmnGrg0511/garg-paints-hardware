"use client";

import { products, starterKit, type Product } from "@/config/businessData";
import { getQuantityConfig } from "@/lib/pricing";
import { WALL_SHADES } from "@/store/wall-shade";

/**
 * Starter-kit order behind the "Order this setup" button on both
 * visualizers: the picked dana shade bag, the chamki finish the visitor has
 * chosen, plus the standard companions — pidicryl drum, CMC kg and a
 * gurmala — so the basket is complete and reviewable in the order list.
 *
 * Quote-only kit items (CMC, chamki) are added as quote lines: they show
 * "Quote" in the list, never carry a fake amount, and are included in the
 * WhatsApp order message exactly as the owner approved.
 */
export type KitLine = {
  productId: string;
  slug: string;
  name: string;
  variantLabel: string | null;
  qty: number;
  displayPrice: string;
  amount: number | null;
  unit: string | null;
  image: string;
  tone: "terracotta" | "peach" | "slate" | "gold" | "cream";
};

const productById = (id: string): Product | undefined =>
  products.find((product) => product.id === id);

function lineFor(
  product: Product,
  variantLabel: string | null,
  qty: number,
): KitLine | null {
  const config = getQuantityConfig(product.id);
  const variant =
    product.kind === "variant"
      ? product.variants.find((item) => item.label === variantLabel) ?? null
      : null;
  const displayPrice = variant ? variant.price : product.price;
  const amount =
    Number((displayPrice ?? "").match(/₹\s*([\d,]+)/)?.[1]?.replace(/,/g, "")) ||
    null;
  const image = variant?.image ?? product.image;

  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    variantLabel: variant ? variant.label : null,
    qty,
    displayPrice: displayPrice ?? "",
    amount,
    unit: config.unit,
    image,
    tone: product.tone,
  };
}

/**
 * Builds the starter-kit lines for the currently shown wall shade and the
 * visitor's chamki finish choice.
 */
export function buildStarterKitLines(
  shadeIndex: number,
  chamkiColour: "gold" | "silver",
): { lines: KitLine[]; skipped: string[] } {
  const lines: KitLine[] = [];
  const skipped: string[] = [];

  const dana = productById("gph-02");
  const pidicryl = productById("gph-01");
  const cmc = productById("gph-04");
  const chamki = productById("gph-05");
  const gurmala = productById("gph-03");

  const shade = WALL_SHADES[shadeIndex] ?? WALL_SHADES[0];

  if (dana) {
    const label =
      dana.kind === "variant"
        ? dana.variants.find((variant) =>
            variant.label.startsWith(shade.name),
          )?.label ?? null
        : null;
    const line = lineFor(dana, label, starterKit.danaBags);
    if (line) lines.push(line);
    else skipped.push("Madrasi dana");
  }

  if (pidicryl) {
    const line = lineFor(pidicryl, null, starterKit.pidicrylDrums);
    if (line) lines.push(line);
  }

  if (cmc) {
    const label = cmc.kind === "variant" ? cmc.variants[0]?.label ?? null : null;
    const line = lineFor(cmc, label, starterKit.cmcKg);
    if (line) lines.push(line);
  }

  if (chamki) {
    const label =
      chamki.kind === "variant"
        ? chamki.variants.find((variant) =>
            variant.label.toLowerCase().startsWith(chamkiColour),
          )?.label ?? null
        : null;
    const line = lineFor(chamki, label, starterKit.chamkiKg);
    if (line) lines.push(line);
  }

  if (gurmala) {
    const line = lineFor(gurmala, null, starterKit.gurmalaPieces);
    if (line) lines.push(line);
  }

  return { lines, skipped };
}
