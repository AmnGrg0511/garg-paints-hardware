import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 1200 });
await page.goto("http://localhost:3100/", { waitUntil: "networkidle0", timeout: 90000 });
const check = await page.evaluate(() => {
  // Every button-like element should carry the granular overlay.
  const els = [
    ...document.querySelectorAll("button, a[class*='rounded-full']"),
  ].filter((el) => el.offsetParent !== null);
  const textured = els.filter((el) => getComputedStyle(el, "::after").backgroundImage.includes("dana-texture"));
  return { total: els.length, textured: textured.length };
});
console.log("textured buttons:", check.textured, "of", check.total);
console.log(check.textured >= 8 ? "PASS (broad coverage)" : "CHECK");
await browser.close();
