import puppeteer from "puppeteer-core";

const base = process.argv[2] ?? "http://localhost:3100";
const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 1.75 });
const popups = [];
page.on("popup", (t) => popups.push(t.url()));

const ok = (n, p, d = "") => console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? " — " + d : ""}`);

// Wait for the timed popup (14s).
await page.goto(`${base}/`, { waitUntil: "networkidle0", timeout: 90000 });
await new Promise((r) => setTimeout(r, 15500));
const dialog = await page.$("[role='dialog'][aria-modal='true']");
ok("lead popup appears after delay", Boolean(dialog));

if (dialog) {
  await page.type("#lead-phone-popup", "9876501234");
  await page.click("[role='dialog'] form button[type='submit']");
  await new Promise((r) => setTimeout(r, 1500));
  ok("popup flow opens WhatsApp to the shop", popups.some((u) => u.includes("wa.me") || u.includes("api.whatsapp.com")), popups[0]?.slice(0, 90));
  const text = popups[0] ? decodeURIComponent((popups[0].split("text=")[1] || "").split("&")[0].replace(/\+/g, " ")).replace(/\s*\n\s*/g, " ") : "";
  ok("popup message carries visitor number", text.includes("Mobile: +919876501234"), text.slice(0, 90));

  // Dismiss after success; popup must not return this session.
  await new Promise((r) => setTimeout(r, 2200));
  const stillOpen = await page.$("[role='dialog'][aria-modal='true']");
  ok("popup closes after success", !stillOpen);

  await page.reload({ waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 16000));
  const reappeared = await page.$("[role='dialog'][aria-modal='true']");
  ok("popup stays closed after submission", !reappeared);
}

// Escape/backdrop dismissal path: fresh session.
const page2 = await browser.newPage();
await page2.setViewport({ width: 1280, height: 900 });
await page2.goto(`${base}/contact`, { waitUntil: "networkidle0", timeout: 90000 });
await page2.evaluate(() => {
  window.scrollTo(0, document.body.scrollHeight * 0.9);
});
await new Promise((r) => setTimeout(r, 1200));
const dialog2 = await page2.$("[role='dialog'][aria-modal='true']");
if (dialog2) {
  await page2.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 400));
  const closed = !(await page2.$("[role='dialog'][aria-modal='true']"));
  ok("Escape closes the popup", closed);
} else {
  ok("scroll trigger fired on contact", Boolean(dialog2), "no dialog — check scroll threshold");
}

await browser.close();
