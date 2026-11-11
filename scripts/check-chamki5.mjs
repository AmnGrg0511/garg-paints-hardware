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
  return {
    present: Boolean(group),
    gold: group ? group.innerHTML.includes("gold") : false,
    silver: group ? group.innerHTML.includes("silver") : false,
    dots: group ? group.querySelectorAll("circle").length : 0,
  };
}, svgLabel);

// 1. Hero: chamki CYCLES with each colour change: gold → silver → gold.
await page.goto("http://localhost:3100/", { waitUntil: "networkidle0", timeout: 90000 });
await new Promise((r) => setTimeout(r, 600));
let s = await chamkiOf("Room preview");
ok("hero: gold at start", s.present && s.gold && !s.silver, `dots=${s.dots}`);
await new Promise((r) => setTimeout(r, 3200));
s = await chamkiOf("Room preview");
ok("hero: silver after 1 colour change", s.present && s.silver && !s.gold, `dots=${s.dots}`);
await new Promise((r) => setTimeout(r, 3200));
s = await chamkiOf("Room preview");
ok("hero: gold again", s.present && s.gold && !s.silver, `dots=${s.dots}`);

// 2. Picker: 3 chips; pin Silver → stays silver; tap again → cycles again.
const chips = await page.evaluate(() => {
  const f = [...document.querySelectorAll("fieldset")].find((f) => f.textContent?.includes("Chamki finish"));
  return f ? [...f.querySelectorAll("button[role='radio']")].map((b) => b.textContent?.trim()) : [];
});
ok("3 chips only (no Auto)", chips.length === 3 && !chips.join().includes("Auto"), JSON.stringify(chips.map(c => c?.replace("chamki finish", ""))));
await page.evaluate(() => {
  const f = [...document.querySelectorAll("fieldset")].find((f) => f.textContent?.includes("Chamki finish"));
  [...f.querySelectorAll("button[role='radio']")].find((b) => b.textContent?.includes("Silver"))?.click();
});
await new Promise((r) => setTimeout(r, 400));
let pinnedSilver = await chamkiOf("Room preview");
await new Promise((r) => setTimeout(r, 3300));
const staysSilver = await chamkiOf("Room preview");
ok("pin Silver: sticks across colour changes", pinnedSilver.silver && staysSilver.silver, `dots=${staysSilver.dots}`);
await page.evaluate(() => {
  const f = [...document.querySelectorAll("fieldset")].find((f) => f.textContent?.includes("Chamki finish"));
  [...f.querySelectorAll("button[role='radio']")].find((b) => b.textContent?.includes("Silver"))?.click();
});
await new Promise((r) => setTimeout(r, 400));
const unpinned = await chamkiOf("Room preview");
await new Promise((r) => setTimeout(r, 3300));
const unpinnedNext = await chamkiOf("Room preview");
ok("tap again: resumes cycling", unpinned.gold !== unpinnedNext.gold || unpinned.silver !== unpinnedNext.silver, `${unpinned.gold ? "gold" : "silver"} → ${unpinnedNext.gold ? "gold" : "silver"}`);

// 3. Off removes; drawer opens (toast no longer blocks).
await page.evaluate(() => {
  const f = [...document.querySelectorAll("fieldset")].find((f) => f.textContent?.includes("Chamki finish"));
  [...f.querySelectorAll("button[role='radio']")].find((b) => b.textContent?.includes("Off"))?.click();
});
await new Promise((r) => setTimeout(r, 400));
s = await chamkiOf("Room preview");
ok("Off removes the glitter", !s.present);
await page.evaluate(() => {
  const card = [...document.querySelectorAll("article")].find((a) => a.textContent?.includes("Pidicryl"));
  [...card.querySelectorAll("button")].find((b) => b.getAttribute("aria-label")?.includes("Add to cart"))?.click();
});
await new Promise((r) => setTimeout(r, 400));
// Dismiss the lead popup if its timer opened it over the page.
await page.evaluate(() => {
  const overlay = document.querySelector("[data-testid='lead-popup-overlay']");
  if (overlay) {
    [...overlay.querySelectorAll("button")]
      .find((b) => b.getAttribute("aria-label")?.includes("Close"))
      ?.click();
  }
});
await new Promise((r) => setTimeout(r, 500));
await page.click("[data-cart-button]");
await new Promise((r) => setTimeout(r, 1200));
const drawer = await page.evaluate(() => ({
  dialogs: document.querySelectorAll("[role='dialog']").length,
  steppers: document.querySelectorAll("[role='group'][aria-label*='Quantity']").length,
}));
ok("drawer opens (toast no longer blocks)", drawer.dialogs > 0 && drawer.steppers > 0, JSON.stringify(drawer));

await browser.close();
