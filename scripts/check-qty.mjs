import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
const ok = (n, p, d = "") => console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? " — " + d : ""}`);

// 1. Dana detail: bulk stepper with +1/+10/+100; tap +100 → 100 bags.
await page.goto("http://localhost:3100/products/madrasi-dana-wall-texture", { waitUntil: "networkidle0", timeout: 90000 });
await new Promise((r) => setTimeout(r, 700));
const stepperInfo = await page.evaluate(() => {
  const group = document.querySelector("[role='group'][aria-label*='Quantity']");
  return group ? group.querySelectorAll("button").length : 0;
});
ok("dana stepper has bulk buttons", stepperInfo === 6, `${stepperInfo} buttons`);
await page.evaluate(() => {
  [...document.querySelectorAll("button")].find((b) => b.getAttribute("aria-label") === "Increase by 100")?.click();
});
await new Promise((r) => setTimeout(r, 400));
const qtyAfter = await page.evaluate(() => document.querySelector("[role='group'][aria-label*='Quantity'] span[aria-live]")?.textContent);
ok("+100 tap works", qtyAfter === "101", `qty=${qtyAfter}`);

// Note visible with bag weight.
const note = await page.evaluate(() => document.body.innerText.includes("35–40 kg"));
ok("bag weight note shown", note);

// 2. Pidicryl: per-drum price.
await page.goto("http://localhost:3100/products/pidicryl-126-m", { waitUntil: "networkidle0", timeout: 90000 });
await new Promise((r) => setTimeout(r, 700));
const drum = await page.evaluate(() => document.body.innerText.includes("6,500") && document.body.innerText.includes("Drum"));
ok("pidicryl shows ₹6,500/Drum", drum);
const pidSteps = await page.evaluate(() => {
  const group = document.querySelector("[role='group'][aria-label*='Quantity']");
  return group ? group.querySelectorAll("button").length : 0;
});
ok("pidicryl stepper is ±1/±10 (4 buttons)", pidSteps === 4, `${pidSteps} buttons`);

// 3. Add 2 drums to cart → line unit Drum and total ₹13,000.
await page.evaluate(() => {
  [...document.querySelectorAll("button")]
    .find((b) => b.textContent?.trim().includes("Add to cart"))?.click();
});
await new Promise((r) => setTimeout(r, 500));
await page.evaluate(() => {
  [...document.querySelectorAll("button")]
    .find((b) => b.textContent?.trim().includes("Add to cart"))?.click();
});
await new Promise((r) => setTimeout(r, 500));
const cartState = await page.evaluate(() => JSON.parse(localStorage.getItem("gph-cart") || "{}"));
const line = cartState?.state?.lines?.find((l) => l.productId === "gph-01");
ok("cart line: 2 drums @ ₹6,500", line?.qty === 2 && line?.amount === 6500 && line?.unit === "Drum", JSON.stringify({ qty: line?.qty, amount: line?.amount, unit: line?.unit }));

// 4. CMC/chamki: kg stepper note.
await page.goto("http://localhost:3100/products/cmc-powder", { waitUntil: "networkidle0", timeout: 90000 });
await new Promise((r) => setTimeout(r, 700));
const cmcNote = await page.evaluate(() => document.body.innerText.includes("7 kg or 13 kg"));
ok("cmc shows odd-weight note", cmcNote);

await browser.close();
