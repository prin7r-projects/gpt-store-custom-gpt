# 03 — User Journeys

Three minimum-viable journeys, named for the visitor's mental state at each step. Every journey ends in a real artifact, not a registered account.

## Journey 1 — The 11pm founder (Discovery → first value)

**Persona.** Maya, 34, founder of a 12-person consultancy. ChatGPT Plus subscriber. Has used the GPT Store for cooking plans and pricing diagnostics.

| # | Surface | What Maya does | What we do |
| --- | --- | --- | --- |
| 1 | OpenAI GPT Store | Searches "B2B service pricing." Finds *Ops Pricing Architect* (ours). | The GPT was published two weeks earlier with an internal stress-test against three real engagements. |
| 2 | ChatGPT custom GPT chat | Drops a paragraph: "I do onboarding for HR-tech buyers. Currently $4k flat. Three of the last six churned by week 4." | The GPT diagnoses anchor-pricing risk, suggests a two-tier model, recommends measuring hours-to-first-value. Suggests our deep link as the next step if she wants the engagement behind it. |
| 3 | Browser navigates to landing | Reads the hero. Skims the transcript card. Stops on "Memory across weeks." | Visual hierarchy designed for a 30-second skim. The transcript card's right-hand cursor signals "this is alive." |
| 4 | Pricing | Reads the three tiers. Decides "Pay-per-engagement" feels low-stakes. | The first tier exists precisely for this hesitation moment. $480 ≈ one client's onboarding fee. |
| 5 | NOWPayments hosted invoice | Pays $480 in USDT. | Webhook fires within 3 minutes of confirmation. Journalctl logs the verified event. |
| 6 | Email | Receives a one-paragraph email from the named operator within 24 hours scheduling a 30-min kickoff. | The operator opens with the diagnosis the GPT already produced; Maya doesn't repeat the story. |
| 7 | First-week artifact | Receives a Notion-page rate card matrix and a runbook for the BambooHR stall. | She owns the files, in her own Notion. We close the engagement with a 7-day fix window. |

**First value moment.** The Notion-page rate card lands in her workspace by Friday. That artifact would have cost ~$3k from a competing agency, billed before delivery.

---

## Journey 2 — The skeptical ops director (Validation → recurring use)

**Persona.** Daniel, 41, ops director at a 200-person B2B SaaS. Reports to the COO. Has burned $80k on three previous "AI consultants" and is nominally hostile to the category.

| # | Surface | What Daniel does | What we do |
| --- | --- | --- | --- |
| 1 | LinkedIn DM | Forwarded by a peer: "this GPT decoded my last RFP in 4 minutes." | Distribution earned via a Store-listed GPT (*Agency RFP Decoder*) with a real, named user. |
| 2 | OpenAI GPT Store | Loads the RFP Decoder. Pastes a 32-page RFP. | The GPT produces a scope-shift report with three flagged paragraphs, exits politely, suggests our deep link. |
| 3 | Landing | Spends 90 seconds. Re-reads the FAQ ("Is this a tool or a service?"). | The FAQ is built for him. The "Both" answer is the page's longest paragraph deliberately. |
| 4 | Pricing | Skips Pay-per-engagement. Fixes on Subscription. | The featured saffron border on Subscription is calibrated for his decision pattern. |
| 5 | NOWPayments hosted invoice | Pays $690 onboarding + sets up first month $1,480 = $2,170 in USDC. | Receives invoice id; engagement desk fires the operator-pairing protocol within one hour. |
| 6 | Onboarding session (week 1) | Joins a 45-min Zoom with two named operators. Walks them through three open RFPs. | Operators leave the call with a structured Notion folder; first artifact lands Tuesday. |
| 7 | Tuesday checkpoint | Reviews the first scope-shift report against his own RFP. Confirms accuracy. | We promote the workflow to a recurring weekly pattern: Tuesday review, Thursday delivery. |
| 8 | Month 2 retention | Renews. Adds a colleague to the channel. | Subscription auto-bills against the same NOWPayments invoice. Cell adds a third operator. |

**Continuity moment.** The Tuesday/Thursday cadence becomes a calendar fixture in his org. We are now infrastructure, not a vendor.

---

## Journey 3 — The internal champion (Promotion → multi-stakeholder buy-in)

**Persona.** Lin, 29, brand-side ops generalist at a 40-person agency. Discovered the *Owner Runbook Drafter* GPT herself. Wants to convince her CEO.

| # | Surface | What Lin does | What we do |
| --- | --- | --- | --- |
| 1 | Internal Slack | Shares a screenshot of the runbook the GPT drafted in 20 minutes. | The GPT is built so its output is shareable as-is — clean Markdown, attribution to the GPT name. |
| 2 | Landing | Opens our page on her laptop in front of the CEO. | The transcript card was designed for over-the-shoulder reading. The hero reads cleanly at presentation distance. |
| 3 | Pricing | They stop at Concierge. CEO is skeptical of the price. | Concierge is priced at $4,200 onboarding so it self-selects organizations that have done agency work before. |
| 4 | FAQ + Proof | CEO reads the "Why crypto" answer. Pauses on the Engagement reference quote. | Quotes are real. Engagement reference availability is gated to qualified inbound only. |
| 5 | Email | CEO emails desk@gpt-store-custom-gpt.prin7r.com asking for a reference call. | We schedule a 20-min call with a current Concierge client (gated to mutual NDA via cal). |
| 6 | NOWPayments invoice | After reference call, Lin pays the $4,200 onboarding via USDT. | Invoice id arrives. Operator-pairing protocol fires. |
| 7 | Eight-week engagement | Three operators on a single Telegram channel. End-of-week reviews. | Custom GPTs configured under the agency's domain (paid OpenAI Team workspace). |
| 8 | Renewal | Eight weeks closes. They renew month-to-month. | We retire one operator from the cell and cycle in someone with the next quarter's specialty. |

**Trust moment.** The reference call. The fact that we gate it (rather than offering case studies on-demand) is part of why we get the renewal.

---

## Journey patterns

- **Every journey starts in the GPT Store.** Direct landing visits convert at half the rate; we accept that the Store is doing the qualification.
- **Every journey ends in an artifact in the visitor's own workspace.** No platform-only IP.
- **Every journey has at least one named operator.** The CTAs do not lead to a chatbot or a calendar booking — they lead to an invoice that triggers a person.
- **No journey requires account creation on our side.** The customer's email + the NOWPayments invoice id are enough state.
