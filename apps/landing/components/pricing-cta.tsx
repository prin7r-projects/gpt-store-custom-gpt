"use client";

/**
 * [SERIOUSSEQUEL_PRICING_CTA] Calls POST /api/checkout/nowpayments and redirects
 * the visitor to the hosted invoice URL. Mirrors the chatbot-agency pattern.
 *
 * - Reads referral source from `serioussequel_ref` cookie (set by middleware on ?ref=).
 * - Disabled for ~750ms after click to avoid double-creating invoices.
 * - On 503 missing_env shows a quiet copy fallback (lead-magnet email path).
 * - On 502/4xx shows a plain message; the live invoice id flows back into the
 *   URL on success so the orchestrator can verify gate-11 from the address bar.
 */

import { useCallback, useState } from "react";
import { cn } from "@/lib/cn";

type PlanId = "engagement" | "subscription" | "concierge";

type Props = {
  plan: PlanId;
  label: string;
  tone?: "ink" | "saffron";
  className?: string;
  emailFallback?: string;
};

type ApiOk = {
  mode: "live";
  invoice_url: string;
  invoice_id: string;
  referral_source?: string;
};
type ApiErr = { error: string; message?: string; missing?: string };

/**
 * Reads a cookie value by name. Returns null if not found.
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function PricingCta({
  plan,
  label,
  tone = "ink",
  className,
  emailFallback = "desk@gpt-store-custom-gpt.prin7r.com",
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const referralSource = getCookie("serioussequel_ref");

      const res = await fetch("/api/checkout/nowpayments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          plan,
          ...(referralSource ? { referralSource } : {}),
        }),
      });
      const json = (await res.json()) as ApiOk | ApiErr;
      if (res.ok && "invoice_url" in json && json.invoice_url) {
        window.location.href = json.invoice_url;
        return;
      }
      const err = json as ApiErr;
      if (res.status === 503 && err.missing) {
        setError(
          `Crypto checkout is being wired this week. Email ${emailFallback} and we'll hand the invoice over directly.`
        );
      } else {
        setError(err.message ?? `Checkout failed (HTTP ${res.status}).`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error.");
    } finally {
      setTimeout(() => setBusy(false), 750);
    }
  }, [busy, plan, emailFallback]);

  const base =
    "inline-flex h-12 items-center justify-center px-6 text-[15px] font-medium tracking-tight transition-colors duration-200 ease-page rounded-pill border focus:outline-none";
  const palette =
    tone === "saffron"
      ? "bg-saffron-300 border-saffron-400 text-ink-900 hover:bg-saffron-400"
      : "bg-ink-900 border-ink-900 text-paper-50 hover:bg-ink-800";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <button
        type="button"
        onClick={handle}
        disabled={busy}
        className={cn(base, palette, busy && "opacity-60 cursor-wait")}
        aria-label={`${label} — pay with crypto via NOWPayments`}
      >
        {busy ? "Opening invoice…" : label}
        <svg
          aria-hidden="true"
          className="ml-2 h-3.5 w-3.5"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <path d="M5 3l6 5-6 5" />
        </svg>
      </button>
      <p className="text-xs text-reader leading-snug">
        Crypto checkout via NOWPayments (USDT / USDC). Card on-ramp available.
        We never see your card; we receive a verified invoice id.
      </p>
      {error && (
        <p
          role="alert"
          className="text-xs text-ink-800 leading-snug border-l-2 border-saffron-300 pl-3"
        >
          {error}
        </p>
      )}
    </div>
  );
}
