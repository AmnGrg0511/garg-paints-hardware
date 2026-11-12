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
  // Instant-scroll + real mouse click — puppeteer's elementHandle.click()
  // races the smooth scroll and can land on the hero's WhatsApp CTA.
  const point = await page.evaluate(() => {
    const btn = document.querySelector("form button[type='submit']");
    if (!btn) return null;
    btn.scrollIntoView({ block: "center", behavior: "instant" });
    const r = btn.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  if (point) await page.mouse.click(point.x, point.y);
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
// The auto-send fires ~500 ms after the last keystroke; on production the
// POST includes the synchronous webhook roundtrip, so wait for the state.
await page.waitForFunction(
  () => (document.body.innerText || "").includes("Thanks"),
  { timeout: 15000, polling: "mutation" },
);

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

// 3. Autofill: browsers write the DOM value without an event React can
//    observe — the field sits filled while state stays empty. The poll
//    must pull it in and auto-send with zero user events.
await page.reload({ waitUntil: "networkidle0", timeout: 90000 });
await page.evaluate(() => {
  const el = document.querySelector("#lead-phone-hero");
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  ).set;
  setter.call(el, "9876509988");
});
await page.waitForFunction(
  () => (document.body.innerText || "").includes("Thanks"),
  { timeout: 15000, polling: "mutation" },
);
ok("autofilled value syncs and auto-sends with no events", true);

const stored = await page.evaluate(() =>
  fetch("/api/lead", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ phone: "9811122233", source: "browser-e2e" }),
  }).then((r) => r.json()),
);
ok(
  "server-side lead captured",
  stored.ok === true && (stored.stored === true || stored.forwarded === true),
  JSON.stringify(stored),
);

await browser.close();
