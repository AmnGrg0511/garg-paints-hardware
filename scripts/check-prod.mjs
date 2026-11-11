import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 1200 });
const ok = (n, p, d = "") => console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? " — " + d : ""}`);
const U = "https://garg-paints-hardware.vercel.app";

// 1. Checkout: lead form renders after hydration and posts successfully.
await page.goto(`${U}/checkout`, { waitUntil: "networkidle0", timeout: 90000 });
try {
  await page.waitForSelector("#lead-phone-checkout-empty", { timeout: 15000 });
} catch {}
let form = await page.evaluate(() => Boolean(document.querySelector("#lead-phone-checkout-empty")));
ok("checkout lead form renders live (empty cart)", form);
if (form) {
  const res = await page.evaluate(async () => {
    const r = await fetch("/api/lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone: "9811122233", source: "checkout-live" }),
    });
    return r.json();
  });
  ok("checkout lead submits", res.ok === true, JSON.stringify(res));
}

// 2. Home: no analytics prompt anywhere.
const prompt = await page.evaluate(() => document.body.innerText.includes("analytics"));
ok("no analytics prompt", !prompt);

// 3. Live typing updates the price: add pidicryl, type 5 → total ₹32,500.
await page.goto(`${U}/products/pidicryl-126-m`, { waitUntil: "networkidle0", timeout: 90000 });
await page.waitForSelector("[role='group'][aria-label*='Quantity']", { timeout: 20000 });
await page.evaluate(() => {
  const group = document.querySelector("[role='group'][aria-label*='Quantity']");
  [...group.querySelectorAll("button")]
    .find((b) => b.getAttribute("aria-label") === "Increase by one")?.click();
});
await new Promise((r) => setTimeout(r, 300));
const input = await page.waitForSelector("[role='group'][aria-label='Quantity in drums'] input", { timeout: 20000 });
await input.click({ clickCount: 3 });
await page.type(input, "5");
await new Promise((r) => setTimeout(r, 500));
const price = await page.evaluate(() => {
  const group = document.querySelector("[role='group'][aria-label*='Quantity']");
  const line = group?.closest("div.rounded-2xl");
  return (line?.innerText || "").match(/₹\s?([\d,]+)/)?.[1];
});
ok("live typing: 5 drums → ₹32,500", price === "32,500", price);

await browser.close();
