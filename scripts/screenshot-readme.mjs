import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";

const base = process.argv[2] ?? "http://localhost:3100";
await mkdir("docs/screenshots", { recursive: true });

const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

async function shot(path, name, viewport) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.goto(`${base}${path}`, { waitUntil: "networkidle0", timeout: 90000 });
  await new Promise((r) => setTimeout(r, 1600));
  await page.screenshot({ path: `docs/screenshots/${name}.png` });
  await page.close();
  console.log("shot", name);
}

const desktop = { width: 1366, height: 900, deviceScaleFactor: 1 };
const mobile = { width: 412, height: 900, deviceScaleFactor: 2 };

await shot("/", "home-desktop", desktop);
await shot("/", "home-mobile", mobile);
await shot("/products", "catalog-desktop", desktop);
await shot("/products/madrasi-dana-wall-texture", "product-desktop", desktop);
await shot("/about", "facade-demo-desktop", desktop);
await shot("/checkout", "checkout-desktop", desktop);

// Cart drawer open
{
  const page = await browser.newPage();
  await page.setViewport(desktop);
  await page.goto(`${base}/products`, { waitUntil: "networkidle0", timeout: 90000 });
  await page.evaluate(() => {
    const card = [...document.querySelectorAll("article")].find((a) =>
      a.textContent?.includes("Pidicryl"),
    );
    [...card.querySelectorAll("button")]
      .find((b) => b.getAttribute("aria-label")?.includes("Add to cart"))
      ?.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.click("[data-cart-button]");
  await new Promise((r) => setTimeout(r, 900));
  await page.screenshot({ path: "docs/screenshots/cart-drawer.png" });
  await page.close();
  console.log("shot cart-drawer");
}

await browser.close();
