import type { MetadataRoute } from "next";

import { LAB_CALCULATORS } from "../src/domain/labs/calculator-suite.ts";
import type { PublicArticle } from "../src/lib/public-articles.ts";
import { divisions, site } from "../src/lib/site.ts";

export const dynamic = "force-dynamic";

const publicStaticRoutes = [
  "",
  "/about",
  "/contact",
  "/corrections",
  "/editorial-standards",
  "/research-methodology",
  "/authors",
  "/commercial-disclosure",
  "/privacy",
  "/cookies",
  "/terms",
  "/security",
  "/sitemap",
  "/labs",
  "/labs/methodology",
  "/infrastructure",
];

// Give readers direct, crawlable paths to the publication's governance and methodology.
const editorialTrustRoutes = new Set([
  "/about",
  "/corrections",
  "/editorial-standards",
  "/research-methodology",
  "/authors",
  "/commercial-disclosure",
  "/labs/methodology",
]);

function getRoutePriority(route: string): number {
  if (route === "") return 1;
  if (route === "/labs") return 0.8;
  if (editorialTrustRoutes.has(route)) return 0.7;
  return 0.6;
}

export function createSitemap(articles: PublicArticle[] = []): MetadataRoute.Sitemap {
  const staticRoutes = publicStaticRoutes.map((route) => ({
    url: `${site.url}${route}`,
    changeFrequency: "monthly" as const,
    priority: getRoutePriority(route),
  }));

  const divisionRoutes = divisions.map((division) => ({
    url: `${site.url}/divisions/${division.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const calculatorSlugs = [
    "vram",
    "ai-cost",
    ...LAB_CALCULATORS.map((calculator) => calculator.slug),
  ];
  const calculatorRoutes = [...new Set(calculatorSlugs)].map((slug) => ({
    url: `${site.url}/labs/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  const articleRoutes = articles.map((article) => ({
    url: `${site.url}/articles/${article.slug}`,
    lastModified: new Date(article.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...divisionRoutes, ...calculatorRoutes, ...articleRoutes];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { findPublicArticles } = await import("../src/lib/public-content.ts");
  const articles = await findPublicArticles({ limit: 50 });
  return createSitemap(articles);
}
