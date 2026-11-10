import puppeteer from "puppeteer-core";

const base = process.argv[2] ?? "http://localhost:3100";

const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 1.75 });

await page.goto(`${base}/`, { waitUntil: "networkidle0", timeout: 90000 });
await new Promise((r) => setTimeout(r, 800));
const report = await page.evaluate(() => {
  const q = (sel) => document.querySelector(sel);
  const rect = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  };
  return {
    header: rect(q("header")),
    utilityBar: rect(q("header .hidden.border-b")),
    h1: rect(q("h1")),
    visualizer: rect(q("[role='img'][aria-label*='Room preview']")),
    categoryTiles: document.querySelectorAll("section[aria-labelledby='categories-heading'] a[href*='category=']").length,
    shadeCards: document.querySelectorAll("section[aria-labelledby='shades-heading'] ul li a").length,
    productCards: document.querySelectorAll("article.surface-card").length,
    addButtons: [...document.querySelectorAll("button[aria-label*='Add to cart']")].map((b) => b.getAttribute("aria-label")),
    marquee: Boolean(q(".animate-marquee")),
    bodyScrollWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
    horizontalOverflow: document.body.scrollWidth > window.innerWidth + 2,
  };
});
console.log(JSON.stringify(report, null, 1));

// Products page: check category deep link preselect works after hydration.
await page.goto(`${base}/products?category=Wall%20Textures%20%26%20Aggregates`, {
  waitUntil: "networkidle0",
  timeout: 90000,
});
await new Promise((r) => setTimeout(r, 800));
const filterState = await page.evaluate(() => {
  const visible = document.body.innerText;
  return {
    resultCount: (visible.match(/\b\d+ products?\b/) || [])[0] || null,
    heading: document.querySelector("h2")?.textContent?.slice(0, 40) || null,
    hasMadrasi: visible.includes("Madrasi Dana Premium Wall Textures"),
    missingTrowel: !visible.includes("Stainless Steel Plastering Trowel"),
  };
});
console.log("category deep-link:", JSON.stringify(filterState));

// Search deep link
await page.goto(`${base}/products?q=trowel`, { waitUntil: "networkidle0", timeout: 90000 });
await new Promise((r) => setTimeout(r, 800));
const searchState = await page.evaluate(() => {
  const input = document.querySelector("input[type='search']");
  return {
    inputHasValue: input ? input.value : null,
    showsTrowel: document.body.innerText.includes("Stainless Steel Plastering Trowel"),
    hidesMadrasi: !document.body.innerText.includes("Madrasi Dana Premium Wall Textures"),
  };
});
console.log("search deep-link:", JSON.stringify(searchState));

await browser.close();
