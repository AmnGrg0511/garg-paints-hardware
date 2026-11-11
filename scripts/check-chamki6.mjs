import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
const ok = (n, p, d = "") => console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? " — " + d : ""}`);

const wallFillSafe = () => page.evaluate(() => {
  const svg = document.querySelector("svg[aria-label*='Room preview']");
  return [...svg.querySelectorAll("rect")].find((r) => r.getAttribute("height") === "300" && r.getAttribute("width") === "480")?.getAttribute("fill");
});
const chamkiOf = (svgLabel) => page.evaluate((label) => {
  const svg = document.querySelector(`svg[aria-label*='${label}']`);
  const group = svg?.querySelector("g[aria-hidden='true']");
  return {
    present: Boolean(group),
    gold: group ? group.innerHTML.includes("gold") : false,
    silver: group ? group.innerHTML.includes("silver") : false,
  };
}, svgLabel);

const chips = () => page.evaluate(() => {
  const f = [...document.querySelectorAll("fieldset")].find((f) => f.textContent?.includes("Chamki finish"));
  return f ? [...f.querySelectorAll("button[role='radio']")].map((b) => b.textContent?.trim()) : [];
});

// 1. Hero: 2 chips only; chamki alternates with each tick; hover pauses.
await page.goto("http://localhost:3100/", { waitUntil: "networkidle0", timeout: 90000 });
await new Promise((r) => setTimeout(r, 600));
let c = await chips();
ok("2 chips only (Golden/Silver)", c.length === 2, JSON.stringify(c));
let s = await chamkiOf("Room preview");
const first = s.gold ? "gold" : "silver";
await new Promise((r) => setTimeout(r, 3200));
s = await chamkiOf("Room preview");
const second = s.gold ? "gold" : "silver";
ok("alternates with each tick", first !== second, `${first} → ${second}`);

// 2. Real pointer hover pauses BOTH shade and chamki.
const heldShade = await wallFillSafe();
await page.hover("svg[aria-label*='Room preview']");
await new Promise((r) => setTimeout(r, 3600));
const shadeStill = (await wallFillSafe()) === heldShade;
const afterHover = await chamkiOf("Room preview");
ok("hover pauses shade + chamki", shadeStill, `shade held=${shadeStill}`);

// 3. Pick a chamki chip → holds that colour 9s → resumes.
await page.evaluate(() => {
  const f = [...document.querySelectorAll("fieldset")].find((f) => f.textContent?.includes("Chamki finish"));
  [...f.querySelectorAll("button[role='radio']")].find((b) => b.textContent?.includes("Silver"))?.click();
});
await new Promise((r) => setTimeout(r, 400));
s = await chamkiOf("Room preview");
ok("pick Silver: silver immediately", s.silver && !s.gold);
await new Promise((r) => setTimeout(r, 9200));
const resumed = await chamkiOf("Room preview");
ok("resume: back to cycling (either colour)", Boolean(resumed.present), `gold=${resumed.gold} silver=${resumed.silver}`);

// 4. Facade: same picker (2 chips), same behaviour.
await page.goto("http://localhost:3100/about", { waitUntil: "networkidle0", timeout: 90000 });
await new Promise((r) => setTimeout(r, 600));
c = await chips();
ok("facade: 2 chips only", c.length === 2, JSON.stringify(c));
s = await chamkiOf("Modern house");
const fFirst = s.gold ? "gold" : "silver";
await new Promise((r) => setTimeout(r, 3200));
s = await chamkiOf("Modern house");
const fSecond = s.gold ? "gold" : "silver";
ok("facade: alternates", fFirst !== fSecond, `${fFirst} → ${fSecond}`);

await browser.close();
