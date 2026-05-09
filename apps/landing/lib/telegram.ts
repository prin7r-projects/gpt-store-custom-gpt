/**
 * [SERIOUSSEQUEL_TELEGRAM] Telegram Bot API helpers for engagement-desk pings.
 *
 * Sends formatted messages to the operator Telegram channel. Never logs
 * the bot token. Used by the concierge request flow and NOWPayments IPN handler.
 */

import { optionalEnv } from "@/lib/env";

const TELEGRAM_API_BASE = "https://api.telegram.org";

export type TelegramMessage = {
  text: string;
  parseMode?: "HTML" | "MarkdownV2";
};

/**
 * Sends a message to the engagement-desk Telegram channel.
 * Returns true on success, false on failure (non-blocking — desk also gets Postmark).
 */
export async function sendTelegramMessage(message: TelegramMessage): Promise<boolean> {
  const botToken = optionalEnv("TELEGRAM_BOT_TOKEN");
  const chatId = optionalEnv("TELEGRAM_DESK_CHANNEL_ID");

  if (!botToken || !chatId) {
    console.log("[SERIOUSSEQUEL_TELEGRAM] Skipping — TELEGRAM_BOT_TOKEN or TELEGRAM_DESK_CHANNEL_ID not set");
    return false;
  }

  const url = `${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message.text,
        parse_mode: message.parseMode ?? "HTML",
        disable_web_page_preview: true,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(`[SERIOUSSEQUEL_TELEGRAM] Failed (${response.status}): ${body.slice(0, 300)}`);
      return false;
    }

    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : "unknown";
    console.error(`[SERIOUSSEQUEL_TELEGRAM] Error: ${msg}`);
    return false;
  }
}

/**
 * Formats a concierge request into a Telegram message for the desk channel.
 */
export function formatConciergeTelegramMessage(details: {
  name: string;
  role: string;
  company: string;
  urgency: string;
  message?: string;
}): string {
  return [
    `<b>🟡 [CONCIERGE_REQUEST] New Concierge Inquiry</b>`,
    ``,
    `<b>Name:</b> ${escapeHtml(details.name)}`,
    `<b>Role:</b> ${escapeHtml(details.role)}`,
    `<b>Company:</b> ${escapeHtml(details.company)}`,
    `<b>Urgency:</b> ${escapeHtml(details.urgency)}`,
    details.message ? `<b>Message:</b> ${escapeHtml(details.message)}` : "",
    ``,
    `<i>Submitted via landing concierge form</i>`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Formats a NOWPayments IPN notification into a Telegram message.
 */
export function formatIpnTelegramMessage(details: {
  orderId: string;
  plan: string;
  status: string;
  payerEmail?: string;
}): string {
  return [
    `<b>💰 [SERIOUSSEQUEL_NOWPAYMENTS_IPN] Payment Update</b>`,
    ``,
    `<b>Order:</b> ${escapeHtml(details.orderId)}`,
    `<b>Plan:</b> ${escapeHtml(details.plan)}`,
    `<b>Status:</b> ${escapeHtml(details.status)}`,
    details.payerEmail ? `<b>Payer:</b> ${escapeHtml(details.payerEmail)}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
