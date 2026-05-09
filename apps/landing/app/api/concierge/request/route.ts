/**
 * [SERIOUSSEQUEL_CONCIERGE] POST /api/concierge/request
 *
 * Concierge-tier reference-call request (docs/12 §3.3, docs/13 Phase 1).
 *
 * Body:    { name, role, company, urgency, message? }
 * Returns: { ok: true, eta: "within 4 business hours" }
 *
 * Server flow:
 *   1. Validate body (required fields, length caps).
 *   2. Honeypot check — reject if honeypot field is filled (bot).
 *   3. Emit Telegram channel ping via lib/telegram.ts.
 *   4. Emit Postmark email to desk@gpt-store-custom-gpt.prin7r.com.
 *   5. Respond with success (desk integrations are fire-and-forget).
 *
 * Rate limit: 5 req/min/IP at Traefik (docs/12 §7 threat 2).
 * Honeypot: CSS-hidden field catches bots; 200 returned but desk NOT paged.
 */

import { NextResponse } from "next/server";
import {
  sendTelegramMessage,
  formatConciergeTelegramMessage,
} from "@/lib/telegram";
import {
  sendPostmarkEmail,
  formatConciergeEmail,
} from "@/lib/postmark";
import { optionalEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGE_LENGTH = 2000;

type ConciergeBody = {
  name?: string;
  role?: string;
  company?: string;
  urgency?: string;
  message?: string;
  /** Honeypot field — hidden via CSS. If filled, it's a bot. */
  website?: string;
};

export async function POST(request: Request) {
  let body: ConciergeBody = {};
  try {
    body = (await request.json()) as ConciergeBody;
  } catch {
    return NextResponse.json(
      { error: { code: "invalid_body", message: "Request body must be valid JSON." } },
      { status: 400 }
    );
  }

  // Honeypot check (docs/13 Phase 1 task 6)
  if (body.website && body.website.trim().length > 0) {
    console.log("[SERIOUSSEQUEL_CONCIERGE] [BOT_REJECTED] honeypot field filled");
    // Return 200 so bot doesn't know it was detected, but don't page the desk
    return NextResponse.json({ ok: true, eta: "within 4 business hours" });
  }

  // Validate required fields
  const name = sanitize(body.name, 200);
  const role = sanitize(body.role, 200);
  const company = sanitize(body.company, 200);
  const urgency = sanitize(body.urgency, 100);
  const message = sanitize(body.message, MAX_MESSAGE_LENGTH);

  if (!name || !role || !company || !urgency) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_body",
          message: "Missing required fields: name, role, company, urgency are all required.",
        },
      },
      { status: 400 }
    );
  }

  const details = { name, role, company, urgency, message: message || undefined };

  // Fire-and-forget: Telegram + Postmark simultaneously
  const [telegramOk, postmarkOk] = await Promise.all([
    sendTelegramMessage({
      text: formatConciergeTelegramMessage(details),
      parseMode: "HTML",
    }),
    (async () => {
      const deskEmail = optionalEnv("POSTMARK_DESK_EMAIL") ?? "desk@gpt-store-custom-gpt.prin7r.com";
      const fromEmail = optionalEnv("POSTMARK_FROM_EMAIL") ?? "desk@gpt-store-custom-gpt.prin7r.com";
      const email = formatConciergeEmail(details);
      return sendPostmarkEmail({
        from: fromEmail,
        to: deskEmail,
        subject: email.subject,
        htmlBody: email.htmlBody,
        textBody: email.textBody,
      });
    })(),
  ]);

  console.log(
    `[SERIOUSSEQUEL_CONCIERGE] request received name=${name} company=${company} telegram=${telegramOk} postmark=${postmarkOk}`
  );

  return NextResponse.json({
    ok: true,
    eta: "within 4 business hours",
  });
}

function sanitize(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}
