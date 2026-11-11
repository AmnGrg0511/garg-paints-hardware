import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto("http://localhost:3100/", { waitUntil: "networkidle0", timeout: 90000 });
await new Promise((r) => setTimeout(r, 600));

const wallFill = () => page.evaluate(() => {
  const svg = document.querySelector("svg[aria-label*='Room preview']");
  return [...svg.querySelectorAll("rect")].find((r) => r.getAttribute("height") === "300" && r.getAttribute("width") === "480")?.getAttribute("fill");
});

const before = await wallFill();
await page.hover("svg[aria-label*='Room preview']");
await new Promise((r) => setTimeout(r, 3600));
const during = await wallFill();
await page.hover("h1"); // move away
await new Promise((r) => setTimeout(r, 3600));
const after = await wallFill();
console.log(`hover pause: before=${before} during=${during} after=${after}`);
console.log(before === during && during !== after ? "PASS hover pauses, resumes after leaving" : "FAIL");
await browser.close();
