export const site = {
  name: "HEZQEN",
  publisher: "TINLANCE",
  positioning: "Global Technology & Business Intelligence",
  tagline: "Research. Intelligence. Perspective.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://hezqen.tinlance.com",
  description:
    "Evidence-led reporting, original research and technical analysis across AI, cybersecurity, cloud engineering, and business.",
} as const;

export const divisions = [
  {
    slug: "ai-technology",
    number: "01",
    name: "AI & Technology",
    description:
      "The models, products, platforms and technological shifts changing how people work and how industries compete.",
    focus: [
      "Artificial intelligence",
      "Emerging technology",
      "Platforms & products",
      "Research & policy",
    ],
  },
  {
    slug: "cybersecurity",
    number: "02",
    name: "Cybersecurity",
    description:
      "Threat intelligence, security engineering, privacy, resilience and the evolving economics of digital risk.",
    focus: [
      "Threat intelligence",
      "Security engineering",
      "Privacy & governance",
      "Risk & resilience",
    ],
  },
  {
    slug: "cloud-engineering",
    number: "03",
    name: "Cloud & Engineering",
    description:
      "The infrastructure, architectures, developer systems and engineering decisions behind modern software.",
    focus: [
      "Cloud infrastructure",
      "Developer engineering",
      "Open source",
      "Systems & architecture",
    ],
  },
  {
    slug: "business-startups",
    number: "04",
    name: "Business & Startups",
    description:
      "The companies, markets, capital, strategies and operating models shaping the global technology economy.",
    focus: [
      "Company intelligence",
      "Markets & investment",
      "Startup strategy",
      "Technology economics",
    ],
  },
] as const;

export type Division = (typeof divisions)[number];
export function getDivision(slug: string): Division | undefined {
  return divisions.find((division) => division.slug === slug);
}
