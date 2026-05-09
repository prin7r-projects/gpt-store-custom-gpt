/**
 * [SERIOUSSEQUEL_NOWPAYMENTS_IPN] POST /api/webhooks/nowpayments
 *
 * NOWPayments delivers payment status updates here. Body is a JSON payload
 * with payment metadata; the `x-nowpayments-sig` header carries the
 * HMAC-SHA512 signature over the alphabetically sorted JSON.
 *
 * Server flow (docs/12 §3.2):
 *   1. Verify HMAC-SHA512 signature (constant-time compare).
 *   2. Log verified event with [SERIOUSSEQUEL_NOWPAYMENTS_IPN] tag — PII scrubbed.
 *   3. Emit Telegram channel ping with (order_id, plan, status, payer_email).
 *   4. Emit Postmark email to engagement-desk distribution list.
 *   5. (Phase 2) Write orders row to SQLite for marketing analytics.
 *
 * Auth:    HMAC-SHA512 in x-nowpayments-sig header.
 * Replay:  idempotent — same order_id is upserted, no double-counting.
 * PII:     NEVER logs pay_address, payout_hash, or full payload bodies.
 *
 * Errors:  503 missing IPN secret, 401 bad signature, 400 bad JSON.
 */

import { NextResponse } from "next/server";
import { optionalEnv } from "@/lib/env";
import { verifyNowpaymentsIpn } from "@/lib/nowpayments";
import { sendTelegramMessage, formatIpnTelegramMessage } from "@/lib/telegram";
import { sendPostmarkEmail, formatIpnEmail } from "@/lib/postmark";
import { confirmOrder } from "@/lib/orders-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = optionalEnv("NOWPAYMENTS_IPN_SECRET");
  if (!secret) {
    return NextResponse.json(
      {
        error: "missing_env",
        missing: "NOWPAYMENTS_IPN_SECRET",
        message: "Webhook handler is not configured.",
      },
      { status: 503 }
    );
  }

  // Read raw body for signature verification
  const rawBody = await request.text();
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "invalid_payload", message: "Body was not valid JSON." },
      { status: 400 }
    );
  }

  // Verify HMAC-SHA512 signature (constant-time compare)
  const signature = request.headers.get("x-nowpayments-sig");
  const verified = verifyNowpaymentsIpn(payload, signature, secret);
  if (!verified) {
    console.log(
      `[SERIOUSSEQUEL_NOWPAYMENTS_IPN] SIGNATURE_INVALID order_id=${stringValue(payload.order_id) ?? "unknown"}`
    );
    return NextResponse.json({ error: "signature_invalid" }, { status: 401 });
  }

  // Extract fields — PII-scrubbed: never log pay_address, payout_hash
  const status = stringValue(payload.payment_status) ?? "unknown";
  const paid = ["finished", "confirmed"].includes(status.toLowerCase());
  const orderId =
    stringValue(payload.order_id) ?? stringValue(payload.payment_id) ?? "nowpayments_unknown";
  const payerEmail = stringValue(payload.payer_email);
  const priceAmount = numberValue(payload.price_amount) ?? 0;

  // Determine plan from the order_id prefix
  const plan = extractPlanFromOrderId(orderId) ?? "unknown";

  // PII-scrubbed log line: never includes pay_address, payout_hash
  console.log(
    `[SERIOUSSEQUEL_NOWPAYMENTS_IPN] verified=true order_id=${orderId} status=${status} paid=${paid} plan=${plan} has_email=${Boolean(payerEmail)}`
  );

  // Fire-and-forget: Telegram + Postmark + orders DB write
  const [telegramOk, postmarkOk, dbOk] = await Promise.all([
    // Telegram channel ping
    sendTelegramMessage({
      text: formatIpnTelegramMessage({
        orderId,
        plan,
        status,
        payerEmail: payerEmail ?? undefined,
      }),
      parseMode: "HTML",
    }),

    // Postmark email to engagement desk
    (async () => {
      const deskEmail =
        optionalEnv("POSTMARK_DESK_EMAIL") ?? "desk@gpt-store-custom-gpt.prin7r.com";
      const fromEmail =
        optionalEnv("POSTMARK_FROM_EMAIL") ?? "desk@gpt-store-custom-gpt.prin7r.com";
      const email = formatIpnEmail({
        orderId,
        plan,
        status,
        payerEmail: payerEmail ?? undefined,
      });
      return sendPostmarkEmail({
        from: fromEmail,
        to: deskEmail,
        subject: email.subject,
        htmlBody: email.htmlBody,
        textBody: email.textBody,
      });
    })(),

    // Phase 2: confirm pending order (idempotent — preserves referral_source from checkout)
    (async () => {
      try {
        confirmOrder({
          order_id: orderId,
          invoice_id: stringValue(payload.invoice_id),
          payer_email: payerEmail ?? null,
          paid_at: Math.floor(Date.now() / 1000),
          status: paid ? "paid" : status,
        });
        return true;
      } catch (err) {
        console.error(
          `[SERIOUSSEQUEL_NOWPAYMENTS_IPN] orders_db write failed: ${err instanceof Error ? err.message : "unknown"}`
        );
        return false;
      }
    })(),
  ]);

  console.log(
    `[SERIOUSSEQUEL_NOWPAYMENTS_IPN] dispatched telegram=${telegramOk} postmark=${postmarkOk} orders_db=${dbOk}`
  );

  return NextResponse.json({
    ok: true,
    verified: true,
    paid,
    order_id: orderId,
    status,
  });
}

function stringValue(value: unknown): string | undefined {
  if (typeof value === "string" || typeof value === "number") return String(value);
  return undefined;
}

function numberValue(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

/**
 * Extract plan from order_id prefix. Our order IDs are generated as
 * `serioussequel_{plan}_{ts}_{rand}` in createNowpaymentsInvoice.
 */
function extractPlanFromOrderId(orderId: string): string | undefined {
  const match = orderId.match(/^serioussequel_(engagement|subscription|concierge)_/);
  return match?.[1];
}
