# 11 — User Stories and Scenarios

This document is the canonical input contract for SeriousSequel's Phase 2 enhancements. Unlike most Wave 2 projects, SeriousSequel is **landing-only** — there is no SaaS app, no dashboard, no recurring runtime beyond the engagement-desk service. This makes the user-story surface narrower but more important: every conversion path on the landing must trace back to a story below.

SeriousSequel converts OpenAI GPT Store visitors who experienced a "useful but generic" answer from one of our published GPTs into paid engagements (Pay-per-engagement, Subscription, or Concierge tier) — delivered by named operators on a Tuesday/Thursday checkpoint cadence.

---

## 1. Personas summary

### P1 — Maya, founder of a 12-person research consultancy (primary; deep dive in `05-audience-profile.md` §Persona 1)

34, founder + lead consultant in Lisbon. Active ChatGPT Plus subscriber. Refuses discovery calls. $20k/mo buying power, sub-procurement-gate. Voice cue: "set in serif, signed by a name." Buying signal: clicks **Pay-per-engagement**, not Subscription. Trigger: pasted a pricing question into our published GPT, got a useful generic answer.

### P2 — Daniel, ops director at a 200-person B2B SaaS (secondary; deep dive in `05-audience-profile.md` §Persona 2)

41, in Austin. Burned $80k on three previous "AI consultant" engagements. Voice cue: "is this a tool or a service?" Buying signal: clicks **Subscription** with the Tuesday/Thursday cadence. Anti-signal: marketing language like "supercharge."

### P3 — Lin, brand-side ops generalist at a 40-person agency (champion; deep dive in `05-audience-profile.md` §Persona 3)

29, in Toronto. Not the buyer — the internal champion. Brings the GPT screenshot to her CEO. The CEO clicks **Concierge** after the reference call. Lin matters because she initiates the funnel; her CEO completes it.

### Anti-personas (out of scope — see doc 05 §Anti-personas)

The bargain hunter (wants the GPT free, never the engagement), the category-curious AI tourist, the procurement gate at >800 headcount org with full RFP cycle. No flow on the landing serves these segments.

---

## 2. Primary user stories

10 stories covering the GPT Store → landing → checkout funnel + the Engagement-desk handoff. Each maps to ≥1 scenario in §3.

1. **As Maya, I want to see a transcript card on the hero showing a real exchange between a customer and a named operator, so that I know within 30 seconds that this is a real service, not a chatbot reseller.** *(US-01)*
2. **As Maya, I want to click Pay-per-engagement at $480/$1,800/$5,800 USD and immediately get a NOWPayments hosted invoice (no booking widget, no discovery call), so that I can pay on the same Saturday night I read the page.** *(US-02)*
3. **As Daniel, I want to see a Subscription tier with explicit Tuesday/Thursday checkpoint cadence and named operators, so that I know this is recurring infrastructure not a one-off engagement.** *(US-03)*
4. **As Daniel, I want a USD-denominated invoice that my AP system understands, so that the spend fits the standard sub-$5k vendor flow.** *(US-04)*
5. **As Maya, I want artifacts that survive the chat (Notion pages, files, runbooks) delivered by Tuesday after my Saturday purchase, so that I can defend the spend with a tangible deliverable.** *(US-05)*
6. **As Daniel, I want to click Concierge and request a reference call before paying $5,800, so that I can validate against my burned-budget concerns.** *(US-06)*
7. **As Lin, I want a screenshotable "after" output from the published GPT that includes the deep link, so that I can share with my CEO as a proof artifact.** *(US-07)*
8. **As any visitor, I want a refund clause for Pay-per-engagement if the first artifact is rejected, so that the $480 floor is not a lock-in.** *(US-08)*
9. **As any visitor, I want to know which named operator will be my contact on each engagement, so that I'm not dealing with a black-box "team."** *(US-09)*
10. **As any visitor, I want crypto-only checkout (USDT, USDC, or BTC), so that procurement isn't a blocker for a sub-$5k purchase.** *(US-10)*

---

## 3. Main scenarios (happy paths)

### Scenario 1 — Maya pays for Pay-per-engagement on Saturday night

**Trigger.** Maya pastes a pricing question into our published Store GPT at 22:00 Saturday. The GPT answers competently, then suggests the deep link to SeriousSequel with one closing line: "Want a named operator to finish what this GPT politely ended?"

**Steps.**
1. Maya clicks the deep link. Lands on `https://gpt-store-custom-gpt.prin7r.com`. *Frontend: `Hero`, `TranscriptCard`, `PricingTriad` on `apps/landing/app/page.tsx`.*
2. Reads the hero ("Set in serif, signed in ink, paid in stablecoin"). The transcript card shows a real exchange between "Anna G." and "Daria, operator" with the date.
3. Scrolls to "what our GPTs do today" and "why click through."
4. At pricing: she's on the Pay-per-engagement tier ($480 setup). Clicks **Pay-per-engagement →**.
5. Browser POSTs to `/api/checkout/nowpayments` with `{ plan: 'engagement' }`. *Backend: `POST /api/checkout/nowpayments` (doc 12 §3.1) builds NOWPayments hosted invoice; returns `{ invoice_url, invoice_id, plan: 'engagement', mode: 'live' }`.*
6. Browser navigates to invoice_url. Maya pays $480 in USDT-Polygon.
7. NOWPayments POSTs IPN to `/api/webhooks/nowpayments`. Server verifies HMAC-SHA512. Logs verified event with `order_id`. *Backend: `POST /api/webhooks/nowpayments` → journalctl alert → engagement desk Telegram ping.*
8. Engagement desk receives Telegram alert with order_id + plan + payer email (from NOWPayments).
9. Named operator (Daria, this week's roster) emails Maya within 1 business day from `desk@gpt-store-custom-gpt.prin7r.com` with: a) introductory note + her LinkedIn, b) Tuesday checkpoint slot, c) initial intake form (Notion link).
10. Tuesday: 30-min checkpoint call. Daria delivers first artifact (pricing model spreadsheet) by Friday.

**Success criteria.** From GPT-Store-deep-link-click to Daria's first email in <24h. First artifact delivered by Friday following Saturday purchase.

**Frontend touch-points.** `Hero`, `TranscriptCard`, `WhatOurGPTsDoToday`, `WhyClickThrough`, `PricingTriad`, `PricingCta`.
**Backend touch-points.** `POST /api/checkout/nowpayments`, `POST /api/webhooks/nowpayments`, `verifyNowpaymentsIpn`, journalctl alert, engagement-desk Telegram channel.
**Out of scope (humans).** Operator roster rotation, intake form template, artifact delivery — all human-managed; not in code.

### Scenario 2 — Daniel pays for Subscription, week-2 checkpoint runs

**Trigger.** Daniel reads the FAQ "Is this a tool or a service?" — answer is honest about both. He decides Subscription is the right shape.

**Steps.**
1. Clicks Subscription ($1,800 setup + $1,200/mo). Browser POSTs `{ plan: 'subscription' }`.
2. NOWPayments invoice for $1,800 setup. Daniel pays USDT.
3. IPN fires. Engagement desk pinged. Operator (rotating: assigned via roster) emails within 1 business day.
4. Tuesday/Thursday cadence starts. Each checkpoint produces a Notion page + a Slack-formatted summary.
5. End of month 1: Daniel receives a fresh NOWPayments invoice for the next $1,200 monthly. Pays again. Cadence continues.

**Success criteria.** Sub-$5k AP-friendly invoicing. Cadence reliable to <24h skew per checkpoint. Month-2 invoice arrives 5 days before due.

### Scenario 3 — Lin shares output, CEO clicks Concierge after reference call

**Trigger.** Lin runs our published GPT, gets a usable runbook, screenshots it, shares with CEO via Slack DM.

**Steps.**
1. CEO opens the deep link. Skims hero. Lin had already prepped him on the deliverable shape.
2. CEO clicks **Concierge — request reference call**. Form: `{ name, role, company, urgency }` posts to `/api/concierge/request`. *Backend: `POST /api/concierge/request` records to journalctl + emails desk.*
3. Engagement desk follows up within 4 business hours to schedule a 20-min reference call with a current Concierge customer.
4. Reference call clarifies the engagement shape. CEO asks the Concierge tier setup ($5,800).
5. CEO returns to landing, clicks **Concierge → Pay $5,800 setup**. NOWPayments invoice. Pays.
6. Engagement desk pinged. Senior operator (named, not roster) emails within 1 business hour to begin scoping.

**Success criteria.** Reference call booked in <4h. Concierge setup completed in <72h from initial request.

### Scenario 4 — Refund for rejected first artifact (Pay-per-engagement)

**Trigger.** Maya received the first artifact, finds it doesn't fit her use case.

**Steps.**
1. Maya replies to Daria's email rejecting the artifact within the 14-day refund window.
2. Daria escalates to engagement-desk lead.
3. Lead reviews: confirmed not-fit, refund qualifies. Refund processed via NOWPayments admin path.
4. Maya gets the $480 back in USDT-Polygon within 72h.

**Success criteria.** Refund processed in <72h. No web form for refund — all human-loop via email.

### Scenario 5 — GPT Store deep link click-through tracking

**Trigger.** A new published GPT goes live in the Store. Marketing wants to know which GPTs convert best.

**Steps.**
1. Each published GPT's deep link is unique: `https://gpt-store-custom-gpt.prin7r.com/?ref=gpt-{slug}`.
2. Landing page reads the `ref` query param, sets a cookie, and forwards to the checkout body as `referralSource: 'gpt-pricing-coach'`.
3. Webhook receipt logs `referralSource` for each verified payment.
4. Marketing reads journalctl logs weekly to compute conversion-by-GPT.

**Success criteria.** Every paid order traceable back to the published GPT that referred it.

### Scenario 6 — Operator rotation (engagement-desk side)

**Trigger.** Tuesday morning: 4 new engagements arrive over the weekend.

**Steps.**
1. Engagement-desk lead checks roster (a Notion page).
2. Assigns each engagement to a named operator: `Maya → Daria, Daniel → Tomas, Lin's CEO → Senior (Reuben)`, etc.
3. Each operator gets a Slack DM with the engagement details + payer email.
4. Operator emails customer within 1 business day.

**Success criteria.** No engagement waits >24h for first contact. Roster balance enforced (no operator has >3 active engagements).

---

## 4. Edge case scenarios

### EC-1 — IPN replay

Webhook handler is idempotent at the journalctl + Telegram-ping level. Duplicate IPN logged with `replayed: true`; engagement desk de-dupes manually if needed (rare; <1% historical).

### EC-2 — Customer drops off after `/api/checkout/nowpayments` but before payment

NOWPayments invoice expires on its own (30 day default). No DB to expire. If the customer returns, they re-click the CTA and a fresh invoice is created (the prior one is harmless).

### EC-3 — `NOWPAYMENTS_API_KEY` missing on a fresh deploy

`/api/checkout/nowpayments` returns HTTP 503 with `{ error: 'missing_env', missing: ['NOWPAYMENTS_API_KEY'], message }`. The PricingCta component renders the message inline. Visitor sees: "Checkout is being wired right now — email desk@... and we'll hand-issue your invoice."

### EC-4 — NOWPayments returns non-2xx

Endpoint returns 502. CTA renders: "Something's off with payments — try again or email the desk." Engagement desk gets a Slack alert.

### EC-5 — Customer asks for a per-call discovery before paying

Engagement desk politely declines per the brand. Refers them to the public FAQ ("we run on engagement, not discovery"). Concierge tier is the only path with a pre-pay reference call.

### EC-6 — Customer asks for SOC 2 / MSA before paying

Anti-persona. Engagement desk politely declines, refers to alternative providers. No MSA flow on the landing.

### EC-7 — Customer asks for fiat ACH / wire

Wave 2 doesn't support fiat directly. Concierge tier may be paid via direct USDT invoice (no NOWPayments middle), with engagement desk hand-issuing a NOWPayments fiat-on-ramp link as a fallback. Sub-$5k is crypto-only.

---

## 5. Anti-scenarios

### AS-1 — No discovery call before payment

The landing has no "Book a 15-min call" widget. Discovery is replaced by the Store GPT (which does the discovery for free). Implementation must NOT add a calendar widget.

### AS-2 — No customer dashboard / login / persistence

SeriousSequel is landing-only. There is no `/dashboard`, `/login`, or DB. Engagements are tracked via email + Notion (human side). Implementation must NOT add an `apps/app/` SaaS surface.

### AS-3 — No public case studies

CEO read the absence as discipline (per persona Lin's note). No "Customers" page, no testimonials. Implementation must NOT add a logo wall.

### AS-4 — No "AI-powered" / "supercharge" / "10x" copy

Brand voice forbids these explicitly (doc 01 §Voice). Implementation must NOT slip these into copy under any circumstance.

### AS-5 — No SOC 2 / HIPAA flows

Anti-persona. No compliance pages, no BAA flow.

### AS-6 — No fine-tuned models per customer

Published GPTs are the funnel. Each customer engagement is a service, not a custom model.

---

## 6. Cross-references

- §2 stories US-01..US-10 → doc 12 §3 endpoints (checkout, webhook, concierge request).
- §3 scenarios → doc 12 §1 (architecture) + §4 (engagement-desk integration).
- §4 edge cases → doc 12 §7 (security) + the engagement-desk runbook.
- §5 anti-scenarios → doc 12 §10 non-goals.
