import type { MetadataRoute } from "next";
import { LAB_CALCULATORS } from "../src/domain/labs/calculator-suite";
import { divisions, site } from "../src/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/about", "/editorial-standards", "/labs", "/infrastructure"].map(
    (route) => ({
      url: `${site.url}${route}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: route === "" ? 1 : route === "/labs" ? 0.8 : 0.6,
    }),
  );
  const divisionRoutes = divisions.map((division) => ({
    url: `${site.url}/divisions/${division.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
  const calculatorRoutes = LAB_CALCULATORS.map((calculator) => ({
    url: `${site.url}/labs/${calculator.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));
  return [...staticRoutes, ...divisionRoutes, ...calculatorRoutes];
}
