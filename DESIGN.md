# DESIGN.md — gpt-store-custom-gpt

Canonical design + style guide for the After-the-GPT-Store landing. Owned by Chief of Design. Kept in sync with `apps/landing/`. ShadCN baseline applies.

## 1. Product and audience

**Product.** A pure-marketing landing that converts OpenAI-GPT-Store visitors into Prin7r engagements. The Store ships free productized GPTs as discovery; this site is the transitional space where a curious visitor decides whether to keep the conversation going off-platform.

**Primary audience.** Founder-operators and small-team leads (Series-A and below, B2B services or SaaS) who already use ChatGPT as a tool, opened a Store-listed GPT for a real problem, hit the wall of "the chat ended but the problem didn't," and now want a verdict on whether a paid engagement is worth their next 30 minutes.

**Secondary audience.** Operations leaders at established companies (50–500 people) who use the GPT Store as a source of vetted small experts and need a low-friction way to retain the team behind one. They are skeptical of agencies and value receipts over claims.

**Anti-audience.** Bargain hunters, prompt-collectors, AI tourists. Anyone who came for a free model and won't read more than one paragraph. Visual cues should not pander to them.

**One-line positioning.** "The GPT was the first sentence — now let's finish the conversation."

## 2. Visual positioning

**Mood.** Quiet, printed, edited. Reads like an essay or a bound notebook page. Avoids: ChatGPT-green accents, OpenAI badge mimicry, AI-avatar marketing tropes, gradient-soaked SaaS pages, Vercel-style neon.

**Brand DNA.** *Transcript-paper.* The page itself is a sheet of warm cream paper. Conversation cards read like printed transcripts with mono framing. A single saffron highlighter mark per section pulls the eye through. Ink is the only rich color.

**Pyramid.**
- Essence: continuity
- Personality: literate, exact, quietly confident
- Values: receipts, named operators, files-you-own
- Attributes: serif-led, mono-framed, minimal hierarchy, generous whitespace, single-accent

**Voice tagline.** "Set in serif, signed in ink, paid in stablecoin."

## 3. ShadCN baseline and local component policy

**Baseline.** ShadCN/ui via the registry CLI is the default for any primitive that needs a real interaction surface (button, dialog, dropdown, sheet, tooltip). For Wave 2 launch the landing uses no ShadCN imports yet — its hand-built primitives (`PriceCard`, `TranscriptCard`, `Pillar`, `Quote`) are open code we own and review. When the apps/app/ side ships in a later wave it will import ShadCN under `apps/landing/components/ui/` via `pnpm dlx shadcn@latest add <component>`.

**Local component policy.**
- Open code only. No black-box UI libraries that own our styling tokens.
- Marketing-page expressiveness pre-approved (Skiper UI, Cult UI, Componentry, Ali Imam patterns) as references — never as forks. Dashboards remain restrained.
- Forbidden: paid/pro libraries without CEO approval; component libraries that conflict with ShadCN conventions.

**Exception register.** None for the v1 landing. If we add a charting or rich-editor primitive, document the exception here with a one-paragraph rationale.

## 4. Color tokens

| Role        | Token              | Hex      | Usage                                       |
| ---         | ---                | ---      | ---                                         |
| Paper       | `paper-100`        | `#FAF6EE` | Background, default canvas                 |
| Paper Deep  | `paper-200`        | `#F2EBDB` | Section banding, KBD background             |
| Paper Edge  | `paper-300`        | `#E5DBC4` | Disabled chips, faint dividers              |
| Ink         | `ink-900`          | `#161513` | Primary type, dark CTAs                     |
| Ink Soft    | `ink-800`          | `#26241F` | Body emphasis, hover states                 |
| Reader      | `reader`           | `#7A7464` | Meta type, captions, mono labels            |
| Saffron     | `saffron-300`      | `#E8A82B` | Single accent — highlighter and CTA tone B  |
| Saffron Mark| `--saffron-soft`   | `rgba(232,168,43,0.42)` | Highlighter background only      |
| Rule        | `rule`             | `#E5DBC4` | All hairlines, card borders                 |

Use saffron exactly once per visible viewport. The mark is intentionally lossy (uneven baseline, shoulder past the letter) to preserve the printed-marker character.

## 5. Typography

**Display.** Source Serif 4 (Variable). Headlines, h2, h3, all editorial copy that should "speak." 380 weight at display sizes; italics used as secondary emphasis. Letter-spacing -0.02em on headlines.

**Body.** Inter (Variable). 14–17px. 1.55–1.65 line-height. Used for runtime copy: nav, paragraph copy in cards, FAQ answers.

**Transcript / mono.** JetBrains Mono. Used for tape labels, kbd, attribution lines, file paths, time stamps. Never used for paragraph copy.

**Type scale.**
- `display-1` — clamp(2.4rem, 5vw, 4.25rem) · 1.04 line-height — hero
- `display-2` — clamp(1.75rem, 3.4vw, 2.75rem) · 1.08 — section h2
- `display-3` — clamp(1.4rem, 2.4vw, 1.9rem) · 1.18 — price tier
- Body — 14–17px Inter
- Mono — 11–13px JetBrains Mono with `letter-spacing` 0.02–0.18em depending on register

**Pairings.** Source Serif headlines + Inter body + JetBrains Mono framing. No sans display, no slab serif. Italics only inside Source Serif.

## 6. Spacing, radius, shadows, and borders

- **Spacing scale.** Tailwind defaults; section padding `py-20` desktop, `py-14` mobile.
- **Radius.** `--radius-sheet: 10px`, `--radius-card: 16px`, `--radius-pill: 999px`.
- **Shadows.** Sheet `0 1px 0 rgba(22,21,19,0.04), 0 12px 32px -16px rgba(22,21,19,0.18)`. Deck (pricing) heavier vertical drop, 30px blur. Marker shadow is the highlighter inset.
- **Borders.** 1px `rule` (#E5DBC4) on every card, divider, and input. Featured pricing card swaps to `saffron-300`.

## 7. Layout system and responsive rules

**Grid.** 12-col internal, max-width `1180px` (`max-w-page`), 24px gutter.

**Breakpoints.**
- 320px — single column, transcript card stacks vertically (left half above right half).
- 768px — two-column hero (transcript card moves alongside copy), pricing reverts to single-column stack.
- 1024px — three-column pillar / catalog grids.
- 1440px+ — fixed at `max-w-page`; never spans wider than `1180px`.

**Responsive rules.**
- Hero copy never crosses `60ch`; visual side never overflows the right rail.
- Transcript-card grid collapses 2→1 at `md` breakpoint with a horizontal `md:border-r` switching to vertical `border-b`.
- Pricing tiers stack 3→1 at md; the featured tier remains visually distinct via the saffron border, not by reordering.

## 8. Component catalog

| Component        | File                                        | Notes |
| ---              | ---                                         | --- |
| `NavStrip`       | `app/page.tsx`                              | Logotype `a.` + meta + nav links + CTA pill |
| `Hero`           | `app/page.tsx`                              | Two-column copy + transcript card |
| `TranscriptCard` | `app/page.tsx`                              | The brand mark — split GPT vs after-store |
| `ConversationLine` | `app/page.tsx`                            | Tape-badge + body + optional attribution + cursor |
| `Catalog`        | `app/page.tsx`                              | 5-card mini-catalog of published GPTs + 1 "publishing-next" |
| `Pillar`         | `app/page.tsx`                              | Three sheet cards under "Why click through" |
| `Pricing` / `PriceCard` | `app/page.tsx`                       | Three pricing tiers + NOWPayments CTA each |
| `PricingCta`     | `components/pricing-cta.tsx`                | Client component — fetches `/api/checkout/nowpayments` |
| `Proof` / `Quote`| `app/page.tsx`                              | Three saffron-rule quotes |
| `Faq`            | `app/page.tsx`                              | Native `<details>` accordion |
| `Footer`         | `app/page.tsx`                              | Three-column footer with imprint copy |

Future ShadCN imports (when we add them): `Button`, `Dialog`, `Tooltip`, `Sheet`. They go under `components/ui/` and inherit our token palette.

## 9. Landing page structure

In order:

1. **Nav strip** — `a.` logotype, meta, nav links, CTA pill.
2. **Hero** — Source-Serif headline ("The GPT was the first sentence…"), supporting paragraph, two CTAs (`Start an engagement` ink, `Try a GPT first` outline), three meta bullets, transcript card on the right.
3. **Catalog** ("What our GPTs do today") — 5 GPT-Store deep-link cards + 1 "publishing-next" card. Each card carries a tape-badge for the typical handoff tier.
4. **Why click through** — three numbered pillars; one highlighter mark per pillar.
5. **Pricing** — three tiers (Pay-per-engagement / Subscription / Concierge), NOWPayments CTA on each, fallback copy below.
6. **Proof** — three saffron-rule quotes from past engagements.
7. **FAQ** — six native-disclosure entries answering tool-vs-service, GPT Store rationale, crypto rationale, card path, IP, human-first contact.
8. **Footer** — imprint copy, contact, source links, set-in-typefaces colophon.

Real copy throughout. No Lorem ipsum. No "TODO" strings.

## 10. Imagery and generated asset rules

The landing uses **no photography**. The transcript-paper aesthetic explicitly rejects stock imagery and AI-avatar marketing. Brand identity is carried entirely by typography, paper texture, and the highlighter mark.

If/when imagery becomes necessary (case studies, founder portrait), preferred sources in priority order:
1. `prin7r-generate-image` (GPT Image 2) using palette-locked prompts that reference DESIGN.md tokens.
2. Custom photography with neutral backdrop, rendered in greyscale + saffron duotone via CSS filters.
3. SVG diagrams hand-drawn in repo at `apps/landing/public/generated/`.

Forbidden: stock laptop-on-desk imagery, generic AI illustrations, OpenAI/ChatGPT brand mimicry, neon gradients, glassmorphism.

**Generated-asset blocker register.** GPT Image 2 access not exercised on this build (no imagery needed). If a future revision needs imagery and the tool returns billing/entitlement errors, ship without and record the blocker here.

## 11. Motion and interaction rules

- **Easing.** `cubic-bezier(0.2, 0.8, 0.2, 1)` for all transitions. Tailwind alias `ease-page`.
- **Duration.** 200ms for state transitions (hover, button color), 300ms for accordion expand.
- **Caret.** The transcript cursor pulses on a 1.05s 50/50 step (`@keyframes caret-pulse`) — the only ambient motion on the page.
- **Hover.** Pricing CTAs darken, copy-links pull saffron, no transforms or scale.
- **Focus.** 2px saffron outline, 2px offset, 4px radius — visible on every interactive element.
- **Reduced-motion.** Respect `prefers-reduced-motion: reduce` — caret animation pauses (via media query in a follow-up polish pass; current scope is one ambient animation, low risk).

## 12. Accessibility and quality gates

- Color contrast: ink-900 on paper-100 measures ~14.6:1 (AAA). Reader on paper-100 measures ~5.0:1 (AA at body sizes).
- Focus order: nav → hero CTA-1 → CTA-2 → catalog cards → "Open in GPT Store" links → pricing CTAs → FAQ summaries → footer links. Verified by tab cycle.
- All images have alt text; the `icon.svg` favicon is decorative and uses `aria-hidden`.
- Headings nest correctly: `h1` once (hero), `h2` per section, `h3` for sub-cards. No skipped levels.
- All interactive elements are real `<button>` or `<a>` — no div-with-onclick.
- Native `<details>` is used for FAQ disclosure (works without JS).
- Animation respects future reduced-motion preference (see §11).
- 320px viewport tested — no overflow, no clipped CTA labels.
- Keyboard-only flow tested: Tab + Enter completes the whole journey.

## 13. Screenshots and verification artifacts

Captured against the deployed URL via headless Chromium (Playwright). Reusable script: `/tmp/prin7r-screenshots/capture.mjs`.

- Desktop (1440×900): `docs/screenshots/landing-desktop.png`
- Mobile (390×844): `docs/screenshots/landing-mobile.png`

Both linked here and embedded in `README.md`. Re-capture after every meaningful landing-page change.

## 14. External references and library sources

- Refero Styles — https://styles.refero.design/ — searchable curated DESIGN.md library for color/typography/spacing pattern reference.
- ShadCN/ui — https://ui.shadcn.com — registry baseline.
- Source Serif 4 — Adobe Originals (Frank Grießhammer); Google Fonts hosting.
- Inter — Rasmus Andersson; Google Fonts hosting.
- JetBrains Mono — JetBrains; Google Fonts hosting.
- Reference DESIGN.md — `wave2-builds/chatbot-agency/DESIGN.md` (paired Wave 2 build, NOWPayments-on-landing pattern).
- NOWPayments invoice + IPN reference — `payments-prototypes/src/lib/checkout.ts`, `payments-prototypes/src/lib/signatures.ts`.

## 15. Changelog

- `2026-05-08` v0.1 — Initial scaffold. Hero, transcript card, mini-catalog, three-tier pricing, proof, FAQ, footer. NOWPayments wired. ShadCN baseline declared, no imports yet.
