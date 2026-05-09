/**
 * SeriousSequel API — Hono + Bun server.
 *
 * Phase 1 bootstrap: minimal /healthz endpoint.
 * Future phases: Phase 2 SaaS endpoints per CEO directive override.
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

// ─── App ─────────────────────────────────────────────────

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: "https://gpt-store-custom-gpt.prin7r.com",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["authorization", "content-type"],
    maxAge: 86400,
  })
);

// ─── Health ──────────────────────────────────────────────

app.get("/healthz", (c) =>
  c.json({
    status: "ok",
    service: "serioussequel-api",
    version: "0.1.0",
    ts: Date.now(),
  })
);

// ─── 404 ─────────────────────────────────────────────────

app.notFound((c) =>
  c.json(
    { error: "not_found", message: `No route matches ${c.req.method} ${c.req.path}` },
    404
  )
);

app.onError((err, c) => {
  console.error("[SERIOUSSEQUEL_API_ERROR]", err);
  return c.json(
    { error: "internal_error", message: "Unhandled exception." },
    500
  );
});

// ─── Startup ─────────────────────────────────────────────

const port = Number(process.env.PORT ?? 8080);

console.log(`[SERIOUSSEQUEL_API] listening on 0.0.0.0:${port}`);

export default {
  fetch: app.fetch,
  port,
  hostname: "0.0.0.0",
};
