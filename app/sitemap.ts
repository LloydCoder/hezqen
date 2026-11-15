import type { MetadataRoute } from "next";
import { LAB_CALCULATORS } from "../src/domain/labs/calculator-suite.ts";
import { getPublicArticlesForSitemap } from "../src/lib/public-articles.ts";
import { divisions, site } from "../src/lib/site.ts";

const publicStaticRoutes = [
  "",
  "/about",
  "/contact",
  "/articles",
  "/corrections",
  "/editorial-standards",
  "/privacy",
  "/cookies",
  "/terms",
  "/security",
  "/sitemap",
  "/labs",
  "/infrastructure",
];

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (process.env.VERCEL_ENV === "preview") return [];

  const staticRoutes = publicStaticRoutes.map((route) => ({
    url: `${site.url}${route}`,
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : route === "/labs" ? 0.8 : 0.6,
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

  const articles = await getPublicArticlesForSitemap();
  const articleRoutes = articles.map((article) => ({
    url: `${site.url}/articles/${article.slug}`,
    lastModified: article.updatedAt ?? article.publishedAt ?? undefined,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Only use content-system timestamps. Build time is not a modification date.
  return [...staticRoutes, ...divisionRoutes, ...calculatorRoutes, ...articleRoutes];
}
