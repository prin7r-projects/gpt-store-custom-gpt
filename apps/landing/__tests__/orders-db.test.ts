/**
 * Tests for orders-db.ts — SQLite orders database for marketing analytics.
 *
 * Phase 2 (docs/13): verifies insert, confirm, query operations.
 * Uses in-memory SQLite via useMemoryDb() so tests are isolated and fast.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  useMemoryDb,
  insertPendingOrder,
  confirmOrder,
  getOrdersSince,
  getAllOrders,
  getOrderCountsByReferral,
  getOrderCountsByPlan,
  closeOrdersDb,
  type OrderRow,
} from "@/lib/orders-db";

describe("orders-db", () => {
  beforeEach(() => {
    useMemoryDb();
  });

  afterEach(() => {
    closeOrdersDb();
  });

  describe("insertPendingOrder", () => {
    it("inserts a pending order", () => {
      insertPendingOrder({
        order_id: "order-1",
        plan: "engagement",
        amount_usd: 480,
        referral_source: "gpt-ops-pricing",
      });

      const orders = getAllOrders();
      expect(orders).toHaveLength(1);
      expect(orders[0].order_id).toBe("order-1");
      expect(orders[0].plan).toBe("engagement");
      expect(orders[0].amount_usd).toBe(480);
      expect(orders[0].referral_source).toBe("gpt-ops-pricing");
      expect(orders[0].status).toBe("pending");
      expect(orders[0].paid_at).toBeNull();
      expect(orders[0].payer_email).toBeNull();
    });

    it("ignores duplicate order_id (INSERT OR IGNORE)", () => {
      insertPendingOrder({
        order_id: "order-1",
        plan: "engagement",
        amount_usd: 480,
        referral_source: "gpt-ops-pricing",
      });

      // Second insert with different referral should be ignored
      insertPendingOrder({
        order_id: "order-1",
        plan: "subscription",
        amount_usd: 690,
        referral_source: "gpt-founders-pipeline",
      });

      const orders = getAllOrders();
      expect(orders).toHaveLength(1);
      // First insert wins
      expect(orders[0].plan).toBe("engagement");
      expect(orders[0].referral_source).toBe("gpt-ops-pricing");
    });

    it("handles null referral_source", () => {
      insertPendingOrder({
        order_id: "order-2",
        plan: "subscription",
        amount_usd: 690,
        referral_source: null,
      });

      const orders = getAllOrders();
      expect(orders[0].referral_source).toBeNull();
    });
  });

  describe("confirmOrder", () => {
    it("confirms a pending order with payment details", () => {
      insertPendingOrder({
        order_id: "order-1",
        plan: "engagement",
        amount_usd: 480,
        referral_source: "gpt-ops-pricing",
      });

      const paidAt = Math.floor(Date.now() / 1000);
      confirmOrder({
        order_id: "order-1",
        invoice_id: "inv-123",
        payer_email: "buyer@example.com",
        paid_at: paidAt,
        status: "paid",
      });

      const orders = getAllOrders();
      expect(orders).toHaveLength(1);
      expect(orders[0].status).toBe("paid");
      expect(orders[0].invoice_id).toBe("inv-123");
      expect(orders[0].payer_email).toBe("buyer@example.com");
      expect(orders[0].paid_at).toBe(paidAt);
      // Referral source preserved from pending insert
      expect(orders[0].referral_source).toBe("gpt-ops-pricing");
    });

    it("is idempotent (safe for IPN replay)", () => {
      insertPendingOrder({
        order_id: "order-1",
        plan: "engagement",
        amount_usd: 480,
        referral_source: "gpt-ops-pricing",
      });

      const paidAt = Math.floor(Date.now() / 1000);

      confirmOrder({
        order_id: "order-1",
        invoice_id: "inv-123",
        payer_email: "first@example.com",
        paid_at: paidAt,
        status: "paid",
      });

      // Replay with different email — should NOT overwrite (COALESCE)
      confirmOrder({
        order_id: "order-1",
        invoice_id: "inv-456",
        payer_email: "replay@example.com",
        paid_at: paidAt + 100,
        status: "paid",
      });

      const orders = getAllOrders();
      expect(orders).toHaveLength(1);
      // COALESCE preserves first value
      expect(orders[0].payer_email).toBe("first@example.com");
      expect(orders[0].invoice_id).toBe("inv-123");
      expect(orders[0].paid_at).toBe(paidAt);
    });

    it("updates status for non-paid IPN events (e.g. 'expired')", () => {
      insertPendingOrder({
        order_id: "order-1",
        plan: "subscription",
        amount_usd: 690,
        referral_source: null,
      });

      confirmOrder({
        order_id: "order-1",
        invoice_id: "inv-789",
        payer_email: "buyer@example.com",
        paid_at: Math.floor(Date.now() / 1000),
        status: "expired",
      });

      const orders = getAllOrders();
      expect(orders[0].status).toBe("expired");
    });

    it("no-ops for non-existent order_id", () => {
      confirmOrder({
        order_id: "nonexistent",
        invoice_id: "inv-000",
        payer_email: null,
        paid_at: Math.floor(Date.now() / 1000),
        status: "paid",
      });

      const orders = getAllOrders();
      expect(orders).toHaveLength(0);
    });
  });

  describe("getOrdersSince", () => {
    it("returns orders after a given timestamp", () => {
      const now = Math.floor(Date.now() / 1000);

      insertPendingOrder({
        order_id: "old-order",
        plan: "engagement",
        amount_usd: 480,
        referral_source: null,
      });
      confirmOrder({
        order_id: "old-order",
        paid_at: now - 7200,
        status: "paid",
      });

      insertPendingOrder({
        order_id: "new-order",
        plan: "subscription",
        amount_usd: 690,
        referral_source: "gpt-ops-pricing",
      });
      confirmOrder({
        order_id: "new-order",
        paid_at: now - 60,
        status: "paid",
      });

      const recent = getOrdersSince(now - 3600);
      expect(recent).toHaveLength(1);
      expect(recent[0].order_id).toBe("new-order");
    });

    it("returns empty array when no orders match", () => {
      const future = Math.floor(Date.now() / 1000) + 86400;
      const result = getOrdersSince(future);
      expect(result).toHaveLength(0);
    });
  });

  describe("getAllOrders", () => {
    it("returns orders ordered by paid_at DESC", () => {
      const now = Math.floor(Date.now() / 1000);

      insertPendingOrder({ order_id: "a", plan: "engagement", amount_usd: 480, referral_source: null });
      confirmOrder({ order_id: "a", paid_at: now - 100, status: "paid" });

      insertPendingOrder({ order_id: "b", plan: "concierge", amount_usd: 4200, referral_source: null });
      confirmOrder({ order_id: "b", paid_at: now - 50, status: "paid" });

      const orders = getAllOrders();
      expect(orders[0].order_id).toBe("b");
      expect(orders[1].order_id).toBe("a");
    });

    it("respects limit parameter", () => {
      for (let i = 0; i < 5; i++) {
        insertPendingOrder({
          order_id: `order-${i}`,
          plan: "engagement",
          amount_usd: 480,
          referral_source: null,
        });
        confirmOrder({
          order_id: `order-${i}`,
          paid_at: Math.floor(Date.now() / 1000) + i,
          status: "paid",
        });
      }

      const orders = getAllOrders(3);
      expect(orders).toHaveLength(3);
    });
  });

  describe("getOrderCountsByReferral", () => {
    it("counts orders grouped by referral_source", () => {
      const now = Math.floor(Date.now() / 1000);

      const refs = ["gpt-ops-pricing", "gpt-ops-pricing", "gpt-founders-pipeline", null];
      for (let i = 0; i < refs.length; i++) {
        insertPendingOrder({
          order_id: `order-${i}`,
          plan: "engagement",
          amount_usd: 480,
          referral_source: refs[i],
        });
        confirmOrder({
          order_id: `order-${i}`,
          paid_at: now + i,
          status: "paid",
        });
      }

      const counts = getOrderCountsByReferral();
      expect(counts).toHaveLength(3);

      const pricingCount = counts.find((c) => c.referral_source === "gpt-ops-pricing");
      expect(pricingCount?.count).toBe(2);
    });
  });

  describe("getOrderCountsByPlan", () => {
    it("counts orders grouped by plan", () => {
      const now = Math.floor(Date.now() / 1000);
      const plans = ["engagement", "engagement", "subscription", "concierge"];

      for (let i = 0; i < plans.length; i++) {
        insertPendingOrder({
          order_id: `order-${i}`,
          plan: plans[i],
          amount_usd: 480,
          referral_source: null,
        });
        confirmOrder({
          order_id: `order-${i}`,
          paid_at: now + i,
          status: "paid",
        });
      }

      const counts = getOrderCountsByPlan();
      const engCount = counts.find((c) => c.plan === "engagement");
      expect(engCount?.count).toBe(2);

      const subCount = counts.find((c) => c.plan === "subscription");
      expect(subCount?.count).toBe(1);
    });
  });
});
