import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
const ok = (n, p, d = "") => console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? " — " + d : ""}`);

await page.goto("http://localhost:3100/products", { waitUntil: "networkidle0", timeout: 90000 });
// Add an item, then immediately check the cart button for the glow class.
await page.evaluate(() => {
  const card = [...document.querySelectorAll("article")].find((a) => a.textContent?.includes("Pidicryl"));
  [...card.querySelectorAll("button")]
    .find((b) => b.getAttribute("aria-label")?.includes("Add to cart"))?.click();
});
await new Promise((r) => setTimeout(r, 300));
const glow = await page.evaluate(() => {
  const b = document.querySelector("[data-cart-button]");
  return { hasClass: b?.classList.contains("gph-cart-glow"), animation: getComputedStyle(b).animationName };
});
ok("cart button glows on add", glow.hasClass && glow.animation.includes("gph-cart-glow"), JSON.stringify(glow));
await new Promise((r) => setTimeout(r, 1400));
const cleared = await page.evaluate(() => !document.querySelector("[data-cart-button]").classList.contains("gph-cart-glow"));
ok("glow clears after ~1s", cleared);

// Toast duration is short (2.2s): gone well before the user re-taps.
await new Promise((r) => setTimeout(r, 1300));
const toastGone = await page.evaluate(() => !document.querySelector("[data-sonner-toast]"));
ok("toast gone by ~2.7s total (short duration)", toastGone);

await browser.close();
