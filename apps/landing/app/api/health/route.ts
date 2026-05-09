/**
 * [SERIOUSSEQUEL_HEALTH] GET /api/health
 *
 * Operator-facing health check (docs/12 §3.4).
 * Returns the availability of each integration so operators can triage.
 *
 * Response 200: { status: "ok", envCheck: { nowpayments, postmark, telegram } }
 */

import { NextResponse } from "next/server";
import { optionalEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    envCheck: {
      nowpayments: Boolean(optionalEnv("NOWPAYMENTS_API_KEY")),
      postmark: Boolean(optionalEnv("POSTMARK_TOKEN")),
      telegram: Boolean(optionalEnv("TELEGRAM_BOT_TOKEN") && optionalEnv("TELEGRAM_DESK_CHANNEL_ID")),
    },
  });
}
