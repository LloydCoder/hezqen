import assert from "node:assert/strict";
import test from "node:test";

import { LAB_CALCULATORS } from "../domain/labs/calculator-suite.ts";
import sitemap from "../../app/sitemap.ts";

test("sitemap publishes all sixteen public Labs calculator routes", () => {
  const routes = new Set(sitemap().map((entry) => new URL(entry.url).pathname));
  assert.equal(LAB_CALCULATORS.length, 14);
  assert.equal(routes.has("/labs/vram"), true);
  assert.equal(routes.has("/labs/ai-cost"), true);
  assert.ok(routes.has("/labs"));
  for (const calculator of LAB_CALCULATORS) {
    assert.ok(routes.has(`/labs/${calculator.slug}`), `Missing sitemap route: ${calculator.slug}`);
  }
  assert.equal([...routes].filter((route) => route.startsWith("/labs/")).length, 16);
});

test("sitemap includes core publication and infrastructure surfaces", () => {
  const routes = new Set(sitemap().map((entry) => new URL(entry.url).pathname));
  for (const route of ["/", "/about", "/editorial-standards", "/infrastructure"]) {
    assert.ok(routes.has(route), `Missing sitemap route: ${route}`);
  }
});
