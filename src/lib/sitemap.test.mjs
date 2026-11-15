import assert from "node:assert/strict";
import test from "node:test";

import { LAB_CALCULATORS } from "../domain/labs/calculator-suite.ts";
import { createSitemap } from "../../app/sitemap.ts";
import type { PublicArticle } from "./public-articles.ts";

test("sitemap publishes all sixteen public Labs calculator routes", () => {
  const routes = new Set(createSitemap().map((entry) => new URL(entry.url).pathname));
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
  const routes = new Set(createSitemap().map((entry) => new URL(entry.url).pathname));
  for (const route of [
    "/",
    "/about",
    "/contact",
    "/corrections",
    "/editorial-standards",
    "/privacy",
    "/cookies",
    "/terms",
    "/security",
    "/sitemap",
    "/labs",
    "/infrastructure",
  ]) {
    assert.ok(routes.has(route), `Missing sitemap route: ${route}`);
  }
});

test("sitemap includes only supplied published article projections with content timestamps", () => {
  const article = {
    id: "article-1",
    title: "A verified report",
    slug: "verified-report",
    excerpt: "Evidence-led reporting.",
    division: "ai-technology",
    body: null,
    authorName: null,
    publishedAt: "2026-11-15T08:00:00.000Z",
    updatedAt: "2026-11-16T08:00:00.000Z",
    correctionNotice: null,
  } satisfies PublicArticle;
  const entry = createSitemap([article]).find((item) => item.url.endsWith("/articles/verified-report"));
  assert.ok(entry);
  assert.equal(entry?.lastModified?.toISOString(), "2026-11-16T08:00:00.000Z");
});
