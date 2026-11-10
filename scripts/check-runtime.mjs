import puppeteer from "puppeteer-core";

const executablePath = "/tmp/opencode/chrome/chrome-linux64/chrome";
const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
  env: {
    ...process.env,
    LD_LIBRARY_PATH: "/tmp/opencode/libs/usr/lib/x86_64-linux-gnu",
  },
});
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 1.75 });

const messages = [];
page.on("console", (message) => {
  if (["error", "warning", "warn"].includes(message.type())) {
    messages.push(`[console.${message.type()}] ${message.text()}`);
  }
});
page.on("pageerror", (error) => {
  messages.push(`[pageerror] ${error.stack || error.message}`);
});
page.on("requestfailed", (request) => {
  messages.push(`[requestfailed] ${request.url()} ${request.failure()?.errorText}`);
});

const response = await page.goto(process.argv[2] ?? "http://localhost:3200/", {
  waitUntil: "networkidle0",
  timeout: 60000,
});
await new Promise((resolve) => setTimeout(resolve, 3000));

console.log("status", response?.status());
console.log("lang", await page.evaluate(() => document.documentElement.lang));
console.log("main", await page.evaluate(() => Boolean(document.querySelector("main"))));
console.log("bodyTextStart", (await page.evaluate(() => document.body.innerText)).slice(0, 200));
console.log("messages", messages.length ? messages.join("\n") : "none");
await browser.close();
