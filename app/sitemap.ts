import type { MetadataRoute } from "next";
import { LAB_CALCULATORS } from "../src/domain/labs/calculator-suite.ts";
import { divisions, site } from "../src/lib/site.ts";

const publicStaticRoutes = [
  "",
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
];

export default function sitemap(): MetadataRoute.Sitemap {
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

  // Do not emit lastModified until the content source provides a trustworthy
  // updatedAt value. Build time is not a content modification timestamp.
  return [...staticRoutes, ...divisionRoutes, ...calculatorRoutes];
}
