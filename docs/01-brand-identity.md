# 01 — Brand Identity

## Brand pyramid

- **Essence (1 word).** Continuity.
- **Personality (3 traits).** Literate, exact, quietly confident.
- **Values (3).** Receipts over claims. Named operators over avatars. Files-you-own over chat windows.
- **Attributes (5).** Serif-led typography. Mono framing. Highlighter-as-accent. Generous whitespace. Single-accent restraint.

## Positioning statement

> For founder-operators and ops leaders who already use ChatGPT as a working tool, **After-the-Store** is a productized-engagement service that finishes the conversation a Store-listed GPT politely ended — with named operators, weekly checkpoints, and artifacts that survive the chat — unlike agency-style retainers that bill before they ship, because the GPT is the audition and the engagement is the work.

## Personas (preview)

- **Primary — Maya, founder of a 12-person research consultancy.** Used a Store GPT to diagnose her pricing on a Saturday night; got a useful but generic answer. Has $20k of monthly recurring buying power and is allergic to discovery calls.
- **Secondary — Daniel, ops director at a 200-person B2B SaaS.** Found a Store GPT for RFP decoding. Wants to retain the team behind it for the next quarter. Will sign a PO if invoicing supports it.

(Full personas in `05-audience-profile.md`.)

## Voice & tone

**Do.**
1. Speak like the second paragraph of a long-form essay — declarative, specific, never breathless.
2. Use precise nouns ("rate card," "Tuesday checkpoint," "BambooHR step") in place of category words.
3. Quote real conversations. Attribute them with names + dates.

**Don't.**
1. Use AI marketing tropes ("supercharge," "10x," "your AI co-pilot," sparkle emoji).
2. Reference OpenAI/ChatGPT visual identity. We're after the store, not in it.
3. Pad with hedges. If a sentence wouldn't survive a careful editor, cut it.

**Sample sentence.** "We pulled your last six onboardings from HubSpot. Three stalled at the BambooHR step. Pricing's downstream — let's fix that first."

## Visual system

### Color palette

| Role        | Token              | Hex      | Notes                                       |
| ---         | ---                | ---      | ---                                         |
| Paper       | `paper-100`        | `#FAF6EE` | Default background. Warm cream, low-glare.  |
| Paper Deep  | `paper-200`        | `#F2EBDB` | Section banding, KBD background             |
| Paper Edge  | `paper-300`        | `#E5DBC4` | Faint dividers, disabled states             |
| Ink         | `ink-900`          | `#161513` | Type, dark CTAs                             |
| Ink Soft    | `ink-800`          | `#26241F` | Body emphasis                               |
| Reader      | `reader`           | `#7A7464` | Meta type, captions, mono labels            |
| Saffron     | `saffron-300`      | `#E8A82B` | Single accent — highlighter + alt CTA tone  |

The accent is a single ink-on-paper highlighter mark. It does not become the dominant color; it is allowed exactly once per visible viewport.

### Typography

- **Display.** Source Serif 4 (Variable). Editorial serif. 380 weight at display sizes. Letter-spacing −0.02em.
- **Body.** Inter (Variable). 14–17px. 1.55–1.65 line-height.
- **Transcript / mono.** JetBrains Mono. Tape labels, file paths, attribution.

### Logo concept

A lowercase serif `a.` — the first character of "after." The full mark sets `a.` in Source Serif 4 alongside a mono meta line: "after-the-store · a Prin7r imprint." The logotype is intentionally typesetting, not a glyph.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#FAF6EE" rx="6"/>
  <text x="16" y="22" font-family="Source Serif 4, Georgia, serif"
        font-size="22" font-weight="500" fill="#161513"
        text-anchor="middle">a.</text>
  <rect x="6" y="20" width="20" height="3" fill="#E8A82B" opacity="0.42" rx="1"/>
</svg>
```

(Lives at `apps/landing/app/icon.svg`.)

### Spacing & radius

- Spacing scale: Tailwind defaults; section padding `py-20` desktop, `py-14` mobile.
- Radius: `--radius-sheet: 10px`, `--radius-card: 16px`, `--radius-pill: 999px`.

### Motion

- All transitions on `cubic-bezier(0.2, 0.8, 0.2, 1)` (`ease-page`).
- One ambient animation: the transcript caret pulse, 1.05s 50/50 step.
- No transforms, no scaling, no parallax.

## Forbidden

- Copy-pasting palettes from other Wave 2 brands.
- ChatGPT-green hero, OpenAI-icon mimicry, AI-avatar marketing.
- Stock laptop-on-desk imagery.
- Lorem ipsum copy. TODO strings shipped.
- Reference any visual identity from Anthropic, Vercel, or Linear directly.

## Voice tagline

> "Set in serif, signed in ink, paid in stablecoin."
