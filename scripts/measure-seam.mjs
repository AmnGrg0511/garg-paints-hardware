import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 2200 });

for (const [url, label, name] of [
  ["http://localhost:3100/", "Room preview", "hero"],
  ["http://localhost:3100/about", "Modern house", "facade"],
]) {
  await page.goto(url, { waitUntil: "networkidle0", timeout: 90000 });
  await new Promise((r) => setTimeout(r, 800));
  const m = await page.evaluate((lbl) => {
    const svg = document.querySelector(`svg[aria-label*='${lbl}']`);
    if (!svg) return null;
    const card = svg.closest(".surface-card");
    const svgWrap = svg.parentElement;
    const panel = card?.querySelector(":scope > .border-t") ?? null;
    const r = (el) => {
      const b = el.getBoundingClientRect();
      return { top: +b.top.toFixed(1), bottom: +b.bottom.toFixed(1), h: +b.height.toFixed(1) };
    };
    const svgStyles = getComputedStyle(svg);
    const wrapStyles = svgWrap ? getComputedStyle(svgWrap) : null;
    return {
      svg: svg ? r(svg) : null,
      svgWrap: svgWrap ? r(svgWrap) : null,
      panel: panel ? r(panel) : null,
      card: card ? r(card) : null,
      cardClasses: card?.className,
      svgDisplay: svgStyles.display,
      svgMarginBottom: svgStyles.marginBottom,
      wrapPaddingBottom: wrapStyles?.paddingBottom,
      wrapMarginBottom: wrapStyles?.marginBottom,
      gapSvgToPanel: panel ? +(panel.getBoundingClientRect().top - svg.getBoundingClientRect().bottom).toFixed(1) : null,
    };
  }, label);
  console.log(`\n== ${name}`, JSON.stringify(m, null, 1));
}
await browser.close();
