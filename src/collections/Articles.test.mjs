import assert from "node:assert/strict";
import test from "node:test";

import { slugifyArticleTitle } from "./Articles.ts";

test("normalizes editorial titles into canonical lowercase slugs", () => {
  assert.equal(slugifyArticleTitle("Café, AI & Security — 2026"), "cafe-ai-security-2026");
});

test("preserves valid custom slug words and normalizes separators", () => {
  assert.equal(slugifyArticleTitle("  Zero Trust__Architecture  "), "zero-trust-architecture");
});

test("caps slugs at 120 characters", () => {
  assert.equal(slugifyArticleTitle("a".repeat(150)).length, 120);
});

test("returns an empty slug for non-string and non-latin-only values", () => {
  assert.equal(slugifyArticleTitle(null), "");
  assert.equal(slugifyArticleTitle(42), "");
  assert.equal(slugifyArticleTitle("東京"), "");
});
