import assert from "node:assert/strict";
import test from "node:test";

import { parseLead } from "./architecture-review-endpoints.ts";

const valid = {
  name: "Ada Lovelace",
  email: "ADA@EXAMPLE.COM",
  company: "Analytical Engines",
  role: "CTO",
  projectType: "ai-infrastructure",
  challenge: "We need to reduce inference costs and improve GPU utilization.",
  budgetRange: "5000-15000",
  timeline: "1-3-months",
  source: "labs",
  calculator: "vram-estimator",
  contactConsent: true,
};

test("accepts and normalizes a valid architecture-review request", () => {
  assert.deepEqual(parseLead(valid), {
    name: "Ada Lovelace",
    email: "ada@example.com",
    company: "Analytical Engines",
    role: "CTO",
    projectType: "ai-infrastructure",
    challenge: "We need to reduce inference costs and improve GPU utilization.",
    budgetRange: "5000-15000",
    timeline: "1-3-months",
    source: "labs",
    calculatorContext: "vram-estimator",
  });
});

test("rejects missing consent and malformed email", () => {
  assert.equal(parseLead({ ...valid, contactConsent: false }), null);
  assert.equal(parseLead({ ...valid, email: "not-an-email" }), null);
});

test("rejects unsupported enum values and oversized input", () => {
  assert.equal(parseLead({ ...valid, projectType: "admin" }), null);
  assert.equal(parseLead({ ...valid, timeline: "tomorrow" }), null);
  assert.equal(parseLead({ ...valid, challenge: "x".repeat(2001) }), null);
  assert.equal(parseLead({ ...valid, calculator: "x".repeat(121) }), null);
});

test("rejects non-object payloads", () => {
  assert.equal(parseLead(null), null);
});
