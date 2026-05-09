/**
 * [SERIOUSSEQUEL_POSTMARK] Postmark email helpers for engagement-desk notifications.
 *
 * Sends transactional emails via Postmark API. Never logs the server token.
 * Used by the concierge request flow and NOWPayments IPN handler.
 */

import { optionalEnv } from "@/lib/env";

const POSTMARK_API_BASE = "https://api.postmarkapp.com";

export type PostmarkEmail = {
  from: string;
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  messageStream?: string;
};

/**
 * Sends a transactional email via Postmark.
 * Returns true on success, false on failure (non-blocking — desk also gets Telegram).
 */
export async function sendPostmarkEmail(email: PostmarkEmail): Promise<boolean> {
  const serverToken = optionalEnv("POSTMARK_TOKEN");

  if (!serverToken) {
    console.log("[SERIOUSSEQUEL_POSTMARK] Skipping — POSTMARK_TOKEN not set");
    return false;
  }

  const url = `${POSTMARK_API_BASE}/email`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "accept": "application/json",
        "x-postmark-server-token": serverToken,
      },
      body: JSON.stringify({
        From: email.from,
        To: email.to,
        Subject: email.subject,
        HtmlBody: email.htmlBody,
        TextBody: email.textBody,
        MessageStream: email.messageStream ?? "outbound",
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(`[SERIOUSSEQUEL_POSTMARK] Failed (${response.status}): ${body.slice(0, 300)}`);
      return false;
    }

    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : "unknown";
    console.error(`[SERIOUSSEQUEL_POSTMARK] Error: ${msg}`);
    return false;
  }
}

/**
 * Formats a concierge request into a Postmark email body.
 */
export function formatConciergeEmail(details: {
  name: string;
  role: string;
  company: string;
  urgency: string;
  message?: string;
}): { subject: string; htmlBody: string; textBody: string } {
  const subject = `[Concierge] New inquiry from ${details.name} at ${details.company}`;

  const textBody = [
    `New Concierge Request`,
    ``,
    `Name: ${details.name}`,
    `Role: ${details.role}`,
    `Company: ${details.company}`,
    `Urgency: ${details.urgency}`,
    details.message ? `Message: ${details.message}` : "",
    ``,
    `Submitted via landing concierge form at https://gpt-store-custom-gpt.prin7r.com`,
  ]
    .filter(Boolean)
    .join("\n");

  const htmlBody = [
    `<h2>New Concierge Request</h2>`,
    `<table>`,
    `<tr><td><strong>Name:</strong></td><td>${escapeHtml(details.name)}</td></tr>`,
    `<tr><td><strong>Role:</strong></td><td>${escapeHtml(details.role)}</td></tr>`,
    `<tr><td><strong>Company:</strong></td><td>${escapeHtml(details.company)}</td></tr>`,
    `<tr><td><strong>Urgency:</strong></td><td>${escapeHtml(details.urgency)}</td></tr>`,
    details.message ? `<tr><td><strong>Message:</strong></td><td>${escapeHtml(details.message)}</td></tr>` : "",
    `</table>`,
    `<p><em>Submitted via landing concierge form</em></p>`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, htmlBody, textBody };
}

/**
 * Formats a NOWPayments IPN notification into a Postmark email body.
 */
export function formatIpnEmail(details: {
  orderId: string;
  plan: string;
  status: string;
  payerEmail?: string;
}): { subject: string; htmlBody: string; textBody: string } {
  const subject = `[NOWPayments] ${details.status} — ${details.orderId}`;

  const textBody = [
    `Payment Update`,
    ``,
    `Order: ${details.orderId}`,
    `Plan: ${details.plan}`,
    `Status: ${details.status}`,
    details.payerEmail ? `Payer: ${details.payerEmail}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const htmlBody = [
    `<h2>Payment Update</h2>`,
    `<table>`,
    `<tr><td><strong>Order:</strong></td><td>${escapeHtml(details.orderId)}</td></tr>`,
    `<tr><td><strong>Plan:</strong></td><td>${escapeHtml(details.plan)}</td></tr>`,
    `<tr><td><strong>Status:</strong></td><td>${escapeHtml(details.status)}</td></tr>`,
    details.payerEmail ? `<tr><td><strong>Payer:</strong></td><td>${escapeHtml(details.payerEmail)}</td></tr>` : "",
    `</table>`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, htmlBody, textBody };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
