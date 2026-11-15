import type { MetadataRoute } from "next";
import { divisions, site } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/about", "/editorial-standards", "/infrastructure"].map((route) => ({
    url: `${site.url}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.6,
  }));
  const divisionRoutes = divisions.map((division) => ({
    url: `${site.url}/divisions/${division.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
  return [...staticRoutes, ...divisionRoutes];
}
