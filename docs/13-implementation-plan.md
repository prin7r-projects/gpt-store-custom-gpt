# 13 — Implementation Plan

> **Hand-off ready.** This plan is for the Phase 2 implementation agent picking up After-the-Store after Wave 2's marketing landing has shipped. You will find: (a) deployed landing at `https://gpt-store-custom-gpt.prin7r.com` with NOWPayments hosted-invoice checkout for three plans (Pay-per-engagement / Subscription / Concierge); (b) brand identity / audience / architecture in `/docs/01..10-*.md`; (c) the user-story contract in `/docs/11-user-stories-and-scenarios.md`; (d) the technical spec in `/docs/12-technical-specification.md`. **This is a landing-only project**: there is NO `apps/app/` to bring online, NO SaaS surface to build. Your work is on landing copy, conversion UX, the engagement-desk integration, and the published Store GPT funnel. Read docs 11 + 12 before starting.

The "implementation" of After-the-Store is mostly **content-side** (publish more Store GPTs, refine landing copy, grow the operator roster). The code surface stays small by design.

---

## 1. Phase breakdown

5 phases (smaller than other Wave 2 projects because the surface is smaller).

| Phase | Goal | Effort |
|---|---|---|
| **0 — Scaffolding stable** | Production landing 200; CI green; webhook test suite | S — 2-3h |
| **1 — Concierge request flow** | `/api/concierge/request` ships; engagement desk receives | S — 1-2d |
| **2 — Marketing analytics (optional Phase 2)** | SQLite orders table; daily Notion sync | M — 1-2d |
| **3 — Production hardening** | Forged-IPN tests, rate limits, alerts | M — 1-2d |
| **4 — Engagement-desk integration polish** | Operator roster Notion → Telegram pings; Postmark templates | M — 1-2d |
| **5 — Funnel growth (ongoing)** | Publish more Store GPTs; iterate landing copy | XL — ongoing |

---

### Phase 0 — Scaffolding stable

**Goal.** Production landing returns 200; webhook signature test suite passes; CI workflow green.

**Tasks.**
1. Verify Wave 2 state: clone repo, confirm landing returns 200.
2. Read `/docs/12-technical-specification.md` §3 to align on the three endpoints.
3. Add Vitest + Supertest test suite for `verifyNowpaymentsIpn` against golden-case signatures from `payments-prototypes/`.
4. Add a `.github/workflows/landing-build.yml` to CI: `pnpm install && pnpm -F landing build && pnpm -F landing test` on every push.
5. Confirm `Dockerfile.landing` produces a clean standalone image (~110 MB compressed).

**Effort.** S — 20-30 tool-uses, 2-3h.

**DoD.**
- [ ] `pnpm -F landing test` runs `verifyNowpaymentsIpn` golden cases (positive + 3 forged).
- [ ] CI green on a clean push.
- [ ] Production `https://gpt-store-custom-gpt.prin7r.com` returns 200 with valid LE cert.

**Hand-off context.** Don't add an `apps/app/` directory. Don't add a database. Don't add auth. Phase 2 may add SQLite for analytics — but only if marketing actually needs the granular data.

---

### Phase 1 — Concierge request flow

**Goal.** The Concierge tier reference-call request can be submitted via a form on the landing; the engagement desk receives both Telegram + Postmark notifications.

**Tasks.**
1. Add `app/api/concierge/request/route.ts` per doc 12 §3.3.
2. Build a `ConciergeForm` component on the landing — collapsed by default below the Concierge pricing card.
3. Emit Telegram channel ping `[CONCIERGE_REQUEST]` via `lib/telegram.ts` (new file using `@telegraf/messages`).
4. Emit Postmark email to `desk@gpt-store-custom-gpt.prin7r.com` with template `concierge-request`.
5. Rate-limit at Traefik: 5 req/min/IP for `/api/concierge/*`.
6. Honeypot field (hidden CSS-only) to deflect bots; reject submissions with non-empty honeypot.

**Effort.** S — 50-80 tool-uses, 1-2 days.

**DoD.**
- [ ] Submit form on production landing → Telegram ping arrives in `@aftermthestore_desk` channel within 5s.
- [ ] Submit form → Postmark email arrives at desk distribution list within 30s.
- [ ] Submit 6 times in 60s from one IP → 6th request returns 429.
- [ ] Honeypot-filled submission returns 200 but logs `[BOT_REJECTED]` and does NOT page the desk.

**Hand-off context.**
- Telegram bot token in `TELEGRAM_BOT_TOKEN`; channel id in `TELEGRAM_DESK_CHANNEL_ID`.
- Postmark server token in `POSTMARK_TOKEN`; template id in `POSTMARK_CONCIERGE_TEMPLATE_ID`.
- Don't try to parse the Concierge form into structured CRM data — it stays as freeform notes for the operator.

---

### Phase 2 — Marketing analytics (optional)

**Goal.** Marketing can compute conversion-by-published-GPT without grepping journalctl.

**Tasks.**
1. Add a SQLite file at `/opt/prin7r-deploys/gpt-store-custom-gpt/data/orders.sqlite` with the schema from doc 12 §2.
2. On verified IPN, write an `orders` row with `(order_id, plan, amount_usd, invoice_id, payer_email, referral_source, paid_at, status)`.
3. Add a daily cron (`workers/notion-sync.ts`) that reads the previous day's orders and appends them to a Notion data source `After-the-Store Orders` (data source id in `NOTION_ORDERS_DSID`).
4. Add `referralSource` extraction at landing-page entry: read `?ref=` query, set 30-day cookie, append to checkout body.
5. Add a marketing dashboard view in Notion: pivot table of conversions-by-GPT.

**Effort.** M — 80-120 tool-uses, 1-2 days.

**DoD.**
- [ ] SQLite file initialized + indexed on first deploy.
- [ ] Verified IPN writes `orders` row.
- [ ] Daily cron runs; previous-day orders appear in Notion data source.
- [ ] Pivot view in Notion shows 7-day conversions-by-published-GPT.

**Hand-off context.**
- This phase is **optional** — only build it if marketing actually wants the data. Right now, the team can compute monthly conversions manually from journalctl + Postmark in <30 min.
- Don't add user-facing analytics to the landing.

---

### Phase 3 — Production hardening

**Goal.** Forged IPN handling proven in tests. Rate limits at Traefik. Alerts wired.

**Tasks.**
1. Forged-IPN test cases in `apps/landing/__tests__/webhooks.test.ts`: bad sig, replayed sig, sorted-keys mismatch, missing header.
2. Traefik rate limits: `/api/checkout/*` 30 req/min/IP, `/api/webhooks/*` 600 req/min total, `/api/concierge/*` 5 req/min/IP.
3. Slack alerts: webhook sig failures >2/h, checkout 5xx >5/h, concierge form 4xx >10/h.
4. PII scrub regex test: simulated IPN payload with `pay_address`, `payout_hash` does NOT appear plaintext in stdout.
5. Admin-key not applicable (no admin endpoints exist).
6. CSP headers: `default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://api.nowpayments.io;`.

**Effort.** M — 60-100 tool-uses, 1-2 days.

**DoD.**
- [ ] Forged IPN test cases all pass.
- [ ] Traefik rate-limit test: 31st checkout req from same IP returns 429.
- [ ] Slack `#alerts-aftermthestore` receives test message from each path.
- [ ] PII scrub test: log-grep for `pay_address|payout_hash` after a simulated IPN returns empty.
- [ ] CSP header on every landing response (verify via `curl -sI`).

**Hand-off context.**
- Webhook test golden signatures live in `payments-prototypes/__tests__/signatures.golden.json`.
- Traefik rate-limit middleware lives on storage-contabo, not in app code.

---

### Phase 4 — Engagement-desk integration polish

**Goal.** Operator roster automation: assigning the right operator to each new engagement based on the Notion roster.

**Tasks.**
1. Notion data source `Operator Roster` with rows: `(operatorId, name, email, capacity, currentLoad, lastAssignedAt)`.
2. On verified IPN, read the roster, pick the operator with `(currentLoad < capacity)` and oldest `lastAssignedAt`.
3. Telegram channel ping enriched with the assigned operator's name + email.
4. Increment `currentLoad` on the operator's roster row via Notion API.
5. Postmark template `engagement-kickoff` populated with operator name, customer payer_email, plan, intake-form Notion URL.
6. Roster reset: weekly cron decrements `currentLoad` for completed engagements (manual flag in Notion).

**Effort.** M — 80-120 tool-uses, 1-2 days.

**DoD.**
- [ ] Verified IPN → Telegram ping includes the assigned operator (e.g., "Daria, current load 2/3").
- [ ] Operator's `currentLoad` incremented in Notion within 30s.
- [ ] Postmark `engagement-kickoff` email sent to operator with all context.
- [ ] Weekly roster reset cron runs without error.

**Hand-off context.**
- `PRIN7R_NOTION_TOKEN` in `/Users/keer/.nth-kir-keys.env`.
- Notion API version `2025-09-03`.
- The roster Notion data source id should be stored in `NOTION_ROSTER_DSID`.
- Don't try to automate the operator's first email — let humans write that. The system only routes; it doesn't speak for the operators.

---

### Phase 5 — Funnel growth (ongoing)

**Goal.** Publish more Store GPTs; refine landing copy; the funnel grows.

**Tasks.** (Ongoing, not a one-time phase.)
1. Publish 2-3 new Store GPTs per quarter, each targeting a specific buyer's painful Saturday-night question.
2. Each GPT closes with a brand-consistent deep link `?ref=gpt-{slug}`.
3. Landing copy A/B tests: hero, transcript card, FAQ headlines. Use Phase-2 marketing analytics if Phase 2 is built.
4. Operator-roster expansion: add 1-2 named operators per quarter as engagement volume grows.
5. Quarterly review: which GPTs convert best, which copy variations win, which operators have highest retention.

**Effort.** XL — ongoing, content-side.

**DoD.** (No fixed DoD — this is operational.)
- Quarterly review document published in Notion.
- Net new published GPTs in the Store quarter-over-quarter.

**Hand-off context.**
- DON'T build a "GPT publishing automation." Each GPT is hand-published by a senior operator. The published-GPT count is a quality signal, not a vanity metric.
- DON'T add a customer dashboard / login. The discipline of staying landing-only is part of the brand promise.

---

## 2. Cross-cutting concerns

| Concern | First addressed | Notes |
|---|---|---|
| Accessibility | Wave 2 (already shipped) | Lighthouse a11y >= 95; focus-visible on all interactive |
| i18n | NOT in scope. English-only |
| Mobile | Wave 2 | Responsive landing throughout |
| Telemetry | Phase 3 | Stdout JSON; alerts Slack |
| GDPR / DSAR | Phase 3 | Email PII only; runbook in `/docs/runbooks/gdpr-dsar.md` |
| SOC 2 / HIPAA | Out of scope (anti-persona) |

---

## 3. Risk register

| # | Risk | Owner | Mitigation |
|---|---|---|---|
| R1 | NOWPayments outage during a discovery weekend | Phase 3 | 502 fallback message; engagement desk hand-issues invoice via email |
| R2 | Forged IPN bypassing HMAC | Phase 3 | Constant-time compare; rejection logging; alerts >2/h |
| R3 | Concierge form abuse (bot spam) | Phase 1 | Rate limit + honeypot; Cloudflare Turnstile if needed |
| R4 | Operator roster overwhelmed during a viral GPT moment | Phase 4 | Capacity field per operator; auto-pause new engagements at fleet capacity |
| R5 | Brand-impersonation domain | Phase 3 | Trademark monitoring; phishing-report runbook |
| R6 | Published Store GPT delisted by OpenAI | Phase 5 | Diversify across 5+ GPTs; one delist doesn't break the funnel |

---

## 4. References

- Doc 11 — `/docs/11-user-stories-and-scenarios.md` — drives all 10 stories + scenarios.
- Doc 12 — `/docs/12-technical-specification.md` — three endpoints + integrations + non-goals.
- DESIGN.md — `/DESIGN.md` — editorial-essay visual contract.
- Wave 2 status — production landing live; check `wave2-status-report.md` if available.
- Payments prototypes — `/Users/keer/projects/prin7r/payments-prototypes/` — `verifyNowpaymentsIpn` reference.
