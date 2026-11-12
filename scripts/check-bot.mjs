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

// 3. Owner /rates is a copy-edit-resend sheet in command form. The sheet
// mirrors the live catalogue, so assertions stay structural (the owner
// changes rates freely from Telegram).
const rates = await post(update("/rates"));
const ratesText = rates.json?.reply ?? "";
const sheetLines = (ratesText.match(/^\/(price|quote) .+$/gm) ?? []);
ok("/rates sheet has a command line per rate", sheetLines.length === 11, `${sheetLines.length} lines`);
ok("/rates sheet lines are well-formed",
  sheetLines.every((l) =>
    /^\/price \S+( \S+)? \d[\d,]*$/.test(l) || /^\/quote \S+ \S+$/.test(l),
  ),
  sheetLines.slice(0, 3).join(" | "));
const whiteRate = Number(ratesText.match(/madrasi white (\d+)/)?.[1] ?? 0);
ok("/rates sheet shows a positive white rate", whiteRate > 0, String(whiteRate));

// 3b. Round-trip: pasting the untouched sheet back changes nothing.
const roundTrip = await post(update(ratesText));
ok("untouched sheet round-trips to no change",
  roundTrip.json?.status === "unchanged" && !roundTrip.json?.dryRun && /No changes/.test(roundTrip.json?.reply ?? ""),
  (roundTrip.json?.reply ?? "").slice(0, 60));

// 3c. Round-trip with one edit: only that line commits.
const newWhite = whiteRate + 15;
const editedSheet = ratesText.replace(/(madrasi white )(\d+)/, (m, p1) => `${p1}${newWhite}`);
const edited = await post(update(editedSheet));
const editedRates = JSON.parse(edited.json?.dryRun ?? "{}").rates ?? {};
ok("one edited line commits exactly once",
  edited.json?.committed === false &&
  editedRates["gph-02"]?.variants?.["White Madrasi Dana"] === `₹ ${newWhite.toLocaleString("en-IN")}/Bag` &&
  Object.keys(editedRates).length === 1,
  (edited.json?.reply ?? "").split("\n")[0]);

// 4. Simple product rate: dry-run content exact.
const pid = await post(update("/price pidicryl 6800"));
ok("/price pidicryl replies with short key + new rate",
  (pid.json?.reply ?? "").includes("pidicryl") &&
    /₹ [\d,]+\/Drum → ₹ 6,800\/Drum/.test(pid.json?.reply ?? ""));
const pidRates = JSON.parse(pid.json?.dryRun ?? "{}").rates ?? {};
ok("pidicryl override content exact", pidRates["gph-01"]?.price === "₹ 6,800/Drum");

// 4b. Same-value rate is a no-op (sheet round-trips need this).
const pidRate = Number(ratesText.match(/pidicryl (\d+)/)?.[1] ?? 0);
const noop = await post(update(`/price pidicryl ${pidRate}`));
ok("same-value rate is a no-op",
  noop.json?.status === "unchanged" && !noop.json?.dryRun &&
    new RegExp(`already ₹ ${pidRate.toLocaleString("en-IN")}/Drum`).test(noop.json?.reply ?? ""));

// 5. Variant rate via alias.
const white = await post(update("/price madrasi white 165"));
const whiteRates = JSON.parse(white.json?.dryRun ?? "{}").rates ?? {};
ok("madrasi white override exact", whiteRates["gph-02"]?.variants?.["White Madrasi Dana"] === "₹ 165/Bag");
ok("madrasi white reply uses short key",
  /madrasi white/.test(white.json?.reply ?? "") &&
  (white.json?.reply ?? "").includes(`₹ ${whiteRate.toLocaleString("en-IN")}/Bag → ₹ 165/Bag`));

// 6. Variant rate via id + Indian comma formatting.
const danaId = await post(update("/price gph-02 red 1,250"));
const redRates = JSON.parse(danaId.json?.dryRun ?? "{}").rates ?? {};
ok("red override with comma rate formats en-IN", redRates["gph-02"]?.variants?.["Red Madrasi Dana"] === "₹ 1,250/Bag");

// 7. /quote on a priced variant: sets the generic quote-only copy.
const quote = await post(update("/quote madrasi white"));
const quoteRates = JSON.parse(quote.json?.dryRun ?? "{}").rates ?? {};
ok("/quote sets Contact for Price", quoteRates["gph-02"]?.variants?.["White Madrasi Dana"] === "Contact for Price");

// 8. /quote on a variant whose live rate equals its repo quote copy: no change.
const already = await post(update("/quote cmc white"));
ok("/quote no-op keeps the reply informative",
  already.json?.status === "unchanged" || Boolean(already.json?.dryRun),
  (already.json?.reply ?? "").slice(0, 60));

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
ok("variant product without shade lists short keys", /shades: white, red, yellow, green, black/.test(noVariant.json?.reply ?? ""), noVariant.json?.reply?.slice(0, 60));

// 11. /reset clears overrides.
const reset = await post(update("/reset"));
const resetObj = JSON.parse(reset.json?.dryRun ?? "{}");
ok("/reset empties rates", resetObj.version === 1 && resetObj.updatedAt === null && Object.keys(resetObj.rates ?? {}).length === 0);

// 12. Non-command text from the owner gets a hint.
const chat = await post(update("kya haal hai"));
ok("owner non-command gets a hint", /\/rates/.test(chat.json?.reply ?? ""));

// 13. Batch: several commands in one message → one commit, one deploy.
const batch = await post(update(
  "/price madrasi white 165\n/price madrasi red 210\n/price pidicryl 6800",
));
const batchRates = JSON.parse(batch.json?.dryRun ?? "{}").rates ?? {};
ok("batch applies every line once", (batch.json?.reply ?? "").includes("3 updates"));
ok("batch content has all three rates",
  batchRates["gph-02"]?.variants?.["White Madrasi Dana"] === "₹ 165/Bag" &&
  batchRates["gph-02"]?.variants?.["Red Madrasi Dana"] === "₹ 210/Bag" &&
  batchRates["gph-01"]?.price === "₹ 6,800/Drum");

// 14. Batch is all-or-nothing: one bad line holds back everything.
const badBatch = await post(update(
  "/price trowel 80\n/price madrsi white 165",
));
ok("bad line aborts the whole batch",
  badBatch.json?.status === "error" && !badBatch.json?.dryRun && /Nothing committed/.test(badBatch.json?.reply ?? ""));

// 15. Paste-friendly shorthand without the slash, with the dash.
const paste = await post(update(
  "/price trowel 82\nmadrasi yellow - 300",
));
const pasteRates = JSON.parse(paste.json?.dryRun ?? "{}").rates ?? {};
ok("paste-style lines parse and apply",
  pasteRates["gph-03"]?.price === "₹ 82/Piece" &&
  pasteRates["gph-02"]?.variants?.["Yellow Madrasi Dana"] === "₹ 300/Bag",
  paste.json?.reply?.split("\n").slice(0, 3).join(" | "));

// 16. /reset followed by /price: order respected inside one message.
const resetThen = await post(update(
  "/reset\n/price cmc white 45",
));
const resetRates = JSON.parse(resetThen.json?.dryRun ?? "{}").rates ?? {};
ok("reset + rate in one message respects order",
  Object.keys(resetRates).length === 1 && resetRates["gph-04"]?.variants?.["White CMC Powder"] === "₹ 45/Kg");

// 17. /rates inside a batch is skipped, not dumped.
const withRates = await post(update("/rates\n/price trowel 77"));
ok("info command inside batch is skipped with a note",
  /skipped \/rates/.test(withRates.json?.reply ?? "") && (withRates.json?.reply ?? "").includes("trowel"));

await browser.close();
