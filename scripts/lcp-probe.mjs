import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 1.75 });
await page.evaluateOnNewDocument(() => {
  window.__lcp = [];
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      window.__lcp.push({
        size: entry.size,
        url: entry.url || null,
        startTime: Math.round(entry.startTime),
        element: entry.element
          ? entry.element.tagName +
            "." +
            String(entry.element.className).slice(0, 80) +
            " | " +
            (entry.element.textContent || "").slice(0, 80)
          : null,
      });
    }
  }).observe({ type: "largest-contentful-paint", buffered: true });
});
await page.goto(process.argv[2] ?? "http://localhost:3100/", {
  waitUntil: "networkidle0",
  timeout: 60000,
});
await new Promise((resolve) => setTimeout(resolve, 1500));
const data = await page.evaluate(() => {
  const resources = performance
    .getEntriesByType("resource")
    .filter((entry) => entry.name.includes("/_next/image") || entry.name.includes(".woff2"))
    .map((entry) => ({
      url: entry.name.replace("http://localhost:3100", ""),
      start: Math.round(entry.startTime),
      duration: Math.round(entry.duration),
      transfer: entry.transferSize,
      initiator: entry.initiatorType,
    }));
  return { lcp: window.__lcp, resources };
});
console.log(JSON.stringify(data, null, 1));
await browser.close();
