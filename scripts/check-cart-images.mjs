import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

// 1. Featured order on home: first card is Pidicryl, then Dana, CMC, Chamki (no trowel).
await page.goto("http://localhost:3100/", { waitUntil: "networkidle0", timeout: 90000 });
const order = await page.evaluate(() =>
  [...document.querySelectorAll("section[aria-labelledby='featured-heading'] article h3")]
    .map((h) => h.textContent?.trim()),
);
console.log("featured order:", JSON.stringify(order));
console.log(order[0] === "Pidicryl 126 M by Pidilite" && order[1] === "Madrasi Dana Premium Wall Textures" && order[2] === "Carboxymethyl Cellulose (CMC) Powder" && order[3] === "Premium Chamki Powder (Glitter & Metallic Flakes)" && !order.includes("Stainless Steel Plastering Trowel (Gurmala)") ? "PASS featured order" : "FAIL featured order");

// 2. Add Red Madrasi from a card → cart line image is the RED bag.
await page.evaluate(() => {
  const card = [...document.querySelectorAll("article")].find((a) => a.textContent?.includes("Madrasi Dana"));
  const chip = [...(card?.querySelectorAll("button") || [])].find((b) => b.textContent?.trim() === "Red");
  chip?.click();
});
await new Promise((r) => setTimeout(r, 400));
await page.evaluate(() => {
  const card = [...document.querySelectorAll("article")].find((a) => a.textContent?.includes("Madrasi Dana"));
  [...card.querySelectorAll("button")].find((b) => b.getAttribute("aria-label")?.includes("Add to cart"))?.click();
});
await new Promise((r) => setTimeout(r, 700));
const lineImage = await page.evaluate(() => {
  const stored = JSON.parse(localStorage.getItem("gph-cart") || "{}");
  return stored?.state?.lines?.[0]?.image || null;
});
console.log("cart line image:", lineImage);
console.log(lineImage?.includes("madrasi-dana-red") ? "PASS red bag in cart" : "FAIL cart image");

// 3. Legacy cart (v2 payload with collective image) migrates to the variant bag.
await page.evaluate(() => {
  localStorage.setItem("gph-cart", JSON.stringify({
    state: { lines: [{ key: "gph-02::Red Madrasi Dana", productId: "gph-02", slug: "madrasi-dana-wall-texture", name: "Madrasi Dana Premium Wall Textures", variantLabel: "Red Madrasi Dana", qty: 2, displayPrice: "₹ 200/Bag", amount: 200, unit: "Bag", image: "/products/madrasi-dana.webp?v=6", tone: "terracotta" }] },
    version: 2,
  }));
});
await page.reload({ waitUntil: "networkidle0", timeout: 90000 });
await new Promise((r) => setTimeout(r, 800));
const migrated = await page.evaluate(() => {
  const stored = JSON.parse(localStorage.getItem("gph-cart") || "{}");
  return { version: stored.version, image: stored?.state?.lines?.[0]?.image };
});
console.log("migrated:", JSON.stringify(migrated));
console.log(migrated.version === 3 && migrated.image?.includes("madrasi-dana-red") ? "PASS legacy cart migrated to red bag" : "FAIL migration");

await browser.close();
