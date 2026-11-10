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
page.on("popup", (target) => popups.push(target.url()));

const ok = (name, pass, detail = "") =>
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);

// 1. Hero form: invalid number shows the error, no popup.
await page.goto(`${base}/`, { waitUntil: "networkidle0", timeout: 90000 });
const form = await page.$("#lead-phone-hero");
ok("hero lead form present", Boolean(form));
if (form) {
  await form.type("12345");
  await page.click("#lead-phone-hero ~ button, button[type='submit']");
  await new Promise((r) => setTimeout(r, 500));
  const errorVisible = await page.evaluate(() =>
    Boolean(document.querySelector("#lead-error-hero")),
  );
  ok("invalid number shows inline error", errorVisible);
  ok("no popup on invalid input", popups.length === 0);
}

// 2. Valid number: POST stored + WhatsApp popup with the visitor number.
await page.evaluate(() => document.querySelector("#lead-phone-hero")?.focus());
await page.evaluate(
  () => (document.querySelector("#lead-phone-hero").value = ""),
);
await form?.type("9876501234");
await page.click("form button[type='submit']");
await new Promise((r) => setTimeout(r, 2000));
const popup = popups.length ? { url: () => popups[0] } : null;

const successShown = await page.evaluate(() =>
  (document.body.innerText || "").includes("Thanks"),
);
ok("success state shown", successShown);
ok("WhatsApp popup opened to the shop", Boolean(popup), (popup?.url() || "none").slice(0, 100));
if (popup) {
  const url = popup.url();
  const text = decodeURIComponent(
    (url.split("text=")[1] || "").split("&")[0].replace(/\+/g, " "),
  )
    .replace(/\s*\n\s*/g, " ");
  ok(
    "popup message carries the visitor number for the shop",
    text.includes("New enquiry from the website. Mobile: +919876501234"),
    text.slice(0, 110),
  );
  ok("message greets Mahesh", text.startsWith("Hello Mahesh,"), text.slice(0, 40));
}

const stored = await page.evaluate(() =>
  fetch("/api/lead", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ phone: "9811122233", source: "browser-e2e" }),
  }).then((r) => r.json()),
);
ok("server-side lead stored flag", stored.ok === true && stored.stored === true, JSON.stringify(stored));

await browser.close();
