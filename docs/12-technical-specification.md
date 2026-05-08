# 12 — Technical Specification

This is the authoritative technical contract for After-the-Store. The product is **landing-only** — the technical surface is small (one Next.js app, two API routes, NOWPayments integration). Most "implementation" work for After-the-Store happens on the engagement-desk side (humans + Notion + email) which is out of scope for this doc but referenced where it touches the runtime.

Every endpoint here traces back to a story in doc 11.

---

## 1. Architecture overview

```mermaid
flowchart LR
  subgraph Discovery
    GS[OpenAI GPT Store<br/>5+ published GPTs]
  end

  subgraph Edge[storage-contabo / Traefik]
    TR[Traefik<br/>Lets Encrypt<br/>gpt-store-custom-gpt.prin7r.com]
  end

  subgraph LandingSvc[Container: gpt-store-custom-gpt-landing]
    NX[Next.js 15 standalone :3000]
    API_CH[POST /api/checkout/nowpayments]
    API_WH[POST /api/webhooks/nowpayments]
    API_CO[POST /api/concierge/request]
  end

  subgraph External
    NP[NOWPayments<br/>POST /v1/invoice<br/>IPN HMAC-SHA512]
    PM[Postmark<br/>desk@... mail]
    TG[Telegram channel<br/>@aftermthestore_desk]
  end

  subgraph Humans
    EG[Engagement desk<br/>operators roster<br/>Notion intake forms]
  end

  Visitor((Visitor)) --> GS
  GS -.deep link.-> NX
  NX --> API_CH --> NP
  NP --IPN--> API_WH
  API_WH --> TG
  API_WH --> PM
  API_CO --> PM
  API_CO --> TG
  TG --> EG
  PM --> EG
```

**Wave 2 = Wave 3 = Wave 4 for After-the-Store.** No SaaS app is planned. The product evolves by: (a) publishing more Store GPTs, (b) refining the landing copy, (c) growing the operator roster — not by building software.

---

## 2. Data model

After-the-Store has **no application database**. The "data model" is:

| Surface | Where data lives | Retention |
|---|---|---|
| Visitor → invoice | NOWPayments hosted (we never store) | NOWPayments-managed |
| IPN events | journalctl on storage-contabo | 30 days |
| Engagement state | Notion (operator roster + intake forms) | indefinite |
| Operator emails | Postmark logs | 90 days |
| Telegram desk pings | Telegram channel @aftermthestore_desk | indefinite |

Optional Phase-2 lightweight DB: a sqlite at `/opt/prin7r-deploys/gpt-store-custom-gpt/data/orders.sqlite` storing `(orderId, plan, paidAt, payerEmail, referralSource)` for marketing analytics. Schema:

```typescript
// data/orders.sqlite (Phase 2 optional)
CREATE TABLE orders (
  order_id TEXT PRIMARY KEY,
  plan TEXT NOT NULL,             -- 'engagement'|'subscription'|'concierge'
  amount_usd NUMERIC NOT NULL,
  invoice_id TEXT,
  payer_email TEXT,
  referral_source TEXT,           -- which Store GPT referred
  paid_at INTEGER,                -- unix timestamp
  status TEXT DEFAULT 'paid'      -- 'paid'|'refunded'|'replayed'
);
CREATE INDEX idx_orders_referral ON orders(referral_source);
CREATE INDEX idx_orders_plan ON orders(plan);
```

**This is the only table.** No customers, no contracts, no licenses. Phase 2 only — Wave 2 launch is journalctl-only.

---

## 3. API contracts

All endpoints return JSON. Errors use `{ error: { code, message, details? } }`.

### 3.1 `POST /api/checkout/nowpayments`

- Auth: none.
- Body: `{ plan: 'engagement'|'subscription'|'concierge', referralSource? }`.
- Server flow: validate plan; compute `order_id = ats_<plan>_<ts>_<rand>`; build NOWPayments payload `{ price_amount, price_currency: 'usd', order_id, order_description (from PLANS map), ipn_callback_url, success_url, cancel_url }`; POST to `https://api.nowpayments.io/v1/invoice` with `x-api-key`; return `{ mode: 'live', plan, setup_usd, invoice_id, invoice_url }`.
- Response 200: `{ mode, plan, setup_usd, invoice_id, invoice_url }`.
- Response 503: `{ error: { code: 'missing_env', missing: ['NOWPAYMENTS_API_KEY'], message: 'Checkout is being wired right now — email desk@... and we will hand-issue your invoice.' } }`.
- Response 502: `{ error: { code: 'nowpayments_unavailable', message: 'Something is off with payments — try again or email the desk.' } }`.
- Response 400: `{ error: { code: 'unknown_plan' } }`.

### 3.2 `POST /api/webhooks/nowpayments`

- Auth: HMAC-SHA512 in `x-nowpayments-sig` over alphabetically-sorted JSON body, signed with `NOWPAYMENTS_IPN_SECRET`. Constant-time compare via `crypto.timingSafeEqual`.
- Body: NOWPayments IPN payload.
- Server flow: verify sig → log verified event with `[TRANSCRIPT_NOWPAYMENTS_IPN]` tag → emit Telegram channel ping with `(order_id, plan, status, payer_email)` → emit Postmark email to engagement-desk distribution list → (Phase 2) write `orders` row.
- Response 200 `{ ok, order_id, status }` on verified payload. 401 on bad sig. 200 on idempotent replay.

### 3.3 `POST /api/concierge/request`

- Auth: none.
- Body: `{ name, role, company, urgency, message? }`.
- Server flow: validate body; emit Telegram channel ping `[CONCIERGE_REQUEST]` + Postmark email to engagement-desk; respond with success.
- Response 200: `{ ok: true, eta: 'within 4 business hours' }`.
- Response 400: `{ error: { code: 'invalid_body' } }`.
- Rate limit: 5 req/min/IP at Traefik (concierge form abuse prevention).

### 3.4 `GET /api/health` (operator-facing)

- Auth: none.
- Response 200: `{ status: 'ok', envCheck: { nowpayments: bool, postmark: bool, telegram: bool } }`.

That's it. Three endpoints + one health check. Anything beyond this is anti-scope per doc 11 AS-2.

---

## 4. Integrations

| Service | Purpose | Auth | Rate limit | Fallback |
|---|---|---|---|---|
| **NOWPayments** | Hosted invoice + IPN | `x-api-key` + HMAC-SHA512 | 60 req/min | 502 retry; brand-voice toast |
| **Postmark** | Engagement-desk email + transactional | Server token | 5k/h Pro | Buffer to Telegram only on Postmark outage |
| **Telegram Bot API** | Desk channel pings | Bot token | 30 msg/sec | Buffer to Postmark only on TG outage |
| **OpenAI GPT Store** | Discovery layer | none (public Store) | n/a | n/a |

OpenAI has NO API integration here. The published GPTs are author-managed in the Store; updates are manual.

---

## 5. Storage

- **Wave 2 launch.** No application DB. journalctl + Notion + Postmark + Telegram constitute the system of record.
- **Phase 2 optional.** SQLite for `orders` table (marketing analytics only).
- **Retention.**
  - journalctl: 30 days (storage-contabo default).
  - SQLite orders: indefinite (no PII beyond payer_email).
  - Notion: indefinite (operator-managed).
  - Postmark: 90 days.
  - Telegram: indefinite.

---

## 6. Auth

After-the-Store has **no end-user authentication**. The landing is public. The only auth is HMAC-SHA512 on the IPN webhook. There are no admin endpoints, no dashboards, no API keys.

If a future need emerges (e.g. operator-facing analytics dashboard), it would be a separate Notion/Retool app, not a SaaS surface on this domain.

---

## 7. Security

Top 5 threats + mitigations:

1. **Forged IPN.** *Mitigation:* HMAC-SHA512 with constant-time compare. `verifyNowpaymentsIpn` is a pure function tested against the payments-prototypes signature golden cases.
2. **Concierge form abuse (spam / scraping).** *Mitigation:* 5 req/min/IP at Traefik. Form fields validated (length cap on `message`). Optional Cloudflare Turnstile if abuse becomes real (Phase 2).
3. **Fake operator emails (impersonation).** *Mitigation:* Engagement-desk emails always sent from `desk@gpt-store-custom-gpt.prin7r.com` with SPF + DKIM + DMARC strict. Operators never email from personal addresses.
4. **Information leak via journalctl.** *Mitigation:* IPN log lines NEVER include `pay_address`, `payout_hash`, or full payload — only `(order_id, status, payer_email)`. Tested via log-grep.
5. **Brand-impersonation domain attack.** *Mitigation:* Trademark monitoring on `aftermthestore.*` and `after-the-store.*`. Cloudflare phishing report ready for known bad neighbors.

CSRF: Next.js default + samesite=lax on any future cookie. CORS: `Access-Control-Allow-Origin` set to `https://gpt-store-custom-gpt.prin7r.com` only.

---

## 8. Observability

- **Logs.** journalctl + stdout JSON `{ ts, level, route, orderId?, event, message }`. PII scrubbed at line-format.
- **Metrics.** None in Wave 2. Phase 2 may add a daily journalctl→csv→Notion sync for marketing analytics.
- **Alerts.**
  - Webhook sig failures >2/h → Telegram desk channel + Slack `#alerts-prin7r`.
  - `/api/checkout/nowpayments` 5xx >5/h → Slack.
  - Concierge form 4xx >10/h → Slack (likely abuse).

---

## 9. Performance budgets

| Surface | Metric | Budget |
|---|---|---|
| Landing TTFB | p95 | <200ms |
| Landing LCP | p75 | <2.5s |
| `POST /api/checkout/nowpayments` | p95 | <1.5s end-to-end (includes NOWPayments roundtrip) |
| `POST /api/webhooks/nowpayments` | p95 | <250ms |
| `POST /api/concierge/request` | p95 | <500ms |
| Throughput sustained | landing 50 RPS, checkout 10 RPS, webhook 100 RPS, concierge 5 RPS |
| Capacity concurrent | 200 concurrent active visitors before adding container |

---

## 10. Non-goals

- **No customer dashboard / login / persistence** (doc 11 AS-2). After-the-Store is landing-only.
- **No discovery call widget** (AS-1). No calendar embed.
- **No public case studies / testimonials** (AS-3). Discipline-as-marketing.
- **No "AI-powered" / "10x" / "supercharge" copy** (AS-4). Brand voice forbids.
- **No SOC 2 / HIPAA flows** (AS-5).
- **No fine-tuned models per customer** (AS-6).
- **No payments rail beyond NOWPayments + concierge-issued invoice.** Plisio/Reown are NOT exposed.
- **No mobile-native or PWA experience.** Responsive web only.
- **No outbound marketing automation.** Acquisition is via the Store GPTs only.
