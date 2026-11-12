/**
 * Verification for the two non-negotiable order paths.
 *
 * Run with `npm run verify`. This script intentionally imports the same
 * functions the UI uses, so a passing run proves the shipped code builds the
 * exact owner-approved text and encodes it correctly.
 */
import assert from "node:assert/strict";
import { business, products, SITE_URL, WHATSAPP_NUMBER } from "@/config/businessData";
import { isQuoteOnly, parsePrice } from "@/lib/pricing";
import { productSchema } from "@/lib/schema";
import { buildCartOrderMessage, whatsappUrl } from "@/lib/whatsapp";

const checks: string[] = [];

function check(name: string, fn: () => void) {
  fn();
  checks.push(name);
}

check("cart message matches the owner-approved template", () => {
  const message = buildCartOrderMessage([
    { name: "Pidicryl 126 M by Pidilite", qty: 2, unit: "Drum" },
    {
      name: "Madrasi Dana Premium Wall Textures",
      variant: "White Madrasi Dana",
      qty: 3,
      unit: "Bag",
    },
  ]);

  assert.equal(
    message,
    "Hello Mahesh,\n\nI want to purchase:\n• Pidicryl 126 M by Pidilite × 2 drums\n• Madrasi Dana Premium Wall Textures – White Madrasi Dana × 3 bags\n\nPlease confirm availability and share your best rate for this order.",
  );
});

check("no message ever contains the GST number", () => {
  const messages = [
    buildCartOrderMessage([{ name: "CMC Powder", qty: 1 }]),
    whatsappUrl("Hello Mahesh"),
  ];
  assert.ok(!JSON.stringify(messages).includes("06BQOPD1592H1ZR"));
  assert.ok(!JSON.stringify(messages).includes("GST%20"), "no GST token in encoded URLs");
});

check("WhatsApp URL uses the configured number and standard encoding", () => {
  const message = buildCartOrderMessage([
    { name: "CMC Powder", variant: "CMC 150", qty: 1 },
  ]);
  const href = whatsappUrl(message);

  assert.equal(
    href,
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
  );
  assert.equal(WHATSAPP_NUMBER, "919899284391");
  assert.ok(!href.includes(" "), "spaces must be percent-encoded");
  assert.ok(href.includes("%E2%80%93"), "en dash variant separator must be encoded");
  assert.ok(href.includes("%C3%97"), "multiplication sign must be encoded");
  assert.ok(href.includes("%0A"), "newlines must be encoded for the multi-line format");
});

check("prices parse only when a rupee figure exists", () => {
  assert.deepEqual(parsePrice("₹ 130/Kg"), {
    display: "₹ 130/Kg",
    amount: 130,
    unit: "Kg",
    onRequest: false,
  });
  assert.equal(parsePrice("₹ 1,250/Bag").amount, 1250);
  assert.equal(parsePrice("₹ 75/Piece").amount, 75);
  assert.equal(parsePrice("Contact for Price").onRequest, true);
  assert.equal(parsePrice("Contact for Bulk Quote").onRequest, true);
});

check("quote-only products never produce an Offer", () => {
  for (const product of products) {
    const schema = productSchema(product);
    const schemaText = JSON.stringify(schema);
    const hasOffer = schemaText.includes('"offers"');

    if (isQuoteOnly(product)) {
      assert.equal(hasOffer, false, `${product.name} must not have an Offer`);
    }
  }
});

check("variant offers exist only for numeric variant prices", () => {
  const madrasi = products.find((product) => product.id === "gph-02");
  assert.ok(madrasi && madrasi.kind === "variant");

  const schema = productSchema(madrasi);
  const variants = schema.hasVariant as Array<Record<string, unknown>>;
  assert.equal(variants.length, 5);

  const black = variants.find((variant) =>
    String(variant.name).includes("Black"),
  );
  assert.ok(black, "black variant must be present in schema");
  assert.equal(black?.offers, undefined, "quote-only black must not carry offers");
  const green = variants.find((variant) =>
    String(variant.name).includes("Green"),
  );
  assert.ok(green, "green variant must be present in schema");
  assert.equal(green?.offers, undefined, "quote-only green must not carry offers");

  const priced = variants.filter((variant) => variant.offers !== undefined);
  assert.equal(priced.length, 3);
  assert.deepEqual(
    priced.map((variant) => (variant.offers as { price: number }).price),
    [150, 200, 280],
  );
});

check("site URL is absolute and products use verified HSN placeholders", () => {
  assert.ok(SITE_URL.startsWith("https://"));
  for (const product of products) {
    assert.match(product.hsnCode, /^\d{4}$/);
    assert.ok(product.slug.length > 0);
  }
});

check("no GST rate or GST number appears in shipped copy", () => {
  const serialised = JSON.stringify({ business, products });
  assert.doesNotMatch(serialised, /\b(0|5|12|18|28)\s?%\s?GST\b/i);
  assert.doesNotMatch(serialised, /GST\s?(rate|@)\s?\d/i);
  assert.ok(!serialised.includes("06BQOPD1592H1ZR"));
});

console.log(`✓ ${checks.length} order-path checks passed`);
for (const name of checks) console.log(`  · ${name}`);
