/**
 * Tests for verifyNowpaymentsIpn (docs/12 §6 threat 1: forged IPN).
 *
 * Golden-case signatures computed with HMAC-SHA512 over
 * JSON.stringify(sortObject(payload)) using secret "test_ipn_secret_key_v1".
 */

import { describe, it, expect } from "vitest";
import { verifyNowpaymentsIpn } from "@/lib/nowpayments";

const SECRET = "test_ipn_secret_key_v1";

const GOLDEN_PAYLOAD_1 = {
  order_id: "test_engagement_123",
  payment_status: "finished",
  price_amount: 480,
  price_currency: "usd",
};

const GOLDEN_SIG_1 =
  "7b5f463a98cfca128ff42d619dc616199bbff396862e829f6d1d008a8a0931f5d6f9cae05c3bd8952b5ada653e516aca0b2d3ab94ac469f6d60070fddeeefe47";

const GOLDEN_PAYLOAD_2 = {
  order_id: "test_engagement_456",
  payment_status: "confirmed",
  price_amount: 690,
};

const GOLDEN_SIG_2 =
  "ee7da2e4d1486f6ed27fdd22e259c91949d6df96459c63f17fd97c86c7517d65fb6437952ef58999b8ae04157b2642c1fa997f641ef6ab25caeaf299e7f0faff";

describe("verifyNowpaymentsIpn", () => {
  // Positive cases
  it("verifies a valid golden signature (payload 1)", () => {
    expect(verifyNowpaymentsIpn(GOLDEN_PAYLOAD_1, GOLDEN_SIG_1, SECRET)).toBe(true);
  });

  it("verifies a valid golden signature (payload 2)", () => {
    expect(verifyNowpaymentsIpn(GOLDEN_PAYLOAD_2, GOLDEN_SIG_2, SECRET)).toBe(true);
  });

  it("verifies payload with nested objects (keys sorted)", () => {
    const payload = {
      zebra: "last",
      apple: "first",
      nested: { b: 2, a: 1 },
    };
    // Compute expected signature
    const crypto = require("node:crypto");
    const sorted = JSON.stringify({
      apple: "first",
      nested: { a: 1, b: 2 },
      zebra: "last",
    });
    const sig = crypto.createHmac("sha512", SECRET).update(sorted).digest("hex");
    expect(verifyNowpaymentsIpn(payload, sig, SECRET)).toBe(true);
  });

  // Negative cases — forged signatures
  it("rejects a tampered signature (one hex char flipped)", () => {
    const tampered = GOLDEN_SIG_1.replace(/^7/, "a");
    expect(verifyNowpaymentsIpn(GOLDEN_PAYLOAD_1, tampered, SECRET)).toBe(false);
  });

  it("rejects a completely wrong signature", () => {
    const wrongSig =
      "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
    expect(verifyNowpaymentsIpn(GOLDEN_PAYLOAD_1, wrongSig, SECRET)).toBe(false);
  });

  it("rejects null/missing signature header", () => {
    expect(verifyNowpaymentsIpn(GOLDEN_PAYLOAD_1, null, SECRET)).toBe(false);
  });

  it("rejects an undefined signature", () => {
    expect(verifyNowpaymentsIpn(GOLDEN_PAYLOAD_1, undefined as unknown as null, SECRET)).toBe(false);
  });

  it("rejects when wrong secret is used", () => {
    expect(verifyNowpaymentsIpn(GOLDEN_PAYLOAD_1, GOLDEN_SIG_1, "wrong_secret_key")).toBe(false);
  });

  it("rejects empty payload with valid-looking signature", () => {
    expect(verifyNowpaymentsIpn({}, GOLDEN_SIG_1, SECRET)).toBe(false);
  });

  // Replay attack detection (same sig, different content)
  it("rejects signature computed for a different payload (replay)", () => {
    // GOLDEN_SIG_1 is for payload 1, should NOT verify against payload 2
    expect(verifyNowpaymentsIpn(GOLDEN_PAYLOAD_2, GOLDEN_SIG_1, SECRET)).toBe(false);
  });

  // Timing safety: constant-time compare for equal-length but wrong hex
  it("uses constant-time compare (equal length wrong hex rejected)", () => {
    const sameLenWrongSig = GOLDEN_SIG_1.replace(/[0-9a-f]/g, "0");
    expect(sameLenWrongSig.length).toBe(GOLDEN_SIG_1.length);
    expect(verifyNowpaymentsIpn(GOLDEN_PAYLOAD_1, sameLenWrongSig, SECRET)).toBe(false);
  });

  // Whitespace tolerance on signature
  it("trims whitespace from signature header", () => {
    expect(verifyNowpaymentsIpn(GOLDEN_PAYLOAD_1, `  ${GOLDEN_SIG_1}  `, SECRET)).toBe(true);
  });
});
