#!/usr/bin/env node
/**
 * [SERIOUSSEQUEL_NOTION_SYNC] Daily cron: reads previous day's orders from
 * SQLite and outputs them as JSON for Notion or other analytics ingestion.
 *
 * Usage (docs/13 Phase 2 task 3):
 *   node workers/notion-sync.mjs
 *
 * Outputs a JSON array of OrderRow objects from the last 24 hours.
 * Pipe into your Notion sync pipeline or call the Notion API directly
 * if NOTION_ORDERS_DSID and PRIN7R_NOTION_TOKEN are configured.
 *
 * Cron entry (on storage-contabo):
 *   0 6 * * * cd /opt/prin7r-deploys/gpt-store-custom-gpt && \
 *     node apps/landing/workers/notion-sync.mjs >> /var/log/serioussequel-notion-sync.log 2>&1
 */

import { getOrdersSince, closeOrdersDb, type OrderRow } from "../lib/orders-db.js";

const DAY_SECONDS = 24 * 60 * 60;
const since = Math.floor(Date.now() / 1000) - DAY_SECONDS;

function main(): void {
  console.log(`[SERIOUSSEQUEL_NOTION_SYNC] fetching orders since ${new Date(since * 1000).toISOString()}`);

  const orders: OrderRow[] = getOrdersSince(since);

  console.log(`[SERIOUSSEQUEL_NOTION_SYNC] found ${orders.length} orders`);

  for (const order of orders) {
    console.log(
      JSON.stringify({
        order_id: order.order_id,
        plan: order.plan,
        amount_usd: order.amount_usd,
        payer_email: order.payer_email,
        referral_source: order.referral_source,
        paid_at: order.paid_at ? new Date(order.paid_at * 1000).toISOString() : null,
        status: order.status,
      })
    );
  }

  // Phase 4 note: if NOTION_ORDERS_DSID and PRIN7R_NOTION_TOKEN are set,
  // this would POST each order to the Notion data source. Currently this is
  // a stdout JSON pipeline — operators can wire it to any destination.

  closeOrdersDb();
  console.log(`[SERIOUSSEQUEL_NOTION_SYNC] done`);
}

main();
