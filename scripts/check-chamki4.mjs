import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
const ok = (n, p, d = "") => console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? " — " + d : ""}`);

const chamkiOf = (svgLabel) => page.evaluate((label) => {
  const svg = document.querySelector(`svg[aria-label*='${label}']`);
  const group = svg?.querySelector("g[aria-hidden='true']");
  const gold = group ? group.innerHTML.includes("gold") : false;
  const silver = group ? group.innerHTML.includes("silver") : false;
  const dots = group ? group.querySelectorAll("circle").length : 0;
  const flakes = group ? group.querySelectorAll("path").length : 0;
  return { present: Boolean(group), gold, silver, dots, flakes };
}, svgLabel);

const pick = async (label) => {
  await page.evaluate((l) => {
    const fieldset = [...document.querySelectorAll("fieldset")].find((f) => f.textContent?.includes("Chamki finish"));
    [...fieldset.querySelectorAll("button[role='radio']")]
      .find((b) => b.textContent?.includes(l))?.click();
  }, label);
  await new Promise((r) => setTimeout(r, 400));
};

// Hero: three chips; Gold default; Silver keeps field silver; Off removes.
await page.goto("http://localhost:3100/", { waitUntil: "networkidle0", timeout: 90000 });
await new Promise((r) => setTimeout(r, 600));
let s = await chamkiOf("Room preview");
ok("hero: gold default", s.present && s.gold && !s.silver && s.dots === 44, `dots=${s.dots} flakes=${s.flakes}`);
await pick("Silver");
s = await chamkiOf("Room preview");
ok("hero: Silver pin", s.present && s.silver && !s.gold, `dots=${s.dots}`);
await pick("Off");
s = await chamkiOf("Room preview");
ok("hero: Off removes the field", !s.present);
await pick("Golden");
s = await chamkiOf("Room preview");
ok("hero: Golden restores", s.present && s.gold, `dots=${s.dots}`);

// Exactly 3 chips in the picker, no Auto anywhere.
const chips = await page.evaluate(() => {
  const f = [...document.querySelectorAll("fieldset")].find((f) => f.textContent?.includes("Chamki finish"));
  return f ? [...f.querySelectorAll("button[role='radio']")].map((b) => b.textContent?.trim()) : [];
});
ok("exactly 3 chips: Golden/Silver/Off", chips.length === 3 && chips.join(",").includes("Golden") && chips.join(",").includes("Silver") && chips.join(",").includes("Off"), JSON.stringify(chips));

// Facade: same picker; gold stays gold across wall colour cycles (no alternation).
await page.goto("http://localhost:3100/about", { waitUntil: "networkidle0", timeout: 90000 });
await new Promise((r) => setTimeout(r, 600));
s = await chamkiOf("Modern house");
ok("facade: gold default", s.present && s.gold && s.dots === 26, `dots=${s.dots}`);
await new Promise((r) => setTimeout(r, 3400));
s = await chamkiOf("Modern house");
ok("facade: stays gold across colour cycles (no auto alternation)", s.present && s.gold && !s.silver, `dots=${s.dots}`);

await browser.close();
