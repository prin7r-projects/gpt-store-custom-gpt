/**
 * [SERIOUSSEQUEL_NOWPAYMENTS_CHECKOUT] POST /api/checkout/nowpayments
 *
 * Body:    { plan: "engagement" | "subscription" | "concierge" }
 * Returns: { invoice_url: string, invoice_id: string, plan: string, mode: "live" }
 *          on success.
 *
 * Errors  HTTP 400  for unknown plan ids
 *         HTTP 503  for missing env (operator gap, not auth)
 *         HTTP 502  for upstream NOWPayments failures
 *
 * The customer is redirected client-side to `invoice_url`. NOWPayments handles
 * USDT/USDC checkout and, when fiat partner routing is enabled on the
 * NOWPayments account, the card on-ramp. Never logs the API key.
 */

import { NextResponse } from "next/server";
import { MissingEnvError, appUrlFromRequest } from "@/lib/env";
import { PLANS, createNowpaymentsInvoice, isPlanId } from "@/lib/nowpayments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutBody = { plan?: string };

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
        message: `Unknown plan: ${String(planId)}. Allowed: ${Object.keys(PLANS).join(", ")}.`
      },
      { status: 400 }
    );
  }
  const plan = PLANS[planId];
  const baseUrl = appUrlFromRequest(request);

  try {
    const invoice = await createNowpaymentsInvoice({ plan, baseUrl });
    return NextResponse.json({
      mode: "live",
      plan: plan.id,
      setup_usd: plan.setupUsd,
      invoice_id: invoice.id,
      invoice_url: invoice.invoice_url
    });
  } catch (error) {
    if (error instanceof MissingEnvError) {
      return NextResponse.json(
        {
          error: "missing_env",
          missing: error.envName,
          message:
            "NOWPayments is not configured on this deployment yet. Email desk@gpt-store-custom-gpt.prin7r.com and we'll hand-wire the invoice."
        },
        { status: 503 }
      );
    }
    const message = error instanceof Error ? error.message : "unknown_error";
    return NextResponse.json({ error: "upstream_error", message }, { status: 502 });
  }
}
