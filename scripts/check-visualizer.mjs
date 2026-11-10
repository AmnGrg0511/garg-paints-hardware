import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto("http://localhost:3100/", { waitUntil: "networkidle0", timeout: 90000 });

const wallFill = () => page.evaluate(() => {
  const svg = document.querySelector("svg[aria-label*='Room preview']");
  return svg ? svg.querySelector("rect[height='300'][width='480']").getAttribute("fill") : null;
});
const backdropState = () => page.evaluate(() => {
  const section = document.querySelector("main > section");
  const wash = section ? getComputedStyle(section.querySelector(":scope > div[aria-hidden]") || section).backgroundColor : null;
  const glow = document.querySelector('svg[viewBox="0 0 900 720"]');
  const active = glow ? [...glow.querySelectorAll("ellipse")].find((e) => Number(e.getAttribute("opacity")) > 0.05) : null;
  return { wash, glowFill: active ? active.getAttribute("fill") : null };
});

const w0 = await wallFill();
await new Promise((r) => setTimeout(r, 3200));
const w1 = await wallFill();
await new Promise((r) => setTimeout(r, 3200));
const w2 = await wallFill();
console.log("visualizer auto-cycles:", w0 !== w1 && w1 !== w2 ? "PASS" : "FAIL", "|", w0, "→", w1, "→", w2);
const bs0 = await backdropState();
console.log("hero wash + glow follow:", bs0.wash && bs0.glowFill ? "PASS" : "FAIL", "|", bs0.wash, bs0.glowFill);

// Pick a shade — cycling locks and backdrop matches.
await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button[role='radio']")].find((b) => b.textContent?.includes("Red"));
  btn?.click();
});
await new Promise((r) => setTimeout(r, 600));
const wRed = await wallFill();
await new Promise((r) => setTimeout(r, 3300));
const wStays = await wallFill();
console.log("pick locks cycling:", wRed === "#A84328" && wRed === wStays ? "PASS" : "FAIL", "|", wRed);
const bsRed = await backdropState();
console.log(
  "backdrop turns red on pick:",
  bsRed.glowFill === "#A84328" && bsRed.wash && bsRed.wash !== "rgba(0, 0, 0, 0)"
    ? "PASS"
    : "FAIL",
  "|",
  bsRed.wash,
  bsRed.glowFill,
);

// Texture overlay present on the backdrop layer.
const tex = await page.evaluate(() => {
  const wall = document.querySelector("svg[aria-label*='Room preview']").closest(".dana-texture");
  return wall ? getComputedStyle(wall, "::after").backgroundImage.includes("dana-texture") : false;
});
console.log("granule texture overlay:", tex ? "PASS" : "FAIL");

await browser.close();
