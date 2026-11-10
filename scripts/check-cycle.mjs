import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto("http://localhost:3100/products/madrasi-dana-wall-texture", { waitUntil: "networkidle0", timeout: 90000 });

const srcOf = () => page.evaluate(() => document.querySelector("main img[data-nimg]")?.getAttribute("src") || "");
const s0 = await srcOf();
await new Promise((r) => setTimeout(r, 3600));
const s1 = await srcOf();
await new Promise((r) => setTimeout(r, 3600));
const s2 = await srcOf();
console.log("cycling:", s0 !== s1 && s1 !== s2 ? "PASS" : "FAIL", "|", s0.slice(30, 70), "→", s1.slice(30, 70), "→", s2.slice(30, 70));

// Lock: click Red — cycling stops and image sticks.
await page.evaluate(() => {
  [...document.querySelectorAll("button")].find((b) => b.textContent?.includes("Red Madrasi Dana"))?.click();
});
await new Promise((r) => setTimeout(r, 400));
const locked = await srcOf();
await new Promise((r) => setTimeout(r, 3600));
const stays = await srcOf();
console.log("lock after selection:", locked === stays && locked.includes("madrasi-dana-red") ? "PASS" : "FAIL", "|", locked.slice(30, 75));

// Tint backdrop present.
const tint = await page.evaluate(() => document.querySelector("main img[data-nimg]")?.closest("div.relative")?.parentElement?.querySelector("div[style]")?.getAttribute("style") || "");
console.log("tint backdrop:", tint.includes("#A84328") ? "PASS" : "FAIL", tint.slice(0, 90));

// Reduced motion: cycling disabled.
const page2 = await browser.newPage();
await page2.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
await page2.goto("http://localhost:3100/products/madrasi-dana-wall-texture", { waitUntil: "networkidle0", timeout: 90000 });
const a = await page2.evaluate(() => document.querySelector("main img[data-nimg]")?.getAttribute("src"));
await new Promise((r) => setTimeout(r, 3600));
const b = await page2.evaluate(() => document.querySelector("main img[data-nimg]")?.getAttribute("src"));
console.log("reduced motion disables cycling:", a === b ? "PASS" : "FAIL");

await browser.close();
