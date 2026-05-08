# SeriousSequel — `gpt-store-custom-gpt`

Productized custom GPTs published to OpenAI's GPT Store as a discovery layer for full Prin7r service. Landing-only Next.js 15 marketing site that converts GPT-Store visitors into engagements. Brand: **SeriousSequel** — the GPT was the first sentence; SeriousSequel finishes the conversation.

- **Live**: https://gpt-store-custom-gpt.prin7r.com
- **Notion opportunity**: https://www.notion.so/GPT-Store-custom-GPT-3543ceec261981708fc2d07fe57359c0
- **Wave**: 2 · **Stack**: landing-only · Next.js 15 + Tailwind + ShadCN baseline

## Brand

**SeriousSequel** (after the GPT Store) — a printed-paper aesthetic that frames a custom GPT as the first sentence of a longer engagement. Source Serif 4 + Inter + JetBrains Mono. Warm white + ink + saffron highlighter. Wordmark sets the brand in serif "SeriousSequel" beside the **S.** monogram. Brand brief lives in `DESIGN.md` and `docs/01-brand-identity.md`.

## Repo layout

```
.
├── DESIGN.md                  Canonical 15-section design + style guide
├── README.md                  This file
├── docker-compose.yml         Single 'landing' service, Traefik labels, env_file
├── Dockerfile.landing         Multistage Next.js 15 standalone build
├── .env.example               Variable names only — never commit live values
├── apps/landing/              Next.js 15 (App Router) + Tailwind 3
│   ├── app/
│   │   ├── page.tsx           Hero, catalog, why, pricing, proof, FAQ, footer
│   │   ├── api/
│   │   │   ├── checkout/nowpayments/route.ts
│   │   │   └── webhooks/nowpayments/route.ts
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── icon.svg
│   ├── components/pricing-cta.tsx
│   ├── lib/
│   │   ├── env.ts             Tiny env reader, shared across Wave 2 builds
│   │   ├── nowpayments.ts     Plans + invoice creator + IPN verifier
│   │   └── cn.ts              clsx + tailwind-merge wrapper
│   ├── tailwind.config.ts     Brand tokens
│   ├── next.config.mjs        output: 'standalone'
│   └── ...
└── docs/
    ├── 01-brand-identity.md … 10-pitch-deck.md
    ├── pitch-deck.html        Self-contained HTML deck
    └── screenshots/
        ├── landing-desktop.png  (1440×900)
        └── landing-mobile.png   (390×844)
```

## Quickstart (local dev)

```bash
cd apps/landing
pnpm install
cp ../../.env.example .env.local   # fill at least NOWPAYMENTS_API_KEY for live invoices
pnpm dev                            # http://localhost:3000
```

`pnpm build && pnpm start` to verify the standalone build before pushing a Docker change.

## Deploy

The landing deploys to `storage-contabo:/opt/prin7r-deploys/gpt-store-custom-gpt/` behind the existing dokploy-traefik proxy on host network mode (HTTP-01 letsencrypt resolver).

```bash
ssh storage-contabo
mkdir -p /opt/prin7r-deploys/gpt-store-custom-gpt
cd /opt/prin7r-deploys/gpt-store-custom-gpt
git clone https://github.com/prin7r-projects/gpt-store-custom-gpt.git .
cp .env.example .env                # then fill NOWPAYMENTS_API_KEY etc.
docker compose build
docker compose up -d
curl -sI https://gpt-store-custom-gpt.prin7r.com   # expect HTTP/2 200
```

The compose file uses `env_file: .env` so credentials never enter the image. `.env` is gitignored on the host. To rotate keys: edit `/opt/prin7r-deploys/gpt-store-custom-gpt/.env` then `docker compose up -d`.

## NOWPayments integration

`apps/landing/app/api/checkout/nowpayments/route.ts` — `POST /api/checkout/nowpayments` with `{ "plan": "engagement" | "subscription" | "concierge" }` body. Calls NOWPayments `POST /v1/invoice`, returns the hosted `invoice_url` for client-side redirect. Falls back to a polite "email the desk" message if env is missing (HTTP 503).

`apps/landing/app/api/webhooks/nowpayments/route.ts` — `POST /api/webhooks/nowpayments`. Verifies the `x-nowpayments-sig` HMAC-SHA512 header against `JSON.stringify(sortObject(payload))`. Logs verified events (`[SERIOUSSEQUEL_NOWPAYMENTS_IPN]`) to journalctl on the deploy host.

`apps/landing/lib/nowpayments.ts` is a copy of the canonical pattern from `payments-prototypes/src/lib/signatures.ts` (sortObject + HMAC-SHA512 + timing-safe hex compare).

## Screenshots

Desktop (1440×900) and mobile (390×844) renders of the deployed landing live in `docs/screenshots/`. Captured via Playwright against the production URL — see `DESIGN.md` section 13.

## Operating notes

- DNS: `*.prin7r.com → 161.97.99.120` wildcard already exists; no per-subdomain record needed.
- TLS: HTTP-01 via the shared `letsencrypt` resolver on dokploy-traefik.
- Secrets: never committed. `.env.example` is the public surface; live values live only in `~/.nth-kir-keys.env` and the gitignored `.env` on storage-contabo.
- Auth ban: this project does not call the Anthropic API directly. Builds run under `CLAUDE_CODE_OAUTH_TOKEN`.

## License

MIT — see `LICENSE`.
