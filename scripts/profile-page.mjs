import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
const client = await page.createCDPSession();
await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 1.75 });
await client.send("Profiler.enable");
await client.send("Profiler.setSamplingInterval", { interval: 200 });
await client.send("Profiler.start");
await page.goto(process.argv[2] ?? "http://localhost:3100/", {
  waitUntil: "networkidle0",
  timeout: 120000,
});
await new Promise((resolve) => setTimeout(resolve, 4000));
const stopped = await client.send("Profiler.stop");
const profile = stopped.profile || (stopped.result && stopped.result.profile);
await browser.close();
if (!profile) {
  console.log("profiler keys:", Object.keys(stopped), JSON.stringify(stopped).slice(0, 200));
  process.exit(1);
}

// Aggregate self time per function from the CPU profile.
const nodes = new Map(profile.nodes.map((n) => [n.id, n]));
const self = new Map();
const byUrl = new Map();
for (const id of profile.samples || []) {
  const node = nodes.get(id);
  if (!node) continue;
  const f = node.callFrame;
  const label = `${(f.functionName || "(anon)").slice(0, 60)} @ ${String(f.url).split("/").pop()}:${f.lineNumber}`;
  self.set(label, (self.get(label) || 0) + 1);
  const url = String(f.url).split("/").pop() || "(inline)";
  byUrl.set(url, (byUrl.get(url) || 0) + 1);
}
const total = (profile.samples || []).length;
const interval = (profile.timeDeltas || []).reduce((a, b) => a + b, 0) / Math.max(total, 1) / 1000;
console.log(`samples ${total}, interval ~${interval.toFixed(2)}ms, wall ${(total * interval).toFixed(0)}ms`);
console.log("\nTop functions by self time:");
for (const [label, count] of [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 18)) {
  console.log(`  ${(count * interval).toFixed(0).padStart(5)}ms  ${label}`);
}
console.log("\nBy script:");
for (const [url, count] of [...byUrl.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)) {
  console.log(`  ${(count * interval).toFixed(0).padStart(5)}ms  ${url}`);
}
