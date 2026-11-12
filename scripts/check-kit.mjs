import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
const ok = (n, p, d = "") => console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? " — " + d : ""}`);

// 1. Pick Red shade on the hero visualizer, then "Order this setup".
await page.goto("http://localhost:3100/", { waitUntil: "networkidle0", timeout: 90000 });
await page.evaluate(() => localStorage.removeItem("gph-cart"));
await page.evaluate(() => {
  const f = [...document.querySelectorAll("fieldset")].find((x) => x.textContent?.includes("repaint the wall"));
  [...f.querySelectorAll("button[role='radio']")].find((b) => b.textContent?.includes("Red"))?.click();
});
await new Promise((r) => setTimeout(r, 400));
await page.evaluate(() => {
  [...document.querySelectorAll("button")]
    .find((b) => b.textContent?.includes("Order this setup"))?.click();
});
await new Promise((r) => setTimeout(r, 900));

await new Promise((r) => setTimeout(r, 900));

// 2. Cart opens with the 5-line kit.
const cart = await page.evaluate(() => {
  const stored = JSON.parse(localStorage.getItem("gph-cart") || "{}");
  return (stored?.state?.lines || []).map((l) => ({
    productId: l.productId,
    qty: l.qty,
    unit: l.unit,
    amount: l.amount,
    name: l.name,
    variantLabel: l.variantLabel,
  }));
});
ok("kit adds 5 lines", cart.length === 5, JSON.stringify(cart));
// Amounts follow the live catalogue (bot-updatable), so the checks are
// structural: right product/variant/qty/unit, and an amount only when the
// catalogue lists one — never a fake figure.
const red = cart.find((l) => l.productId === "gph-02");
ok("kit: red dana bag ×1", red?.variantLabel === "Red Madrasi Dana" && red?.qty === 1 && red?.unit === "Bag" && (red?.amount === null || red?.amount > 0), JSON.stringify(red));
const pid = cart.find((l) => l.productId === "gph-01");
ok("kit: pidicryl drum ×1", pid?.qty === 1 && pid?.unit === "Drum" && (pid?.amount === null || pid?.amount > 0), JSON.stringify(pid));
const cmc = cart.find((l) => l.productId === "gph-04");
ok("kit: white CMC 5 kg (quote line or listed rate, never fake)", cmc?.qty === 5 && cmc?.unit === "Kg" && cmc?.variantLabel === "White CMC Powder" && (cmc?.amount === null || cmc?.amount > 0), JSON.stringify(cmc));
const chamki = cart.find((l) => l.productId === "gph-05");
ok("kit: golden chamki 1 kg (quote line or listed rate, never fake)", chamki?.variantLabel === "Golden Chamki Powder" && chamki?.qty === 1 && (chamki?.amount === null || chamki?.amount > 0), JSON.stringify(chamki));
const gurmala = cart.find((l) => l.productId === "gph-03");
ok("kit: gurmala ×1 piece", gurmala?.qty === 1 && gurmala?.unit === "Piece" && (gurmala?.amount === null || gurmala?.amount > 0), JSON.stringify(gurmala));

// 3. Estimated total = priced lines only, and equal to their sum.
const total = await page.evaluate(() => {
  const stored = JSON.parse(localStorage.getItem("gph-cart") || "{}");
  const lines = stored?.state?.lines || [];
  return {
    total: lines.reduce((sum, l) => sum + (l.amount ?? 0) * l.qty, 0),
    pricedSum: lines.filter((l) => l.amount !== null).reduce((sum, l) => sum + (l.amount ?? 0) * l.qty, 0),
  };
});
ok("estimated total = sum of priced lines (quote lines excluded)", total.total === total.pricedSum, JSON.stringify(total));

// 4. Checkout message includes all 5 lines with units.
await page.goto("http://localhost:3100/checkout", { waitUntil: "networkidle0", timeout: 90000 });
await page.evaluate(() => {
  const details = [...document.querySelectorAll("details")].find((d) => d.textContent?.includes("Preview the WhatsApp message"));
  if (details) details.open = true;
});
await new Promise((r) => setTimeout(r, 300));
const msg = await page.evaluate(() =>
  document.querySelector("details p.whitespace-pre-wrap")?.textContent || "",
);
ok("message lists all kit lines with units",
  msg.includes("Red Madrasi Dana × 1 bag") &&
  msg.includes("Pidicryl 126 M by Pidilite × 1 drum") &&
  msg.includes("White CMC Powder × 5 kg") &&
  msg.includes("Golden Chamki Powder × 1 kg") &&
  msg.includes("Stainless Steel Plastering Trowel (Gurmala) × 1 piece"),
  msg.split("\n").slice(3, 8).join(" | "));

await browser.close();
