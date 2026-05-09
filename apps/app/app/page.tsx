import { Button } from "@/components/ui/button";

export default function AppPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-page mx-auto w-full max-w-2xl space-y-8 text-center">
        {/* Wordmark */}
        <div className="space-y-3">
          <h1 className="font-mono text-xs uppercase tracking-[0.18em] text-reader">
            SeriousSequel
          </h1>
          <p className="font-sans text-4xl font-semibold tracking-tight text-ink">
            The SaaS sequel is coming.
          </p>
        </div>

        {/* Status */}
        <div className="mx-auto flex max-w-sm items-center gap-3 rounded-card border border-rule bg-paper-200 px-5 py-3">
          <span className="flex h-2.5 w-2.5 rounded-full bg-saffron animate-caret-pulse" />
          <span className="font-mono text-xs text-reader">
            apps/app serving at /app
          </span>
        </div>

        {/* CTA placeholder */}
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm">
            Documentation
          </Button>
          <Button size="sm">Get Started</Button>
        </div>

        {/* Footer */}
        <p className="font-mono text-[11px] text-reader/60">
          Phase 1 bootstrap &middot; Next.js 15 + ShadCN &middot; DESIGN.md tokens
        </p>
      </div>
    </main>
  );
}
