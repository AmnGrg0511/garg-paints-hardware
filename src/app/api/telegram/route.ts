import { handleBotMessage, type OverridesFile } from "@/lib/bot";

export const runtime = "nodejs";

/**
 * Telegram webhook for @GargPaintsBot — the shop's rate-control channel.
 *
 * Telegram POSTs every message here. The bot token never appears in the
 * URL; Telegram signs each call with X-Telegram-Bot-Api-Secret-Token
 * (configured via setWebhook's secret_token), which this route verifies.
 *
 * Admin commands come only from chats listed in ADMIN_CHAT_IDS. Every
 * other chat gets a polite redirect to the shop — and is relayed to the
 * owner as a possible lead, since someone messaging the shop's bot is a
 * warm enquiry.
 *
 * Rate changes commit catalog.overrides.json through the GitHub contents
 * API, so the update is version-controlled and Vercel's git integration
 * deploys it automatically — live in about a minute.
 */

const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const adminChats = (process.env.ADMIN_CHAT_IDS ?? "")
  .split(",")
  .map((chat) => chat.trim())
  .filter(Boolean);
const repo =
  process.env.GITHUB_REPO ?? "AmnGrg0511/garg-paints-hardware";
const overridesPath = "catalog.overrides.json";

async function sendTelegram(chatId: string, text: string): Promise<boolean> {
  if (!botToken) return false;
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
        signal: AbortSignal.timeout(8000),
      },
    );
    return response.ok;
  } catch {
    return false;
  }
}

async function fetchOverridesFile(): Promise<{
  content: string;
  sha: string;
} | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;
  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/contents/${overridesPath}?ref=main`,
      {
        headers: {
          authorization: `Bearer ${token}`,
          accept: "application/vnd.github+json",
        },
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!response.ok) return null;
    const data = (await response.json()) as {
      sha?: string;
      content?: string;
    };
    if (!data.content) return null;
    return {
      sha: data.sha ?? "",
      content: Buffer.from(data.content, "base64").toString("utf8"),
    };
  } catch {
    return null;
  }
}

async function commitOverridesFile(
  content: string,
  message: string,
  sha: string | null,
): Promise<boolean> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return false;
  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/contents/${overridesPath}`,
      {
        method: "PUT",
        headers: {
          authorization: `Bearer ${token}`,
          accept: "application/vnd.github+json",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          message,
          content: Buffer.from(content, "utf8").toString("base64"),
          branch: "main",
          ...(sha ? { sha } : {}),
          committer: { name: "GargPaintsBot", email: "bot@gargpaints.example" },
        }),
        signal: AbortSignal.timeout(15000),
      },
    );
    return response.ok;
  } catch {
    return false;
  }
}

type TelegramUpdate = {
  message?: {
    chat?: { id?: number };
    from?: { first_name?: string; username?: string };
    text?: string;
  };
};

export async function POST(request: Request) {
  if (!secret || request.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return Response.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const chatId = update.message?.chat?.id;
  const text = update.message?.text ?? "";
  if (typeof chatId !== "number" || !text) {
    return Response.json({ ok: true, ignored: true });
  }
  const chatIdString = String(chatId);

  // Strangers: point them to the shop, and let the owner know someone
  // reached out to the bot — a warm lead arriving on its own.
  if (!adminChats.includes(chatIdString)) {
    const who = [
      update.message?.from?.first_name ?? "Someone",
      update.message?.from?.username ? `(@${update.message.from.username})` : "",
    ]
      .filter(Boolean)
      .join(" ");
    await sendTelegram(
      adminChats[0] ?? "",
      `New message to @GargPaintsBot from ${who} — chat id ${chatIdString}:\n\n${text}`,
    );
    await sendTelegram(
      chatIdString,
      "Namaste! This number is for the shop's website. To order paint materials, message the shop on WhatsApp: https://wa.me/919899284391 — or browse the catalogue first: https://garg-paints-hardware.vercel.app",
    );
    return Response.json({
      ok: true,
      admin: false,
      reply: "Namaste! This number is for the shop's website. To order paint materials, message the shop on WhatsApp: https://wa.me/919899284391 — or browse the catalogue first: https://garg-paints-hardware.vercel.app",
    });
  }

  const outcome = handleBotMessage(text);
  let committed = false;
  let dryRun: string | null = null;

  if (outcome.change) {
    const file = await fetchOverridesFile();
    if (!file) {
      // No GitHub token yet: report the computed change without committing.
      dryRun = outcome.change.content;
      outcome.reply +=
        "\n\n⚠️ Not committed — GITHUB_TOKEN is not configured on the server yet.";
    } else {
      let current: OverridesFile;
      try {
        current = JSON.parse(file.content) as OverridesFile;
      } catch {
        return Response.json({
          ok: true,
          admin: true,
          committed: false,
          reply:
            "⚠️ catalog.overrides.json on GitHub is not valid JSON — fix it in the repo, then retry.",
        });
      }
      const fresh = handleBotMessage(text, current);
      if (!fresh.change) {
        // The fresh file already reflects this command — nothing to commit.
        await sendTelegram(chatIdString, fresh.reply);
        return Response.json({
          ok: true,
          admin: true,
          committed: false,
          reply: fresh.reply,
        });
      }
      committed = await commitOverridesFile(
        fresh.change.content,
        fresh.change.message,
        file.sha,
      );
      outcome.reply = committed
        ? `${fresh.reply}\nCommitted — live on the site in about a minute.`
        : `⚠️ ${fresh.change.summary}\nGitHub rejected the commit — check the token's expiry and scope (needs Contents: read + write).`;
    }
  }

  await sendTelegram(chatIdString, outcome.reply);
  return Response.json({
    ok: true,
    admin: true,
    committed,
    ...(outcome.status ? { status: outcome.status } : {}),
    ...(dryRun ? { dryRun } : {}),
    reply: outcome.reply,
  });
}
