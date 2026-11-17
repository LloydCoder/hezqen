import assert from "node:assert/strict";
import test from "node:test";

import {
  canSendConfirmation,
  createConfirmationToken,
  createUnsubscribeToken,
  hashConfirmationToken,
  NEWSLETTER_CONFIRMATION_TTL_MS,
  normalizeNewsletterEmail,
  normalizeNewsletterSignupSource,
  verifyUnsubscribeToken,
} from "./consent.ts";

const secret = "hezqen-test-secret-that-is-at-least-32-characters-long";

test("normalizes valid newsletter email addresses and rejects malformed values", () => {
  assert.equal(normalizeNewsletterEmail(" Reader@Example.com "), "reader@example.com");
  assert.equal(normalizeNewsletterEmail("not-an-email"), null);
  assert.equal(normalizeNewsletterEmail("reader..name@example.com"), null);
  assert.equal(normalizeNewsletterEmail("reader@example.com".padEnd(255, "x")), null);
  assert.equal(normalizeNewsletterEmail(null), null);
});

test("normalizes signup source to the allowlisted set", () => {
  assert.equal(normalizeNewsletterSignupSource("labs"), "labs");
  assert.equal(normalizeNewsletterSignupSource("article"), "article");
  assert.equal(normalizeNewsletterSignupSource("admin"), "unknown");
  assert.equal(normalizeNewsletterSignupSource(null), "unknown");
});

test("creates a cryptographically random confirmation token with a hashed record value", () => {
  const token = createConfirmationToken(1_000);
  assert.equal(token.token.length > 32, true);
  assert.equal(token.tokenHash, hashConfirmationToken(token.token));
  assert.equal(token.expiresAt, new Date(1_000 + NEWSLETTER_CONFIRMATION_TTL_MS).toISOString());
  assert.notEqual(token.token, token.tokenHash);
});

test("enforces confirmation resend cooldown and daily limit", () => {
  const now = Date.parse("2026-11-17T12:00:00.000Z");
  assert.equal(canSendConfirmation(0, null, null, now), true);
  assert.equal(canSendConfirmation(1, "2026-11-17T11:00:00.000Z", "2026-11-17T11:50:00.000Z", now), false);
  assert.equal(canSendConfirmation(1, "2026-11-17T11:00:00.000Z", "2026-11-17T11:44:00.000Z", now), true);
  assert.equal(canSendConfirmation(3, "2026-11-17T10:00:00.000Z", "2026-11-17T10:00:00.000Z", now), false);
  assert.equal(canSendConfirmation(3, "2026-11-17T10:00:00.000Z", "2026-11-17T10:00:00.000Z", now + 25 * 60 * 60 * 1000), true);
  assert.equal(canSendConfirmation(-1, null, null, now), false);
});

test("signs and verifies an unsubscribe token bound to subscriber and confirmation time", () => {
  const confirmedAt = "2026-11-17T10:00:00.000Z";
  const token = createUnsubscribeToken("subscriber-123", confirmedAt, secret);
  assert.deepEqual(verifyUnsubscribeToken(token, secret), {
    subscriberId: "subscriber-123",
    confirmedAt,
  });
  assert.equal(verifyUnsubscribeToken(token + "x", secret), null);
  assert.equal(verifyUnsubscribeToken(token, "wrong-secret-that-is-at-least-32-characters"), null);
  assert.equal(verifyUnsubscribeToken("not-a-token", secret), null);
  assert.throws(() => createUnsubscribeToken("subscriber-123", confirmedAt, "short"), /secret/);
});
