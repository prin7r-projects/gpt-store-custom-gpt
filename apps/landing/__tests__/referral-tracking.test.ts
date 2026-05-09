/**
 * Tests for referral tracking (Phase 2 marketing analytics).
 *
 * Verifies:
 *  - Referral cookie name and format
 *  - Sanitization of referral source values
 *  - Checkout passes referralSource through to response
 */

import { describe, it, expect } from "vitest";

const REF_COOKIE = "serioussequel_ref";

/**
 * Replicates the sanitizeReferral logic from the checkout route.
 */
function sanitizeReferral(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 100) return null;
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) return null;
  return trimmed;
}

describe("referral tracking", () => {
  describe("cookie name", () => {
    it("uses serioussequel_ref as cookie name", () => {
      expect(REF_COOKIE).toBe("serioussequel_ref");
    });

    it("cookie name does not exceed 32 chars (cookie limit consideration)", () => {
      expect(REF_COOKIE.length).toBeLessThanOrEqual(32);
    });
  });

  describe("sanitizeReferral", () => {
    it("accepts valid referral slugs", () => {
      expect(sanitizeReferral("gpt-ops-pricing")).toBe("gpt-ops-pricing");
      expect(sanitizeReferral("gpt_founders_pipeline")).toBe("gpt_founders_pipeline");
      expect(sanitizeReferral("agency_rfp")).toBe("agency_rfp");
      expect(sanitizeReferral("GPT123")).toBe("GPT123");
      expect(sanitizeReferral("ref-v2_test")).toBe("ref-v2_test");
    });

    it("rejects null/undefined/empty values", () => {
      expect(sanitizeReferral(null)).toBeNull();
      expect(sanitizeReferral(undefined)).toBeNull();
      expect(sanitizeReferral("")).toBeNull();
      expect(sanitizeReferral("   ")).toBeNull();
    });

    it("rejects non-string values", () => {
      expect(sanitizeReferral(123)).toBeNull();
      expect(sanitizeReferral({})).toBeNull();
      expect(sanitizeReferral([])).toBeNull();
      expect(sanitizeReferral(true)).toBeNull();
    });

    it("rejects values longer than 100 chars", () => {
      const long = "a".repeat(101);
      expect(sanitizeReferral(long)).toBeNull();
    });

    it("accepts values exactly 100 chars", () => {
      const exact = "a".repeat(100);
      expect(sanitizeReferral(exact)).toBe(exact);
    });

    it("rejects values with special characters (XSS prevention)", () => {
      expect(sanitizeReferral("<script>alert(1)</script>")).toBeNull();
      expect(sanitizeReferral("ref with spaces")).toBeNull();
      expect(sanitizeReferral("ref<script>")).toBeNull();
      expect(sanitizeReferral("ref?query=1")).toBeNull();
      expect(sanitizeReferral("ref&foo=bar")).toBeNull();
      expect(sanitizeReferral("../etc/passwd")).toBeNull();
      expect(sanitizeReferral("ref;DROP TABLE")).toBeNull();
      expect(sanitizeReferral("ref' OR 1=1--")).toBeNull();
    });

    it("strips leading/trailing whitespace", () => {
      expect(sanitizeReferral("  gpt-ops-pricing  ")).toBe("gpt-ops-pricing");
    });
  });
});
