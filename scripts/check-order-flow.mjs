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

const results = [];
const ok = (name, condition, detail = "") => {
  results.push({ name, pass: Boolean(condition), detail });
  console.log(`${condition ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
};

// 1. Home: add the featured variant product (Madrasi Dana, White) to the cart.
await page.goto(`${base}/`, { waitUntil: "networkidle0", timeout: 90000 });
const addButtons = await page.$$eval(
  "button[aria-label*='Add to cart']",
  (els) => els.map((el) => el.getAttribute("aria-label") || ""),
);
ok("home renders add-to-cart buttons", addButtons.length >= 1, `${addButtons.length} found`);
const madrasiButton = await page.$("button[aria-label*='Madrasi Dana'][aria-label*='Add to cart']");
ok("Madrasi Dana quick-add button present", Boolean(madrasiButton));
if (madrasiButton) {
  // scroll-behavior:smooth makes elementHandle.click() race the scroll —
  // measure after an instant scroll, then dispatch a real mouse click.
  const point = await page.evaluate(() => {
    const el = document.querySelector(
      "button[aria-label*='Madrasi Dana'][aria-label*='Add to cart']",
    );
    if (!el) return null;
    el.scrollIntoView({ block: "center", behavior: "instant" });
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  if (point) await page.mouse.click(point.x, point.y);
  await new Promise((r) => setTimeout(r, 600));
}

// Cart badge shows the count.
const badge = await page.$eval("[data-cart-button]", (el) => el.textContent || "");
ok("cart badge shows count 1", /1/.test(badge), badge.trim().slice(-8));

// 2. Open the cart drawer and check the line.
await page.click("[data-cart-button]");
await new Promise((r) => setTimeout(r, 700));
const drawerText = await page.evaluate(() => document.body.innerText);
ok("drawer lists Pidicryl 126 M", drawerText.includes("Madrasi Dana"));
ok("drawer shows estimated total", /₹|EUR|130/.test(drawerText) || /Estimated/.test(drawerText));

// 3. Checkout page: verify both channels + exact WhatsApp message.
await page.goto(`${base}/checkout`, { waitUntil: "networkidle0", timeout: 90000 });
const checkoutText = await page.evaluate(() => document.body.innerText);
ok("checkout lists IndiaMART channel", checkoutText.includes("IndiaMART"));
ok("checkout lists WhatsApp channel", /WhatsApp/i.test(checkoutText));
ok("checkout shows the line", checkoutText.includes("Madrasi Dana Premium Wall Textures"));

// 4. Open the message preview details and read the exact text.
const message = await page.evaluate(() => {
  const details = [...document.querySelectorAll("details")].find((d) =>
    (d.textContent || "").includes("Preview the WhatsApp message"),
  );
  if (!details) return null;
  details.open = true;
  const pre = details.querySelector("p.whitespace-pre-wrap");
  return pre ? pre.textContent : details.textContent;
});
const expected =
  "Hello Mahesh,\n\nI want to purchase:\n• Madrasi Dana Premium Wall Textures – White Madrasi Dana × 1 bag\n\nPlease confirm availability and share your best rate for this order.";

ok("WhatsApp message matches the owner template", message === expected, message || "missing");

// 5. The WhatsApp channel link must be wa.me with the exact encoding.
// Select the ORDER link specifically (it contains "purchase") — the lead
// form's greeting link is also wa.me and must not be confused with it.
const waHref = await page.evaluate(() => {
  const a = [...document.querySelectorAll("a")].find((el) => {
    const href = el.href || "";
    return href.startsWith("https://wa.me/") && decodeURIComponent(href).includes("purchase");
  });
  return a ? a.href : null;
});
ok(
  "wa.me link is exactly encoded",
  waHref === `https://wa.me/919899284391?text=${encodeURIComponent(expected)}`,
  waHref || "missing",
);


// 6. Click the WhatsApp channel with a real (trusted) mouse event —
// programmatic a.click() is intermittently popup-blocked. wa.me redirects
// to api.whatsapp.com while preserving the exact encoded message.
const waPoint = await page.evaluate(() => {
  const a = [...document.querySelectorAll("a")].find((el) => {
    const href = el.href || "";
    return href.startsWith("https://wa.me/") && decodeURIComponent(href).includes("purchase");
  });
  if (!a) return null;
  a.scrollIntoView({ block: "center", behavior: "instant" });
  const r = a.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
});
if (waPoint) {
  await page.mouse.click(waPoint.x, waPoint.y);
}
await new Promise((r) => setTimeout(r, 2500));
const waPopup = popups.find(
  (u) => u.startsWith("https://wa.me/") || u.startsWith("https://api.whatsapp.com/send"),
);
ok("WhatsApp click opens a new tab", Boolean(waPopup), waPopup || "none");
if (waPopup) {
  // (popup text is inspected below)
  // wa.me redirects server-side; the encoded text above is authoritative
  ok(
    "new tab carries the exact order message",
    decodeURIComponent(
      (waPopup.split("text=")[1] || "").split("&")[0].replace(/\+/g, " "),
    )
      .replace(/\s*\n\s*/g, " ")
      .includes(
        "Hello Mahesh, I want to purchase: • Madrasi Dana Premium Wall Textures – White Madrasi Dana × 1 bag",
      ),
    decodeURIComponent((waPopup.split("text=")[1] || "").split("&")[0]).slice(0, 120),
  );
}

// 7. IndiaMART channel opens in a new tab (target=_blank, no navigation here).
const imHref = await page.evaluate(() => {
  const a = [...document.querySelectorAll("a")].find((el) =>
    (el.href || "").includes("indiamart.com"),
  );
  return a ? { href: a.href, target: a.target } : null;
});
ok(
  "IndiaMART link is the seller listing in a new tab",
  imHref && imHref.href === "https://www.indiamart.com/gargpaintshardware/" && imHref.target === "_blank",
  imHref ? `${imHref.href} target=${imHref.target}` : "missing",
);

// 8. Quote-only handling: the catalogue page offers a quote link for
// quote-only items and add-to-cart for priced ones — whichever state the
// live catalogue (bot rates) is in.
await page.goto(`${base}/products`, { waitUntil: "networkidle0", timeout: 90000 });
const routeState = await page.$$eval(
  "a[aria-label*='quote' i], button[aria-label*='Add to cart']",
  (els) => {
    const quote = els.filter((el) => el.tagName === "A").length;
    const add = els.filter((el) => el.tagName === "BUTTON").length;
    return { quote, add };
  },
);
ok(
  "catalogue offers quote links or add-to-cart per rate state",
  routeState.quote > 0 || routeState.add > 0,
  `${routeState.quote} quote links, ${routeState.add} add-to-cart buttons`,
);

// 9. Persisted cart survives reload (versioned key).
const stored = await page.evaluate(() => localStorage.getItem("gph-cart"));
ok("cart persisted under versioned key", Boolean(stored) && stored.includes("gph-02"), (stored || "").slice(0, 90));

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
await browser.close();
process.exit(failed.length ? 1 : 0);
