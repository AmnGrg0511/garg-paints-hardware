import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto("http://localhost:3100/about", { waitUntil: "networkidle0", timeout: 90000 });

const wallFill = () => page.evaluate(() => {
  const svg = document.querySelector("svg[aria-label*='Modern house']");
  return svg ? svg.querySelector("rect[x='52'][y='132']").getAttribute("fill") : null;
});
const w0 = await wallFill();
await new Promise((r) => setTimeout(r, 3200));
const w1 = await wallFill();
await new Promise((r) => setTimeout(r, 3200));
const w2 = await wallFill();
console.log("facade auto-cycles:", w0 !== w1 && w1 !== w2 ? "PASS" : "FAIL", "|", w0, "→", w1, "→", w2);

await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button[role='radio']")].find((b) => b.textContent?.includes("Green"));
  btn?.click();
});
await new Promise((r) => setTimeout(r, 500));
const wGreen = await wallFill();
await new Promise((r) => setTimeout(r, 3300));
const wStays = await wallFill();
console.log("facade pick locks:", wGreen === "#3D6B41" && wGreen === wStays ? "PASS" : "FAIL", "|", wGreen);

// Fraunces actually applied to the hero H1?
await page.goto("http://localhost:3100/", { waitUntil: "networkidle0", timeout: 90000 });
const font = await page.evaluate(() => getComputedStyle(document.querySelector("h1")).fontFamily);
console.log("hero H1 font:", /Fraunces/i.test(font) ? "PASS (Fraunces)" : "FAIL", "|", font.slice(0, 60));

await browser.close();
