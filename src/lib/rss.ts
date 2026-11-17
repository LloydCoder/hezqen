import type { PublicArticle } from "./public-articles.ts";

const DIVISION_LABELS: Record<PublicArticle["division"], string> = {
  "ai-technology": "AI & Technology",
  cybersecurity: "Cybersecurity",
  "cloud-engineering": "Cloud & Engineering",
  "business-startups": "Business & Startups",
};

function removeInvalidXmlCharacters(value: string): string {
  return Array.from(value)
    .filter((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return (
        codePoint === 0x09 ||
        codePoint === 0x0a ||
        codePoint === 0x0d ||
        (codePoint >= 0x20 && codePoint <= 0xd7ff) ||
        (codePoint >= 0xe000 && codePoint <= 0xfffd) ||
        (codePoint >= 0x10000 && codePoint <= 0x10ffff)
      );
    })
    .join("");
}

function escapeXml(value: string): string {
  return removeInvalidXmlCharacters(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toHttpBaseUrl(value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new TypeError("siteUrl must be a valid absolute HTTP URL.");
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new TypeError("siteUrl must be a valid absolute HTTP URL.");
  }
  url.search = "";
  url.hash = "";
  url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  return url;
}

function articleUrl(base: URL, slug: string): string {
  const normalizedSlug = encodeURIComponent(slug);
  return new URL(
    `articles/${normalizedSlug}`,
    base.href.endsWith("/") ? base : new URL(`${base.href}/`),
  ).toString();
}

export function createRssFeed(articles: readonly PublicArticle[], siteUrl: string): string {
  const base = toHttpBaseUrl(siteUrl);
  const canonicalRoot = base.href.endsWith("/") ? base.href : `${base.href}/`;
  const feedUrl = new URL("feed.xml", canonicalRoot).toString();
  const latestUpdate = articles.reduce<number | null>((latest, article) => {
    const timestamp = Date.parse(article.updatedAt);
    return Number.isFinite(timestamp) && (latest === null || timestamp > latest)
      ? timestamp
      : latest;
  }, null);

  const items = articles.map((article) => {
    const link = articleUrl(base, article.slug);
    const correction = article.correctionNotice
      ? ` Correction: ${article.correctionNotice.note}`
      : "";
    const description = `${article.excerpt}${correction}`.trim();
    const publishedAt = new Date(article.publishedAt);
    const updatedAt = new Date(article.updatedAt);
    if (Number.isNaN(publishedAt.getTime()) || Number.isNaN(updatedAt.getTime())) {
      throw new TypeError(`Article ${article.slug} has an invalid publication date.`);
    }

    return [
      "    <item>",
      `      <title>${escapeXml(article.title)}</title>`,
      `      <link>${escapeXml(link)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
      `      <description>${escapeXml(description)}</description>`,
      `      <dc:creator>${escapeXml(article.authorName ?? "HEZQEN Editorial Desk")}</dc:creator>`,
      `      <category>${escapeXml(DIVISION_LABELS[article.division])}</category>`,
      `      <pubDate>${publishedAt.toUTCString()}</pubDate>`,
      `      <atom:updated>${updatedAt.toISOString()}</atom:updated>`,
      "    </item>",
    ].join("\n");
  });

  const lastBuildDate =
    latestUpdate === null
      ? ""
      : `\n    <lastBuildDate>${new Date(latestUpdate).toUTCString()}</lastBuildDate>`;

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "  <channel>",
    "    <title>HEZQEN — Global Technology &amp; Business Intelligence</title>",
    `    <link>${escapeXml(canonicalRoot)}</link>`,
    "    <description>Research. Intelligence. Perspective.</description>",
    "    <language>en</language>",
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />${lastBuildDate}`,
    items.join("\n"),
    "  </channel>",
    "</rss>",
  ]
    .filter(Boolean)
    .join("\n");
}
