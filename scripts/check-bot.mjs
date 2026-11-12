import puppeteer from "puppeteer-core";

/**
 * E2E for the Telegram rate-control webhook (/api/telegram).
 *
 * Runs against the local server (no TELEGRAM_BOT_TOKEN, no GITHUB_TOKEN),
 * so bot replies are returned in the JSON response instead of being sent,
 * and rate changes come back as a `dryRun` payload with the exact content
 * that would be committed to catalog.overrides.json.
 *
 * Usage: node scripts/check-bot.mjs [base-url]
 */

const base = process.argv[2] ?? "http://localhost:3100";
const SECRET = "local-test-secret";
const OWNER = "6382975901";

const browser = await puppeteer.launch({
  executablePath: "/tmp/opencode/chrome/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.goto(`${base}/`, { waitUntil: "domcontentloaded", timeout: 90000 });

const ok = (n, p, d = "") => console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? " — " + d : ""}`);

async function post(body, headers = { "x-telegram-bot-api-secret-token": SECRET }) {
  const res = await page.evaluate(
    async ({ url, body, headers }) => {
      const r = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json", ...headers },
        body: JSON.stringify(body),
      });
      let json = null;
      try {
        json = await r.json();
      } catch {}
      return { status: r.status, json };
    },
    { url: `${base}/api/telegram`, body, headers },
  );
  return res;
}

const update = (text, chatId = Number(OWNER)) => ({
  message: { chat: { id: chatId }, from: { first_name: "Aman" }, text },
});

// 1. Wrong secret rejected.
const bad = await post(update("/rates"), { "x-telegram-bot-api-secret-token": "wrong" });
ok("wrong webhook secret rejected", bad.status === 401, String(bad.status));

// 2. Unknown chat: polite redirect, not admin.
const stranger = await post(update("hello?", 9911223344));
ok("stranger gets a shop redirect", stranger.status === 200 && stranger.json?.admin === false);
ok("stranger reply points to WhatsApp", /wa\.me\/919899284391/.test(stranger.json?.reply ?? ""));

// 3. Owner /rates lists live rates.
const rates = await post(update("/rates"));
ok("/rates lists Pidicryl at ₹ 6,500/Drum", (rates.json?.reply ?? "").includes("₹ 6,500/Drum"));
ok("/rates lists Madrasi white at ₹ 150/Bag", (rates.json?.reply ?? "").includes("White Madrasi Dana — ₹ 150/Bag"));
ok("/rates marks quote-only shades", (rates.json?.reply ?? "").includes("Green Madrasi Dana — Contact for Price"));

// 4. Simple product rate: dry-run content exact.
const pid = await post(update("/price pidicryl 6800"));
ok("/price pidicryl replies with old → new", (pid.json?.reply ?? "").includes("₹ 6,500/Drum → ₹ 6,800/Drum"));
const pidRates = JSON.parse(pid.json?.dryRun ?? "{}").rates ?? {};
ok("pidicryl override content exact", pidRates["gph-01"]?.price === "₹ 6,800/Drum", pid.json?.dryRun?.slice(0, 80));

// 5. Variant rate via alias.
const white = await post(update("/price madrasi white 165"));
const whiteRates = JSON.parse(white.json?.dryRun ?? "{}").rates ?? {};
ok("madrasi white override exact", whiteRates["gph-02"]?.variants?.["White Madrasi Dana"] === "₹ 165/Bag");

// 6. Variant rate via id + Indian comma formatting.
const danaId = await post(update("/price gph-02 red 1,250"));
const redRates = JSON.parse(danaId.json?.dryRun ?? "{}").rates ?? {};
ok("red override with comma rate formats en-IN", redRates["gph-02"]?.variants?.["Red Madrasi Dana"] === "₹ 1,250/Bag");

// 7. /quote on a priced variant: sets the generic quote-only copy.
const quote = await post(update("/quote madrasi white"));
const quoteRates = JSON.parse(quote.json?.dryRun ?? "{}").rates ?? {};
ok("/quote sets Contact for Price", quoteRates["gph-02"]?.variants?.["White Madrasi Dana"] === "Contact for Price");

// 8. /quote with the repo copy already active: no change proposed.
const already = await post(update("/quote cmc white"));
ok("/quote on already-quote-only is a no-op", !(already.json?.dryRun) && /already quote-only/.test(already.json?.reply ?? ""), already.json?.reply?.slice(0, 60));

// 9. Chamki golden via prefix.
const gold = await post(update("/price chamki gold 90"));
const goldRates = JSON.parse(gold.json?.dryRun ?? "{}").rates ?? {};
ok("chamki golden override exact", goldRates["gph-05"]?.variants?.["Golden Chamki Powder"] === "₹ 90/Kg");

// 10. Errors: unknown product, invalid rate, missing variant.
const unknown = await post(update("/price xyz 100"));
ok("unknown product suggests keys", /pidicryl, madrasi/.test(unknown.json?.reply ?? ""));
const badRate = await post(update("/price madrasi white free"));
ok("non-numeric rate rejected", /not a rate/.test(badRate.json?.reply ?? ""));
const noVariant = await post(update("/price madrasi 100"));
ok("variant product without shade asks which", /has shades/.test(noVariant.json?.reply ?? ""));

// 11. /reset clears overrides.
const reset = await post(update("/reset"));
const resetObj = JSON.parse(reset.json?.dryRun ?? "{}");
ok("/reset empties rates", resetObj.version === 1 && resetObj.updatedAt === null && Object.keys(resetObj.rates ?? {}).length === 0);

// 12. Non-command text from the owner gets a hint.
const chat = await post(update("kya haal hai"));
ok("owner non-command gets a hint", /\/rates/.test(chat.json?.reply ?? ""));

await browser.close();
