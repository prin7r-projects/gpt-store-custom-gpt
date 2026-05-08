/**
 * [TRANSCRIPT_NOWPAYMENTS] Server-side helpers for NOWPayments hosted invoice.
 *
 * After-the-GPT-Store project pricing: three engagement tiers (per-engagement,
 * subscription, concierge). Each maps to a NOWPayments hosted invoice for the
 * onboarding/setup charge; the recurring monthly is billed against the same
 * invoice id when the engagement starts.
 *
 * IPN signature verification mirrors payments-prototypes/src/lib/signatures.ts:
 * HMAC-SHA512 over JSON.stringify(sortObject(payload)).
 */

import crypto from "node:crypto";
import { MissingEnvError, optionalEnv } from "@/lib/env";

export type PlanId = "engagement" | "subscription" | "concierge";

export type Plan = {
  id: PlanId;
  name: string;
  setupUsd: number;
  monthlyUsd: number | null;
  description: string;
};

export const PLANS: Record<PlanId, Plan> = {
  engagement: {
    id: "engagement",
    name: "After-Store — Pay-per-engagement",
    setupUsd: 480,
    monthlyUsd: null,
    description:
      "Pay-per-engagement. One scoped problem the GPT can't finish: a single deliverable across one or two working sessions. We pick up the transcript from the Store, finish the job, and hand back artifacts. No retainer."
  },
  subscription: {
    id: "subscription",
    name: "After-Store — Monthly subscription",
    setupUsd: 690,
    monthlyUsd: 1480,
    description:
      "Monthly subscription. Onboarding charge plus the first month of weekly working sessions. Includes a private GPT tuned to your data, an editable workspace, two named operators, and Tuesday-Thursday checkpoints."
  },
  concierge: {
    id: "concierge",
    name: "After-Store — Concierge engagement",
    setupUsd: 4200,
    monthlyUsd: 5800,
    description:
      "Concierge engagement. Eight weeks, one cell of three operators, custom GPTs hosted under your brand, a named delivery lead, end-of-week artifact reviews, and a single Slack/Telegram channel for work in flight."
  }
};

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && value in PLANS;
}

export type CreateInvoiceInput = {
  plan: Plan;
  baseUrl: string;
};

export type NowpaymentsInvoice = {
  id: string;
  invoice_url: string;
  raw: Record<string, unknown>;
};

/**
 * Calls NOWPayments `POST /v1/invoice` to create a hosted invoice and returns
 * the invoice id + redirect URL. Never logs the API key.
 */
export async function createNowpaymentsInvoice(input: CreateInvoiceInput): Promise<NowpaymentsInvoice> {
  const apiKey = optionalEnv("NOWPAYMENTS_API_KEY");
  if (!apiKey) throw new MissingEnvError("NOWPAYMENTS_API_KEY");

  const sandbox = (optionalEnv("NOWPAYMENTS_SANDBOX") ?? "false").toLowerCase() === "true";
  const apiBase = sandbox ? "https://api-sandbox.nowpayments.io" : "https://api.nowpayments.io";

  const orderId = `afterstore_${input.plan.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const body = {
    price_amount: input.plan.setupUsd,
    price_currency: "usd",
    order_id: orderId,
    order_description: input.plan.description,
    ipn_callback_url: `${input.baseUrl}/api/webhooks/nowpayments`,
    success_url: `${input.baseUrl}/?order=${orderId}&status=paid#hero`,
    cancel_url: `${input.baseUrl}/?order=${orderId}&status=cancelled#hero`,
    is_fee_paid_by_user: false,
    is_fixed_rate: false
  };

  const response = await fetch(`${apiBase}/v1/invoice`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey
    },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  const text = await response.text();
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    parsed = { raw: text };
  }
  if (!response.ok) {
    throw new Error(`NOWPayments returned HTTP ${response.status}: ${text.slice(0, 500)}`);
  }

  const invoiceUrl = typeof parsed.invoice_url === "string" ? parsed.invoice_url : "";
  const invoiceId =
    typeof parsed.id === "string" || typeof parsed.id === "number" ? String(parsed.id) : orderId;

  if (!invoiceUrl) {
    throw new Error("NOWPayments response did not include invoice_url");
  }

  return {
    id: invoiceId,
    invoice_url: invoiceUrl,
    raw: parsed
  };
}

/* ------------------------------------------------------------------ */
/* HMAC-SHA512 IPN verification — copied from payments-prototypes.    */
/* ------------------------------------------------------------------ */

function timingSafeEqualHex(left: string, right: string): boolean {
  const a = left.trim().toLowerCase();
  const b = right.trim().toLowerCase();
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = sortObject((value as Record<string, unknown>)[key]);
        return result;
      }, {});
  }
  return value;
}

export function verifyNowpaymentsIpn(payload: unknown, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const sorted = JSON.stringify(sortObject(payload));
  const expected = crypto.createHmac("sha512", secret.trim()).update(sorted).digest("hex");
  return timingSafeEqualHex(expected, signature);
}
