import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

// 1. Without consent: no GA script, dataLayer gets nothing.
await page.goto("http://localhost:3100/", { waitUntil: "networkidle0", timeout: 90000 });
await page.evaluate(() => localStorage.removeItem("gph-analytics-consent"));
await page.reload({ waitUntil: "networkidle0", timeout: 90000 });
let s = await page.evaluate(() => ({
  gaLoaded: [...document.querySelectorAll("script[src]")].some((x) => x.src.includes("googletagmanager")),
  consent: localStorage.getItem("gph-analytics-consent"),
  gtag: typeof window.gtag,
}));
console.log("pre-consent:", JSON.stringify(s));

// 2. Grant consent → the consent-mode updates; GA loads only when an ID is configured.
await page.evaluate(() => {
  localStorage.setItem("gph-analytics-consent", "granted");
  window.dispatchEvent(new CustomEvent("gph:consent"));
});
await new Promise((r) => setTimeout(r, 1200));
s = await page.evaluate(() => ({
  consentMode: JSON.stringify(window.dataLayer?.find((x) => x?.[0] === "consent") ?? null)?.slice(0, 120),
  gaLoaded: [...document.querySelectorAll("script[src]")].some((x) => x.src.includes("googletagmanager")),
}));
console.log("post-consent:", JSON.stringify(s));

// 3. Deny → nothing loads.
await page.evaluate(() => {
  localStorage.setItem("gph-analytics-consent", "denied");
  window.dispatchEvent(new CustomEvent("gph:consent"));
});
await new Promise((r) => setTimeout(r, 600));
s = await page.evaluate(() => ({
  analyticsStorage: (window.dataLayer?.findLast?.((x) => x?.[0] === "consent") ?? [])[1],
}));
console.log("denied:", JSON.stringify(s));

// 4. Lead API still OK and reports the storage channels honestly.
const res = await page.evaluate(async () => {
  const r = await fetch("/api/lead", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ phone: "9811122233", source: "analytics-check" }),
  });
  return r.json();
});
console.log("lead api:", JSON.stringify(res));

await browser.close();
