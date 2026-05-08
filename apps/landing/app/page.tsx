/**
 * [SERIOUSSEQUEL_LANDING] SeriousSequel conversion landing.
 *
 * Layout:
 *   1. Nav strip (typewriter framing)
 *   2. Hero — transcript card showing depth handoff
 *   3. Mini-catalog of GPT-Store-listed GPTs (placeholder deep links)
 *   4. "Why click through" three-pillar value prop
 *   5. Pricing — three tiers, NOWPayments CTAs
 *   6. Testimonial / proof column
 *   7. FAQ
 *   8. Footer
 */

import { PricingCta } from "@/components/pricing-cta";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <NavStrip />
      <Hero />
      <Catalog />
      <WhyClickThrough />
      <Pricing />
      <Proof />
      <Faq />
      <Footer />
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Nav                                                                 */
/* ------------------------------------------------------------------ */

function NavStrip() {
  return (
    <header className="border-b border-rule">
      <div className="max-w-page mx-auto px-6 py-5 flex items-center justify-between">
        <a href="#hero" className="flex items-center gap-3 group" aria-label="SeriousSequel, by Prin7r">
          <span className="font-serif text-2xl text-ink-900 leading-none">S.</span>
          <span className="hidden sm:inline-block text-[15px] font-serif tracking-tight text-ink-900">
            SeriousSequel
          </span>
          <span className="hidden sm:inline-block text-[12px] tracking-tight text-reader">
            <span className="text-ink-300 mx-1">·</span> a Prin7r imprint
          </span>
        </a>
        <nav className="flex items-center gap-1 sm:gap-3 text-[13px] text-ink-700">
          <a className="hover:text-ink-900 px-2 py-1" href="#catalog">GPTs</a>
          <a className="hover:text-ink-900 px-2 py-1" href="#why">Why click through</a>
          <a className="hover:text-ink-900 px-2 py-1" href="#pricing">Pricing</a>
          <a className="hover:text-ink-900 px-2 py-1" href="#faq">FAQ</a>
          <a
            className="ml-2 hidden sm:inline-flex items-center h-9 px-4 rounded-pill border border-ink-900 bg-ink-900 text-paper-50 hover:bg-ink-800 transition-colors text-[13px]"
            href="#pricing"
          >
            Start an engagement
          </a>
        </nav>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section id="hero" className="border-b border-rule">
      <div className="max-w-page mx-auto px-6 pt-14 pb-20 grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-6">
          <p className="section-label mb-5">FOUND US IN THE GPT STORE</p>
          <h1 className="headline-serif text-display-1 mb-7">
            The GPT was the <span className="mark-saffron">first sentence</span>.
            <br />
            <em>Now let's finish the conversation.</em>
          </h1>
          <p className="text-[17px] leading-[1.65] text-ink-800 max-w-[60ch]">
            We publish productized custom GPTs in the OpenAI Store as a discovery layer.
            They're useful — they answer one question well. The same teams behind the
            GPTs run real engagements behind them: weekly checkpoints, owned workflows,
            named operators, and deliverables that survive past the chat window.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#pricing"
              className="inline-flex h-12 items-center px-6 text-[15px] font-medium rounded-pill bg-ink-900 border border-ink-900 text-paper-50 hover:bg-ink-800 transition-colors"
            >
              Start an engagement
              <svg aria-hidden="true" className="ml-2 h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M5 3l6 5-6 5" /></svg>
            </a>
            <a
              href="#catalog"
              className="inline-flex h-12 items-center px-5 text-[15px] font-medium rounded-pill border border-rule text-ink-800 hover:bg-paper-200 transition-colors"
            >
              Try a GPT first
            </a>
          </div>
          <ul className="mt-9 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3 text-[13px] text-reader">
            <li className="flex gap-2 items-baseline"><span className="text-saffron-400">·</span> Monday onboarding, Friday artifacts</li>
            <li className="flex gap-2 items-baseline"><span className="text-saffron-400">·</span> Crypto-first checkout (USDT/USDC)</li>
            <li className="flex gap-2 items-baseline"><span className="text-saffron-400">·</span> No platform-only IP — files are yours</li>
          </ul>
        </div>

        <div className="lg:col-span-6">
          <TranscriptCard />
        </div>
      </div>
    </section>
  );
}

/* The transcript card — the brand-mark of the page.
   Left half = the GPT-Store snippet; right half = the engagement transcript. */
function TranscriptCard() {
  return (
    <div className="sheet overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-rule bg-paper-100/60">
        <div className="flex items-center gap-2">
          <span className="tape">Transcript · 04 Aug · 14:21 GMT</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-paper-300" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-paper-300" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-paper-300" aria-hidden="true" />
        </div>
      </div>

      <div className="grid md:grid-cols-2">
        {/* Left: GPT-Store snippet — short, helpful, ends */}
        <div className="border-b md:border-b-0 md:border-r border-rule p-5">
          <p className="section-label mb-3">A — IN THE GPT STORE</p>
          <ConversationLine speaker="user" body="What should I price my B2B SaaS onboarding service at?" />
          <ConversationLine
            speaker="gpt"
            body="A common range is $1,500–$8,000 per onboarding. Anchor to outcome: hours saved × loaded cost × 12 months. Bundle implementation + first-week QA into a single setup fee, then an optional retainer."
            short
          />
          <p className="mt-3 text-[12px] text-reader italic">
            That answer is true. It's also the end of what the chat window can do.
          </p>
        </div>

        {/* Right: SeriousSequel engagement — names, dates, artifacts */}
        <div className="p-5 bg-paper-100/40">
          <p className="section-label mb-3 text-saffron-500">B — AFTER THE STORE</p>
          <ConversationLine speaker="ops" body="Pulled your last 6 onboardings from HubSpot. Three stalled at the BambooHR step. Pricing's downstream — let's fix that first." attribution="— J. Romero, delivery lead" />
          <ConversationLine speaker="ops" body="Drafted a 2-tier model anchored on hours-to-first-value. Pinned the working doc in your Notion under /onboarding-pricing." attribution="Tue, day 2" />
          <ConversationLine speaker="user" body="The BambooHR thing is real. I hadn't connected it." />
          <ConversationLine speaker="ops" body="Friday: rate card, signed-off pricing matrix, BambooHR stall fix runbook. We'll bring three named customers into the rollout call." attribution="Fri, day 5" cursor />
        </div>
      </div>

      <div className="px-5 py-3 border-t border-rule flex items-center justify-between text-[12px] text-reader">
        <span><span className="kbd">Tab</span> through speakers <span className="text-ink-300">·</span> the cursor on the right is live</span>
        <span className="font-mono">PRIN7R · session_a4f9</span>
      </div>
    </div>
  );
}

function ConversationLine({
  speaker,
  body,
  short,
  attribution,
  cursor
}: {
  speaker: "user" | "gpt" | "ops";
  body: string;
  short?: boolean;
  attribution?: string;
  cursor?: boolean;
}) {
  const labels: Record<typeof speaker, string> = {
    user: "you",
    gpt: "gpt",
    ops: "ops"
  };
  const tone = speaker === "ops" ? "text-ink-900" : speaker === "gpt" ? "text-ink-700" : "text-ink-800";
  const badgeTone =
    speaker === "ops"
      ? "bg-saffron-100 text-saffron-500 border-saffron-200"
      : "bg-paper-200 text-reader border-rule";
  return (
    <div className={`flex gap-3 ${short ? "mb-2" : "mb-4"} last:mb-0 items-start`}>
      <span className={`shrink-0 mt-1 inline-flex items-center justify-center h-5 px-2 text-[10px] font-mono uppercase rounded border ${badgeTone}`}>
        {labels[speaker]}
      </span>
      <div className={`flex-1 ${tone}`}>
        <p className={`text-[14px] leading-[1.55] ${cursor ? "cursor-bar" : ""}`}>{body}</p>
        {attribution && <p className="mt-1 text-[11.5px] font-mono text-reader">{attribution}</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Catalog                                                             */
/* ------------------------------------------------------------------ */

const STORE_GPTS = [
  {
    id: "ops-pricing",
    title: "Ops Pricing Architect",
    spec: "B2B services pricing, hours→outcome translation",
    storeUrl: "https://chat.openai.com/g/g-pricing-architect-prin7r",
    handoff: "Subscription engagement"
  },
  {
    id: "founders-pipeline",
    title: "Founder's Pipeline Coach",
    spec: "Sales pipeline diagnostics for founder-led GTM",
    storeUrl: "https://chat.openai.com/g/g-founders-pipeline-prin7r",
    handoff: "Per-engagement ticket"
  },
  {
    id: "agency-rfp",
    title: "Agency RFP Decoder",
    spec: "Reads RFP PDFs and surfaces hidden scope changes",
    storeUrl: "https://chat.openai.com/g/g-agency-rfp-prin7r",
    handoff: "Per-engagement ticket"
  },
  {
    id: "research-hand",
    title: "Research-Pad Hand",
    spec: "Cleans interview transcripts into themed insight memos",
    storeUrl: "https://chat.openai.com/g/g-research-hand-prin7r",
    handoff: "Subscription engagement"
  },
  {
    id: "owner-runbook",
    title: "Owner Runbook Drafter",
    spec: "Writes role-specific runbooks for first hires",
    storeUrl: "https://chat.openai.com/g/g-owner-runbook-prin7r",
    handoff: "Concierge engagement"
  }
] as const;

function Catalog() {
  return (
    <section id="catalog" className="border-b border-rule">
      <div className="max-w-page mx-auto px-6 py-20">
        <div className="mb-10 grid md:grid-cols-3 gap-6 items-end">
          <div className="md:col-span-2">
            <p className="section-label mb-3">WHAT OUR GPTs DO TODAY</p>
            <h2 className="headline-serif text-display-2">
              Five published GPTs. Each is the polite end of a longer conversation.
            </h2>
          </div>
          <p className="text-[14.5px] text-reader leading-relaxed md:text-right">
            Open one in the OpenAI Store, ask it the worst question you have. When it
            stops at the door, the link below the answer brings you back here.
          </p>
        </div>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {STORE_GPTS.map((g) => (
            <li key={g.id} className="sheet flex flex-col p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="tape">{g.handoff}</span>
                <span className="font-mono text-[11px] text-reader">{g.id.replace(/-/g, "·")}</span>
              </div>
              <h3 className="font-serif text-[20px] leading-snug text-ink-900 mb-1">{g.title}</h3>
              <p className="text-[13.5px] text-ink-700 leading-relaxed mb-5">{g.spec}</p>
              <div className="mt-auto flex items-center justify-between">
                <a
                  href={g.storeUrl}
                  className="copy-link text-[13px]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in GPT Store ↗
                </a>
                <a href="#pricing" className="text-[13px] text-saffron-400 hover:text-saffron-500">
                  Hand off →
                </a>
              </div>
            </li>
          ))}
          <li className="deck flex flex-col items-start p-5 border-dashed">
            <span className="tape mb-3">PUBLISHING NEXT</span>
            <h3 className="font-serif text-[20px] leading-snug text-ink-900 mb-1">
              Two more GPTs in editorial review.
            </h3>
            <p className="text-[13.5px] text-ink-700 leading-relaxed mb-5">
              We don't publish a GPT until a senior operator has stress-tested it
              against real client work. Sign up below to be told when each ships.
            </p>
            <a href="#pricing" className="copy-link text-[13px] mt-auto">
              See pricing
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Why click through                                                   */
/* ------------------------------------------------------------------ */

function WhyClickThrough() {
  return (
    <section id="why" className="border-b border-rule">
      <div className="max-w-page mx-auto px-6 py-20">
        <p className="section-label mb-3">WHY CLICK THROUGH</p>
        <h2 className="headline-serif text-display-2 mb-10 max-w-[28ch]">
          Three things a chat window can't give you, ever.
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Pillar
            no="01"
            title="Memory across weeks."
            body="A GPT sees a conversation. We see your pipeline, your last six engagements, the Notion doc the founder edited at 1am. Continuity is the work."
            mark="weeks"
          />
          <Pillar
            no="02"
            title="Named operators, not avatars."
            body="Engagements are run by a real person whose name is on the email. They open a Loom, write the runbook, and sit on the rollout call. The GPT prepares the ground."
            mark="real"
          />
          <Pillar
            no="03"
            title="Artifacts that survive the chat."
            body="A pricing matrix in your Notion. A runbook in your Drive. A pitch deck a CFO can open without context. The chat window goes away — your files stay."
            mark="files"
          />
        </div>
      </div>
    </section>
  );
}

function Pillar({ no, title, body, mark }: { no: string; title: string; body: string; mark: string }) {
  const re = new RegExp(`(${mark})`, "i");
  const parts = body.split(re);
  return (
    <div className="sheet p-7 h-full">
      <p className="font-mono text-[11px] tracking-widest text-reader mb-4">{no}</p>
      <h3 className="font-serif text-[24px] leading-snug text-ink-900 mb-3">{title}</h3>
      <p className="text-[14.5px] leading-relaxed text-ink-800">
        {parts.map((p, i) =>
          re.test(p) ? <span key={i} className="mark-saffron">{p}</span> : <span key={i}>{p}</span>
        )}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pricing                                                             */
/* ------------------------------------------------------------------ */

function Pricing() {
  return (
    <section id="pricing" className="border-b border-rule">
      <div className="max-w-page mx-auto px-6 py-20">
        <div className="mb-10 max-w-[60ch]">
          <p className="section-label mb-3">PRICING</p>
          <h2 className="headline-serif text-display-2 mb-4">
            Three doors. Each opens onto a real desk.
          </h2>
          <p className="text-[15px] text-ink-700 leading-relaxed">
            Crypto-first checkout (USDT / USDC) via NOWPayments. Card on-ramp is
            available on the hosted invoice. We never see card numbers; we receive
            a verified invoice id and start the engagement.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <PriceCard
            tier="Pay-per-engagement"
            blurb="One scoped problem the GPT couldn't finish. We pick up the transcript and ship the artifact."
            price="$480"
            unit="per engagement"
            bullets={[
              "1 named operator on the file",
              "1–2 working sessions, async between",
              "Single deliverable + 7-day fix window",
              "No retainer, no automatic renewal"
            ]}
            cta={<PricingCta plan="engagement" label="Start a single engagement" tone="ink" />}
          />
          <PriceCard
            tier="Monthly subscription"
            featured
            blurb="The team that built the GPT, on standing weekly checkpoints. Tuned to your data."
            price="$1,480"
            unit="per month · $690 onboarding"
            bullets={[
              "Private GPT trained on your context",
              "2 named operators · Tue/Thu checkpoints",
              "Editable workspace (Notion or your stack)",
              "Cancel after any 30-day cycle"
            ]}
            cta={<PricingCta plan="subscription" label="Begin a subscription" tone="saffron" />}
          />
          <PriceCard
            tier="Concierge engagement"
            blurb="Eight weeks. A cell of three. Custom GPTs hosted under your brand. End-of-week artifact reviews."
            price="$5,800"
            unit="per month · $4,200 onboarding"
            bullets={[
              "3-person delivery cell + named lead",
              "GPTs hosted under your domain",
              "Single Slack/Telegram channel",
              "8-week minimum, then month-to-month"
            ]}
            cta={<PricingCta plan="concierge" label="Open the concierge door" tone="ink" />}
          />
        </div>

        <p className="mt-7 text-[13px] text-reader">
          Direct-wallet (Reown / WalletConnect) and Plisio fallback are wired but
          quieted while NOWPayments is our primary rail.
        </p>
      </div>
    </section>
  );
}

function PriceCard({
  tier,
  blurb,
  price,
  unit,
  bullets,
  cta,
  featured
}: {
  tier: string;
  blurb: string;
  price: string;
  unit: string;
  bullets: string[];
  cta: React.ReactNode;
  featured?: boolean;
}) {
  return (
    <div
      className={`deck p-7 flex flex-col ${
        featured
          ? "border-saffron-300 shadow-[0_30px_60px_-30px_rgba(232,168,43,0.35)]"
          : ""
      }`}
    >
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-serif text-[22px] text-ink-900 leading-tight">{tier}</h3>
        {featured && <span className="tape">Most chosen</span>}
      </div>
      <p className="text-[14px] text-ink-700 leading-relaxed mb-6">{blurb}</p>
      <div className="mb-6">
        <p className="font-serif text-display-3 text-ink-900 leading-none">{price}</p>
        <p className="font-mono text-[11.5px] text-reader uppercase tracking-widest mt-1">{unit}</p>
      </div>
      <ul className="space-y-2.5 mb-7 text-[14px] text-ink-800">
        {bullets.map((b) => (
          <li key={b} className="flex gap-3 items-start">
            <span aria-hidden="true" className="mt-2 inline-block w-2 h-px bg-saffron-400" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto">{cta}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Proof                                                               */
/* ------------------------------------------------------------------ */

function Proof() {
  return (
    <section className="border-b border-rule">
      <div className="max-w-page mx-auto px-6 py-20 grid md:grid-cols-12 gap-12 items-start">
        <div className="md:col-span-5">
          <p className="section-label mb-3">FROM RECENT ENGAGEMENTS</p>
          <h2 className="headline-serif text-display-2">
            Quiet receipts from people who clicked through.
          </h2>
        </div>
        <ul className="md:col-span-7 space-y-6">
          <Quote
            body="The GPT diagnosed our pricing in eight minutes. The team behind it spent three weeks rewriting our rate card. The second one is what got renewed."
            who="A. Park · founder, retainer-led research firm"
          />
          <Quote
            body="We were ready to dismiss the lead. Then the engagement notes turned into a runbook our COO is still using."
            who="L. Mendes · ops director, B2B SaaS"
          />
          <Quote
            body="I came for a chat. I left with two named operators, a Notion folder I owned, and a rollout date."
            who="Engagement reference, Mar 2026 · provided on request"
          />
        </ul>
      </div>
    </section>
  );
}

function Quote({ body, who }: { body: string; who: string }) {
  return (
    <li className="border-l-2 border-saffron-300 pl-5">
      <p className="font-serif text-[20px] leading-[1.45] text-ink-900">"{body}"</p>
      <p className="mt-3 font-mono text-[12px] text-reader">{who}</p>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

const FAQ_ITEMS = [
  {
    q: "Is this a tool or a service?",
    a: "Both. The GPT in the OpenAI Store is a free, productized tool — useful by itself. The pricing tiers below are services run by named operators using the same GPT (and a few private ones) as one of their working tools."
  },
  {
    q: "Why publish in the GPT Store at all?",
    a: "Distribution. The Store is one of the cheapest ways to put a real, working artefact in front of a buyer in 2026. Each GPT is a serious answer to a small question — the kind that earns the click into a longer conversation."
  },
  {
    q: "Why crypto checkout?",
    a: "Speed and reach. NOWPayments lets us settle in stablecoin (USDT/USDC) anywhere our clients are, with a card on-ramp on the same hosted page. No 3-day Stripe wait. No regional churn. Real receipts on chain."
  },
  {
    q: "Can I just pay with a card?",
    a: "Yes. The NOWPayments hosted page includes a fiat partner card on-ramp once you click 'Pay with card'. The merchant of record is NOWPayments; we receive the verified invoice id."
  },
  {
    q: "Who owns the GPT or the artifacts after?",
    a: "You own anything we deliver to your account: docs in your Notion, runbooks in your Drive, custom GPTs configured under your team. Public Store GPTs stay in our publisher account."
  },
  {
    q: "What if I want to talk to a human first?",
    a: "Open one of the published GPTs at the top of this page. The same operator who tuned it will reply if you write desk@gpt-store-custom-gpt.prin7r.com — quietly, without a sales motion."
  }
];

function Faq() {
  return (
    <section id="faq" className="border-b border-rule">
      <div className="max-w-page mx-auto px-6 py-20 grid md:grid-cols-12 gap-12 items-start">
        <div className="md:col-span-4">
          <p className="section-label mb-3">FAQ</p>
          <h2 className="headline-serif text-display-2 leading-tight">
            Things you'd ask the GPT first.
          </h2>
        </div>
        <ul className="md:col-span-8 divide-y divide-rule border-t border-b border-rule">
          {FAQ_ITEMS.map((item) => (
            <li key={item.q} className="py-5">
              <details className="group">
                <summary className="flex justify-between items-start cursor-pointer list-none">
                  <span className="font-serif text-[19px] text-ink-900 leading-snug pr-6">{item.q}</span>
                  <span aria-hidden="true" className="font-mono text-[12px] text-reader mt-1 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-[14.5px] text-ink-800 leading-relaxed max-w-[60ch]">{item.a}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="bg-paper-200/40">
      <div className="max-w-page mx-auto px-6 py-14 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <p className="font-serif text-[28px] leading-tight text-ink-900 mb-2">
            S. <span className="text-ink-900">SeriousSequel</span>
          </p>
          <p className="font-mono text-[12px] tracking-tight text-reader mb-3">a Prin7r imprint · after the GPT Store</p>
          <p className="text-[14px] text-ink-700 leading-relaxed max-w-[42ch]">
            SeriousSequel publishes productized GPTs as the first sentence of
            longer engagements — and runs the actual sequel quietly out of the
            printed-paper tradition.
          </p>
        </div>
        <div className="md:col-span-3">
          <p className="section-label mb-3">CONTACT</p>
          <ul className="space-y-2 text-[14px] text-ink-800">
            <li><a className="copy-link" href="mailto:desk@gpt-store-custom-gpt.prin7r.com">desk@gpt-store-custom-gpt.prin7r.com</a></li>
            <li className="font-mono text-[12.5px] text-reader">PGP fingerprint on request</li>
          </ul>
        </div>
        <div className="md:col-span-4">
          <p className="section-label mb-3">ARTIFACTS</p>
          <ul className="space-y-2 text-[14px] text-ink-800">
            <li><a className="copy-link" href="https://github.com/prin7r-projects/gpt-store-custom-gpt" target="_blank" rel="noopener noreferrer">Source · GitHub</a></li>
            <li><a className="copy-link" href="#catalog">Published GPTs</a></li>
            <li><a className="copy-link" href="#pricing">Engagement tiers</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-rule">
        <div className="max-w-page mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between gap-3 text-[12px] font-mono text-reader">
          <span>© 2026 Prin7r · SeriousSequel imprint</span>
          <span>Set in Source Serif 4 / Inter / JetBrains Mono · printed on warm paper</span>
        </div>
      </div>
    </footer>
  );
}
