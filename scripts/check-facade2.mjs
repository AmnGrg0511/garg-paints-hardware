import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto("http://localhost:3100/about", { waitUntil: "networkidle0", timeout: 90000 });

const ok = (n, p, d = "") => console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? " — " + d : ""}`);

const state = () => page.evaluate(() => {
  const svg = document.querySelector("svg[aria-label*='Modern house']");
  if (!svg) return null;
  const rects = [...svg.querySelectorAll("rect")];
  const wall = rects.find((r) => r.getAttribute("x") === "52");
  const pill = rects.find((r) => r.getAttribute("y") === "40");
  const pillRect = pill.getBoundingClientRect();
  const text = svg.querySelector("text");
  const textBox = text.getBBox();
  // Trim + door colours adapt with the shade:
  const trim = rects.find((r) => r.getAttribute("x") === "22");
  return {
    wall: wall?.getAttribute("fill"),
    pillRight: Math.round(pillRect.right),
    pillLeft: Math.round(pillRect.left),
    textRight: Math.round(textBox.x + textBox.width),
    text: text.textContent,
    trim: trim?.getAttribute("fill"),
  };
});

// 1. Chip text stays inside the pill for every shade.
for (const name of ["White", "Red", "Yellow", "Green", "Black"]) {
  await page.evaluate((n) => {
    [...document.querySelectorAll("button[role='radio']")]
      .find((b) => b.textContent?.includes(n))?.click();
  }, name);
  await new Promise((r) => setTimeout(r, 450));
  const s = await state();
  ok(`${name}: text inside pill`, s.textRight <= s.pillRight, `textRight ${s.textRight} <= pillRight ${s.pillRight}`);
}

// 2. Wall + trim re-tone with the shade (walls lighten, trim darkens).
await page.evaluate(() => {
  [...document.querySelectorAll("button[role='radio']")].find((b) => b.textContent?.includes("Red"))?.click();
});
await new Promise((r) => setTimeout(r, 500));
const red = await state();
await page.evaluate(() => {
  [...document.querySelectorAll("button[role='radio']")].find((b) => b.textContent?.includes("Green"))?.click();
});
await new Promise((r) => setTimeout(r, 500));
const green = await state();
ok("wall follows the shade", red.wall === "#A84328" && green.wall === "#3D6B41", `${red.wall} → ${green.wall}`);
ok("trim re-tones with the shade", red.trim !== green.trim, `${red.trim} → ${green.trim}`);

// 3. Cycling still runs before a pick.
await page.reload({ waitUntil: "networkidle0", timeout: 90000 });
const a = (await state())?.wall;
await new Promise((r) => setTimeout(r, 3300));
const b = (await state())?.wall;
console.log("facade auto-cycles:", a !== b ? "PASS" : "FAIL", "|", a, "→", b);

await browser.close();
