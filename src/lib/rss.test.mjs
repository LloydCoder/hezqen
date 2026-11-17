import assert from "node:assert/strict";
import test from "node:test";
import { createRssFeed } from "./rss.ts";

const article = {
  id: "article-1",
  title: "GPU & AI <in practice>",
  slug: "gpu-ai-in-practice",
  excerpt: "A tested guide to memory, context & deployment.",
  division: "ai-technology",
  body: null,
  authorName: "Research Desk",
  publishedAt: "2026-11-16T10:00:00.000Z",
  updatedAt: "2026-11-16T11:00:00.000Z",
  correctionNotice: null,
  correctionHistory: [],
};

test("creates a valid RSS channel with canonical article links and dates", () => {
  const feed = createRssFeed([article], "https://hezqen.tinlance.com");

  assert.match(feed, /<rss version="2\.0"/);
  assert.match(feed, /<title>HEZQEN — Global Technology &amp; Business Intelligence<\/title>/);
  assert.match(feed, /<link>https:\/\/hezqen\.tinlance\.com<\/link>/);
  assert.match(feed, /<title>GPU &amp; AI &lt;in practice&gt;<\/title>/);
  assert.match(feed, /<link>https:\/\/hezqen\.tinlance\.com\/articles\/gpu-ai-in-practice<\/link>/);
  assert.match(
    feed,
    /<guid isPermaLink="true">https:\/\/hezqen\.tinlance\.com\/articles\/gpu-ai-in-practice<\/guid>/,
  );
  assert.match(feed, /<dc:creator>Research Desk<\/dc:creator>/);
  assert.match(feed, /<category>AI &amp; Technology<\/category>/);
  assert.match(feed, /<pubDate>Mon, 16 Nov 2026 10:00:00 GMT<\/pubDate>/);
});

test("escapes XML-sensitive characters in channel and item text", () => {
  const feed = createRssFeed(
    [{ ...article, title: 'A & B "quoted"', excerpt: "5 < 7 & 8 > 3" }],
    "https://hezqen.tinlance.com",
  );

  assert.match(feed, /A &amp; B &quot;quoted&quot;/);
  assert.match(feed, /5 &lt; 7 &amp; 8 &gt; 3/);
});

test("emits a valid empty feed without inventing article entries", () => {
  const feed = createRssFeed([], "https://hezqen.tinlance.com");

  assert.match(feed, /<channel>/);
  assert.match(feed, /<title>HEZQEN — Global Technology &amp; Business Intelligence<\/title>/);
  assert.doesNotMatch(feed, /<item>/);
});

test("rejects invalid canonical site URLs", () => {
  assert.throws(() => createRssFeed([], "not a URL"), /valid absolute HTTP/);
});
