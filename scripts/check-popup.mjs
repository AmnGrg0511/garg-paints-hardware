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
  await new Promise((r) => setTimeout(r, 1500));
  ok("auto-send stores the lead without opening WhatsApp", popups.length === 0, popups[0]?.slice(0, 90));
  const successShown = await page.evaluate(
    () => (document.body.innerText || "").includes("Thanks"),
  );
  ok("success state shown (auto-sent, no click)", successShown);
  const waOption = await page.$("[data-testid='lead-whatsapp-popup']");
  ok("optional WhatsApp greeting link present", Boolean(waOption));

  // Dismiss after success; popup must not return this session.
  await new Promise((r) => setTimeout(r, 2200));
  const stillOpen = await page.$("[role='dialog'][aria-modal='true']");
  ok("popup closes after success", !stillOpen);

  await page.reload({ waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 16000));
  const reappeared = await page.$("[role='dialog'][aria-modal='true']");
  ok("popup stays closed after submission", !reappeared);
}

// Escape/backdrop dismissal path: fresh session. Clear storage first — the
// submission above set localStorage, which would suppress the popup here.
const page2 = await browser.newPage();
await page2.setViewport({ width: 1280, height: 900 });
await page2.evaluateOnNewDocument(() => {
  try {
    window.localStorage.clear();
    window.sessionStorage.clear();
  } catch {}
});
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

// Flush-on-dismiss path: typing a complete number and leaving the page
// immediately must still capture the lead (no click, no success state).
const page3 = await browser.newPage();
await page3.setViewport({ width: 1280, height: 900 });
await page3.goto(`${base}/contact`, { waitUntil: "networkidle0", timeout: 90000 });
const contactInput = await page3.$("#lead-phone-contact");
if (contactInput) {
  await contactInput.type("9812345678");
  // Navigate away inside the 500 ms debounce window — the pending lead
  // must flush instead of being lost with the unmounted component.
  await page3.goto(`${base}/faq`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await new Promise((r) => setTimeout(r, 2000));
  console.log("NOTE  flush test number 9812345678 — verify in data/leads.jsonl");
} else {
  ok("contact lead form present for flush test", false);
}

await browser.close();
