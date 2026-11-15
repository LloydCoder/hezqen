type StructuredDataProps = { data: Record<string, unknown> };

export function StructuredData({ data }: StructuredDataProps) {
  const serialized = JSON.stringify(data).replace(/</g, "\\u003c");
  // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from trusted application data and escapes "<" to prevent script termination.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialized }} />;
}

export const publisherGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://hezqen.tinlance.com/#tinlance",
      name: "Tinlance",
      url: "https://tinlance.com"
    },
    {
      "@type": "NewsMediaOrganization",
      "@id": "https://hezqen.tinlance.com/#organization",
      name: "HEZQEN",
      alternateName: "HEZQEN — BY TINLANCE",
      url: "https://hezqen.tinlance.com",
      description: "Global technology and business intelligence publication covering AI, cybersecurity, cloud engineering, and business.",
      slogan: "Research. Intelligence. Perspective.",
      parentOrganization: { "@id": "https://hezqen.tinlance.com/#tinlance" },
      logo: {
        "@type": "ImageObject",
        "@id": "https://hezqen.tinlance.com/#logo",
        url: "https://hezqen.tinlance.com/brand/hezqen-horizontal-color.svg",
        contentUrl: "https://hezqen.tinlance.com/brand/hezqen-horizontal-color.svg"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://hezqen.tinlance.com/#website",
      url: "https://hezqen.tinlance.com",
      name: "HEZQEN",
      publisher: { "@id": "https://hezqen.tinlance.com/#organization" },
      inLanguage: "en"
    }
  ]
} satisfies Record<string, unknown>;
