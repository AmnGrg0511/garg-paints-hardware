import puppeteer from "puppeteer-core";

const base = process.argv[2] ?? "http://localhost:3100";

const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 1.75 });

const popupTargets = [];
page.on("popup", (target) => popupTargets.push(target));

// target="_blank" tabs start at about:blank; wait until the real URL lands.
async function waitForTarget(targets, timeoutMs = 8000) {
  const start = Date.now();
  while (targets.length === 0 && Date.now() - start < timeoutMs) {
    await new Promise((r) => setTimeout(r, 200));
  }
  return targets[targets.length - 1] ?? null;
}

async function targetUrl(target) {
  if (!target) return null;
  let url = target.url();
  for (let i = 0; i < 25 && (!url || url === "about:blank"); i++) {
    await new Promise((r) => setTimeout(r, 200));
    url = target.url();
  }
  return url;
}

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
  ok("no popup on invalid input", popupTargets.length === 0);
}

// 2. Valid number: types itself in — no click. POST stored; success state;
//    nothing opens. WhatsApp is an optional link with a plain greeting.
await page.evaluate(() => document.querySelector("#lead-phone-hero")?.focus());
await page.evaluate(
  () => (document.querySelector("#lead-phone-hero").value = ""),
);
await form?.type("9876501234");
await new Promise((r) => setTimeout(r, 1500));

const successShown = await page.evaluate(() =>
  (document.body.innerText || "").includes("Thanks"),
);
ok("success state shown (auto-sent, no click)", successShown);
ok("no tab opened on submit — capture is form-only", popupTargets.length === 0);

const waOption = await page.evaluate(() => {
  const el = document.querySelector("[data-testid='lead-whatsapp-hero']");
  if (!el) return null;
  return {
    href: el.getAttribute("href"),
    text: (el.textContent || "").trim(),
  };
});
ok("optional WhatsApp link offered", Boolean(waOption));
if (waOption) {
  ok(
    "WhatsApp option is a plain Hello Mahesh greeting",
    waOption.href ===
      `https://wa.me/919899284391?text=${encodeURIComponent("Hello Mahesh")}`,
    waOption.href.slice(0, 80),
  );
  await page.click("[data-testid='lead-whatsapp-hero']");
  const target = await waitForTarget(popupTargets);
  const url = await targetUrl(target);
  const greeted = Boolean(
    url &&
      url.includes("919899284391") &&
      (url.includes("text=Hello+Mahesh") ||
        url.includes(`text=${encodeURIComponent("Hello Mahesh")}`)),
  );
  ok(
    "clicking the option opens the WhatsApp greeting",
    greeted,
    (url || "none").slice(0, 90),
  );
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
