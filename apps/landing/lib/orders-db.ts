/**
 * [SERIOUSSEQUEL_ORDERS_DB] SQLite orders database for marketing analytics.
 *
 * Phase 2 (docs/13): a lightweight sqlite at DATA_DIR/orders.sqlite storing
 * (orderId, plan, paidAt, payerEmail, referralSource) for marketing analytics.
 *
 * Schema matches docs/12 §2:
 *   CREATE TABLE orders (
 *     order_id TEXT PRIMARY KEY,
 *     plan TEXT NOT NULL,
 *     amount_usd NUMERIC NOT NULL,
 *     invoice_id TEXT,
 *     payer_email TEXT,
 *     referral_source TEXT,
 *     paid_at INTEGER,
 *     status TEXT DEFAULT 'paid'
 *   );
 *
 * DB path is configured via ORDERS_DB_DIR (default: /opt/prin7r-deploys/gpt-store-custom-gpt/data).
 * The file is auto-created on first write with WAL mode enabled.
 */

import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { optionalEnv } from "@/lib/env";

let _db: Database.Database | undefined;

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS orders (
  order_id TEXT PRIMARY KEY,
  plan TEXT NOT NULL,
  amount_usd NUMERIC NOT NULL,
  invoice_id TEXT,
  payer_email TEXT,
  referral_source TEXT,
  paid_at INTEGER,
  status TEXT DEFAULT 'paid'
);

CREATE INDEX IF NOT EXISTS idx_orders_referral ON orders(referral_source);
CREATE INDEX IF NOT EXISTS idx_orders_plan ON orders(plan);
CREATE INDEX IF NOT EXISTS idx_orders_paid_at ON orders(paid_at);
`;

export type OrderRow = {
  order_id: string;
  plan: string;
  amount_usd: number;
  invoice_id: string | null;
  payer_email: string | null;
  referral_source: string | null;
  paid_at: number | null;
  status: string;
};

export type InsertOrderInput = {
  order_id: string;
  plan: string;
  amount_usd: number;
  invoice_id?: string;
  payer_email?: string;
  referral_source?: string;
  paid_at?: number;
  status?: string;
};

function getDbPath(): string {
  const dir = optionalEnv("ORDERS_DB_DIR") ?? "/opt/prin7r-deploys/gpt-store-custom-gpt/data";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, "orders.sqlite");
}

export function getOrdersDb(): Database.Database {
  if (_db) return _db;

  const dbPath = getDbPath();
  console.log(`[SERIOUSSEQUEL_ORDERS_DB] opening ${dbPath}`);

  _db = new Database(dbPath);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  _db.exec(SCHEMA_SQL);

  return _db;
}

/**
 * Close the database connection. Useful for tests and graceful shutdown.
 */
export function closeOrdersDb(): void {
  if (_db) {
    _db.close();
    _db = undefined;
  }
}

/**
 * Insert a pending order row at checkout time. Captures referral_source before
 * the visitor leaves for NOWPayments. On IPN, confirmOrder updates the row.
 */
export function insertPendingOrder(input: {
  order_id: string;
  plan: string;
  amount_usd: number;
  referral_source?: string | null;
}): void {
  const db = getOrdersDb();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO orders
      (order_id, plan, amount_usd, referral_source, status)
    VALUES
      (@order_id, @plan, @amount_usd, @referral_source, 'pending')
  `);
  stmt.run({
    order_id: input.order_id,
    plan: input.plan,
    amount_usd: input.amount_usd,
    referral_source: input.referral_source ?? null,
  });
}

/**
 * Confirm a pending order on verified IPN. Updates payment fields while
 * preserving the referral_source captured at checkout. Idempotent —
 * safe for IPN redelivery.
 */
export function confirmOrder(input: {
  order_id: string;
  invoice_id?: string;
  payer_email?: string | null;
  paid_at: number;
  status: string;
}): void {
  const db = getOrdersDb();
  const stmt = db.prepare(`
    UPDATE orders
    SET invoice_id = COALESCE(invoice_id, @invoice_id),
        payer_email = COALESCE(payer_email, @payer_email),
        paid_at = COALESCE(paid_at, @paid_at),
        status = CASE WHEN @status = 'paid' THEN 'paid' ELSE @status END
    WHERE order_id = @order_id
  `);
  stmt.run({
    order_id: input.order_id,
    invoice_id: input.invoice_id ?? null,
    payer_email: input.payer_email ?? null,
    paid_at: input.paid_at,
    status: input.status === "paid" ? "paid" : input.status,
  });
}

/**
 * Insert or replace an order row. Uses INSERT OR REPLACE so replaying
 * the same order_id is idempotent — important for NOWPayments IPN
 * which may redeliver. Prefer insertPendingOrder + confirmOrder for
 * the checkout → IPN flow to preserve referral_source.
 */
export function upsertOrder(input: InsertOrderInput): void {
  const db = getOrdersDb();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO orders
      (order_id, plan, amount_usd, invoice_id, payer_email, referral_source, paid_at, status)
    VALUES
      (@order_id, @plan, @amount_usd, @invoice_id, @payer_email, @referral_source, @paid_at, @status)
  `);
  stmt.run({
    order_id: input.order_id,
    plan: input.plan,
    amount_usd: input.amount_usd,
    invoice_id: input.invoice_id ?? null,
    payer_email: input.payer_email ?? null,
    referral_source: input.referral_source ?? null,
    paid_at: input.paid_at ?? null,
    status: input.status ?? "paid",
  });
}

/**
 * Get orders since a given Unix timestamp. Used by the daily Notion sync cron.
 */
export function getOrdersSince(sinceTimestamp: number): OrderRow[] {
  const db = getOrdersDb();
  const stmt = db.prepare("SELECT * FROM orders WHERE paid_at >= ? ORDER BY paid_at ASC");
  return stmt.all(sinceTimestamp) as OrderRow[];
}

/**
 * Get all orders (for debugging / dashboards). Limited to 1000 rows.
 */
export function getAllOrders(limit = 1000): OrderRow[] {
  const db = getOrdersDb();
  const stmt = db.prepare("SELECT * FROM orders ORDER BY paid_at DESC LIMIT ?");
  return stmt.all(limit) as OrderRow[];
}

/**
 * Count orders grouped by referral_source. Used for conversion-by-GPT analytics.
 */
export function getOrderCountsByReferral(): { referral_source: string | null; count: number }[] {
  const db = getOrdersDb();
  const stmt = db.prepare(
    "SELECT referral_source, COUNT(*) as count FROM orders GROUP BY referral_source ORDER BY count DESC"
  );
  return stmt.all() as { referral_source: string | null; count: number }[];
}

/**
 * Count orders grouped by plan.
 */
export function getOrderCountsByPlan(): { plan: string; count: number }[] {
  const db = getOrdersDb();
  const stmt = db.prepare(
    "SELECT plan, COUNT(*) as count FROM orders GROUP BY plan ORDER BY count DESC"
  );
  return stmt.all() as { plan: string; count: number }[];
}

/**
 * Set ORDER_DB_DIR for testing (uses in-memory DB when path is ":memory:").
 */
export function useMemoryDb(): void {
  closeOrdersDb();
  _db = new Database(":memory:");
  _db.pragma("journal_mode = WAL");
  _db.exec(SCHEMA_SQL);
}
