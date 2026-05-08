# 09 — Go-to-Market: 90-day plan

## North star

By day 90, ship 30 paid engagements per month at the assumed 60/30/10 mix, with a steady-state customer-acquisition cost of <$200 and retention measured (not yet optimized).

## Phase 1 — Plant (days 0–30)

### Week 1 — Foundation

- [x] Domain live: `gpt-store-custom-gpt.prin7r.com` HTTP/2 200, valid LE cert.
- [x] NOWPayments integration wired; one verified hosted-invoice creation.
- [x] DESIGN.md + 10 docs published.
- [ ] Operator roster of 4 named operators ready (J. Romero, A. Hsu, K. Patel, M. Olsen — placeholder names; confirm with Chief of Operations).
- [ ] Engagement desk inbox `desk@gpt-store-custom-gpt.prin7r.com` provisioned and routed to the on-call operator.

### Week 2 — Two GPTs published

- [ ] *Ops Pricing Architect* — published in OpenAI Store. Stress-tested against 3 real Prin7r engagements before publication.
- [ ] *Agency RFP Decoder* — published. Stress-tested against 3 RFPs.
- [ ] Both GPT descriptions reference the deep link in the close: `gpt-store-custom-gpt.prin7r.com`.
- [ ] Internal review by Chief of Design ensures the Store-side voice matches the landing.

### Week 3 — Three more GPTs

- [ ] *Founder's Pipeline Coach*, *Research-Pad Hand*, *Owner Runbook Drafter* — published.
- [ ] At this point, five GPTs are in the Store, all named on the landing.
- [ ] First operator-led essay published at `/notes/` (URL placeholder until v0.2 ships the notes route).

### Week 4 — First conversions

- [ ] Goal: 3 paid Pay-per-engagement invoices.
- [ ] Each engagement closed within 5 working days.
- [ ] One Subscription onboarding signed by end of week 4.
- [ ] Operator postmortem on every engagement — what the GPT got right, what the operator had to add.

## Phase 2 — Tend (days 31–60)

### Week 5 — Volume signal

- [ ] Goal: 8 paid engagements in week 5.
- [ ] Two of the five GPTs are clearly outperforming; promote them visually on the landing's Catalog grid (move to top row).
- [ ] Drop or rebuild the underperforming GPTs by week 7.

### Week 6 — First Concierge inquiry

- [ ] Direct outbound list (50 organizations) prepared and reviewed by Chief of Sales.
- [ ] First 10 outbound emails sent. Reply rate logged.
- [ ] First Concierge inquiry processed end-to-end (reference call, paid invoice, eight-week plan).

### Week 7 — Community presence stabilizes

- [ ] Operators have been visible in the four target communities for ~6 weeks.
- [ ] Track community-attributed paid engagements; if zero, withdraw from low-performing community.

### Week 8 — Founder content cadence proven

- [ ] Four operator-led essays published.
- [ ] Cross-posted to X. Engagement metrics tracked but not optimized.
- [ ] Cumulative target: 16 paid engagements in month 2.

## Phase 3 — Harvest (days 61–90)

### Week 9 — First subscription renewal cohort

- [ ] Subscription customers from week 4 hit their first 30-day renewal.
- [ ] Target: 80% renewal rate.
- [ ] Cancellation interviews (10 minutes max) with anyone who churns.

### Week 10 — Two GPTs in editorial review for publication

- [ ] Plan for the next two GPT publications (week 12 + 14).
- [ ] Both must pass the same 3-engagement stress-test before publication.

### Week 11 — Pricing tier review

- [ ] Tier mix is checked against the assumed 60/30/10.
- [ ] Any drift >10% in either direction triggers a positioning review with Chief of Operations.

### Week 12 — Steady state in sight

- [ ] Goal: 25–30 paid engagements per month, blended.
- [ ] Operator roster expanded if needed (target: 6 named operators by end of month 3).
- [ ] First Concierge engagement completes its 8-week minimum.

## Launch sequence

The "launch" is not a single event. It is a series of polite signals.

1. **Day 1.** Site goes live. No announcement.
2. **Day 7.** First two GPTs in the OpenAI Store. We mention them in passing in the operators' personal X feeds.
3. **Day 14.** Five GPTs in the Store. First operator-led essay at `/notes/` (or its v0.2 equivalent).
4. **Day 21.** First three paid engagements completed. We do nothing publicly to mark this.
5. **Day 30.** First Subscription customer onboarding live. Founder posts a single quiet receipt to X.
6. **Day 60.** Direct outbound to the 50-org Concierge list completes.
7. **Day 90.** First Concierge engagement completes 8-week minimum. Operator postmortem published as a `/notes/` essay.

We do not run a "launch week." Launches are stunts; we are running a service.

## Risks + mitigations

| Risk                                                   | Mitigation                                                                                  |
| ---                                                    | ---                                                                                         |
| OpenAI changes Store policy / removes our GPTs         | Mirror as private OpenAI Team workspace deployments for paid clients                         |
| First-month conversion is below 3 engagements          | Re-write the deep-link copy in each GPT's close; consider rebuilding the underperformer      |
| Operator burnout at 12 concurrent engagements          | Cap each operator at 8 concurrent; expand roster before hitting 30 paid/month                |
| Crypto checkout deters mainstream buyers               | Card on-ramp on NOWPayments page is sufficient — confirm in week-3 conversion data           |
| Competitor publishes near-identical GPTs               | We publish faster + we publish the engagement, not the GPT alone                             |

## Success at day 90

- 25–30 paid engagements per month, steady state
- 80% Subscription month-over-month retention
- One Concierge engagement completed 8 weeks
- Five GPTs in the Store, two more in editorial review
- Four named operators, all publicly visible
- $0 spent on paid advertising
- Two operator-led essays per month, real audience reading
