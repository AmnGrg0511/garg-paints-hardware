import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();

const ok = (n, p, d = "") => console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? " — " + d : ""}`);

async function checkOverflow(vw, path, label) {
  await page.setViewport({ width: vw, height: 1400 });
  await page.goto(`http://localhost:3100${path}`, { waitUntil: "networkidle0", timeout: 90000 });
  await new Promise((r) => setTimeout(r, 700));
  const res = await page.evaluate(() => {
    const steppers = [...document.querySelectorAll("[role='group'][aria-label*='Quantity']")];
    return steppers.map((s) => {
      const parent = s.closest("li, .surface-card, div");
      const pw = parent?.getBoundingClientRect().width ?? 0;
      return { sw: Math.round(s.getBoundingClientRect().width), pw: Math.round(pw), overflow: s.scrollWidth > s.clientWidth + 1 };
    });
  });
  const bad = res.filter((r) => r.overflow);
  ok(`${label} (${vw}px): ${res.length} steppers, no overflow`, bad.length === 0, JSON.stringify(res));
  return bad.length === 0;
}

// 1. Detail page mobile (narrowest).
await checkOverflow(360, "/products/madrasi-dana-wall-texture", "detail mobile");
// 2. Drawer on mobile: add a dana line then open.
await page.setViewport({ width: 360, height: 900 });
await page.goto("http://localhost:3100/products", { waitUntil: "networkidle0", timeout: 90000 });
await page.evaluate(() => {
  const card = [...document.querySelectorAll("article")].find((a) => a.textContent?.includes("Madrasi Dana"));
  [...card.querySelectorAll("button")].find((b) => b.getAttribute("aria-label")?.includes("Add to cart"))?.click();
});
await new Promise((r) => setTimeout(r, 500));
await page.click("[data-cart-button]");
await new Promise((r) => setTimeout(r, 800));
const drawerRes = await page.evaluate(() => {
  const stored = JSON.parse(localStorage.getItem("gph-cart") || "{}");
  const lines = (stored?.state?.lines || []).length;
  const steppers = [...document.querySelectorAll("[role='group'][aria-label*='Quantity']")];
  const sheet = document.querySelector("[role='dialog']");
  return { lines, sheetOpen: Boolean(sheet), steppers: steppers.map((s) => {
    const row = s.parentElement;
    return { sw: Math.round(s.getBoundingClientRect().width), rw: Math.round(row.getBoundingClientRect().width), overflow: s.scrollWidth > s.clientWidth + 1 };
  }) };
});
ok("drawer mobile: stepper fits, wraps cleanly", drawerRes.sheetOpen && drawerRes.lines > 0 && drawerRes.steppers.length > 0 && drawerRes.steppers.every((r) => !r.overflow), JSON.stringify(drawerRes));

// 3. No horizontal page overflow anywhere.
await page.goto("http://localhost:3100/products/madrasi-dana-wall-texture", { waitUntil: "networkidle0", timeout: 90000 });
await page.setViewport({ width: 360, height: 900 });
const pageOverflow = await page.evaluate(() => document.body.scrollWidth - window.innerWidth);
ok("detail page: no horizontal scroll", pageOverflow <= 1, `${pageOverflow}px`);

await browser.close();
