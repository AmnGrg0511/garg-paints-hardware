import puppeteer from "puppeteer-core";

const base = process.argv[2] ?? "http://localhost:3100";
const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

const ok = (n, p, d = "") => console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? " — " + d : ""}`);

// 1. Detail page: selecting Red swaps the gallery image to the red bag.
await page.goto(`${base}/products/madrasi-dana-wall-texture`, {
  waitUntil: "networkidle0",
  timeout: 90000,
});
await new Promise((r) => setTimeout(r, 700));
const initial = await page.evaluate(() =>
  document.querySelector("main img[data-nimg]")?.getAttribute("src") || "",
);
ok("default gallery shows white sack", initial.includes("madrasi-dana-white"), initial.slice(0, 90));

await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")]
    .find((b) => b.textContent?.includes("Red Madrasi Dana"));
  btn?.click();
});
await new Promise((r) => setTimeout(r, 900));
const afterRed = await page.evaluate(() =>
  document.querySelector("main img[data-nimg]")?.getAttribute("src") || "",
);
ok("Red selection swaps to red bag art", afterRed.includes("madrasi-dana-red"), afterRed.slice(0, 90));

await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")]
    .find((b) => b.textContent?.includes("Black Madrasi Dana"));
  btn?.click();
});
await new Promise((r) => setTimeout(r, 900));
const afterBlack = await page.evaluate(() =>
  document.querySelector("main img[data-nimg]")?.getAttribute("src") || "",
);
ok("Black selection swaps to black bag art", afterBlack.includes("madrasi-dana-black"), afterBlack.slice(0, 90));

// 2. CMC detail page: yellow grade swaps.
await page.goto(`${base}/products/cmc-powder`, {
  waitUntil: "networkidle0",
  timeout: 90000,
});
await new Promise((r) => setTimeout(r, 700));
await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")]
    .find((b) => b.textContent?.includes("Yellow CMC Powder"));
  btn?.click();
});
await new Promise((r) => setTimeout(r, 900));
const cmcSrc = await page.evaluate(() =>
  document.querySelector("main img[data-nimg]")?.getAttribute("src") || "",
);
ok("CMC yellow grade swaps the sack art", cmcSrc.includes("cmc-powder-yellow"), cmcSrc.slice(0, 90));

// 3. Products listing: picking Yellow on the card swaps its tile.
await page.goto(`${base}/products`, { waitUntil: "networkidle0", timeout: 90000 });
await new Promise((r) => setTimeout(r, 700));
await page.evaluate(() => {
  const card = [...document.querySelectorAll("article")]
    .find((a) => a.textContent?.includes("Madrasi Dana"));
  const chip = [...(card?.querySelectorAll("button") || [])]
    .find((b) => b.textContent?.trim() === "Yellow");
  chip?.click();
});
await new Promise((r) => setTimeout(r, 900));
const cardSrc = await page.evaluate(() =>
  [...document.querySelectorAll("article img")]
    .find((img) => img.closest("article")?.textContent?.includes("Madrasi Dana"))
    ?.getAttribute("src") || "",
);
ok("card tile follows the Yellow shade", cardSrc.includes("madrasi-dana-yellow"), cardSrc.slice(0, 90));

await browser.close();
