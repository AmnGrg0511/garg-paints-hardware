import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
const ok = (n, p, d = "") => console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? " — " + d : ""}`);

for (const [url, svgLabel] of [["http://localhost:3100/", "Room preview"], ["http://localhost:3100/about", "Modern house"]]) {
  await page.goto(url, { waitUntil: "networkidle0", timeout: 90000 });
  await new Promise((r) => setTimeout(r, 600));
  const dotInfo = await page.evaluate((label) => {
    const svg = document.querySelector(`svg[aria-label*='${label}']`);
    const dots = [...svg.querySelectorAll("circle.gph-sparkle")];
    if (!dots.length) return { count: 0 };
    const radii = dots.map((d) => Number(d.getAttribute("r")));
    const animated = dots.filter((d) => getComputedStyle(d).animationName !== "none").length;
    const c = dots[0].getBoundingClientRect();
    return { count: dots.length, maxR: Math.max(...radii), screenDiameter: Math.round(c.width * 2 * 100) / 100, animated };
  }, svgLabel);
  ok(`${url === "http://localhost:3100/" ? "hero" : "facade"}: tiny animated glitter dots`, dotInfo.count >= 20 && dotInfo.maxR <= 1.4 && dotInfo.screenDiameter <= 3.5 && dotInfo.animated === dotInfo.count, JSON.stringify(dotInfo));
}
await browser.close();
