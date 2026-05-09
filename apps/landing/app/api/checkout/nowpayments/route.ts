/**
 * [SERIOUSSEQUEL_NOWPAYMENTS_CHECKOUT] POST /api/checkout/nowpayments
 *
 * Body:    { plan: "engagement" | "subscription" | "concierge", referralSource?: string }
 * Returns: { invoice_url: string, invoice_id: string, plan: string, mode: "live" }
 *          on success.
 *
 * Errors:  HTTP 400 for unknown plan ids
 *          HTTP 503 for missing env (operator gap, not auth)
 *          HTTP 502 for upstream NOWPayments failures
 *
 * Referral tracking (Phase 2): the referralSource field is passed through to
 * the NOWPayments invoice description. The webhook handler writes it to the
 * orders table when payment completes (from the order_id → plan mapping).
 *
 * The customer is redirected client-side to `invoice_url`. NOWPayments handles
 * USDT/USDC checkout and, when fiat partner routing is enabled on the
 * NOWPayments account, the card on-ramp. Never logs the API key.
 */

import { NextResponse } from "next/server";
import { MissingEnvError, appUrlFromRequest } from "@/lib/env";
import { PLANS, createNowpaymentsInvoice, isPlanId } from "@/lib/nowpayments";
import { insertPendingOrder } from "@/lib/orders-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutBody = { plan?: string; referralSource?: string };

export async function POST(request: Request) {
  let body: CheckoutBody = {};
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    body = {};
  }

  const planId = body.plan;
  if (!isPlanId(planId)) {
    return NextResponse.json(
      {
        error: "unknown_plan",
        message: `Unknown plan: ${String(planId)}. Allowed: ${Object.keys(PLANS).join(", ")}.`,
      },
      { status: 400 }
    );
  }
  const plan = PLANS[planId];
  const baseUrl = appUrlFromRequest(request);

  // Capture referral source (Phase 2 marketing analytics)
  const referralSource = sanitizeReferral(body.referralSource);
  if (referralSource) {
    console.log(`[SERIOUSSEQUEL_CHECKOUT] referral_source=${referralSource} plan=${plan.id}`);
  }

  try {
    const invoice = await createNowpaymentsInvoice({ plan, baseUrl });

    // Phase 2: write pending order with referral source (confirmed on IPN)
    try {
      insertPendingOrder({
        order_id: invoice.id,
        plan: plan.id,
        amount_usd: plan.setupUsd,
        referral_source: referralSource ?? null,
      });
    } catch (err) {
      console.error(
        `[SERIOUSSEQUEL_CHECKOUT] orders_db pending write failed: ${err instanceof Error ? err.message : "unknown"}`
      );
    }

    return NextResponse.json({
      mode: "live",
      plan: plan.id,
      setup_usd: plan.setupUsd,
      invoice_id: invoice.id,
      invoice_url: invoice.invoice_url,
      referral_source: referralSource || undefined,
    });
  } catch (error) {
    if (error instanceof MissingEnvError) {
      return NextResponse.json(
        {
          error: "missing_env",
          missing: error.envName,
          message:
            "NOWPayments is not configured on this deployment yet. Email desk@gpt-store-custom-gpt.prin7r.com and we'll hand-wire the invoice.",
        },
        { status: 503 }
      );
    }
    const message = error instanceof Error ? error.message : "unknown_error";
    return NextResponse.json({ error: "upstream_error", message }, { status: 502 });
  }
}

function sanitizeReferral(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 100) return null;
  // Only allow alphanumeric, hyphens, underscores
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) return null;
  return trimmed;
}
