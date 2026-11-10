import puppeteer from "puppeteer-core";

const base = process.argv[2] ?? "http://localhost:3100";

const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

async function shot(path, name, viewport) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.goto(`${base}${path}`, { waitUntil: "networkidle0", timeout: 90000 });
  await new Promise((r) => setTimeout(r, 900));
  await page.screenshot({ path: `/tmp/opencode/shot-${name}.png` });
  await page.close();
  console.log("shot", name);
}

const mobile = { width: 412, height: 2600, deviceScaleFactor: 1.75 };
const desktop = { width: 1440, height: 1400, deviceScaleFactor: 1 };

await shot("/", "home-mobile", mobile);
await shot("/", "home-desktop", desktop);
await shot("/products", "products-desktop", desktop);
await shot("/products/madrasi-dana-wall-texture", "detail-desktop", desktop);
await browser.close();
