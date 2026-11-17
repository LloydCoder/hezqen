import type { Metadata } from "next";
import Link from "next/link";

import { ArchitectureReviewForm } from "@/components/ArchitectureReviewForm";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Request an Architecture Review | HEZQEN",
  description:
    "Request a Tinlance architecture review for AI infrastructure, GPU sizing, cloud architecture, cybersecurity and production AI systems.",
  alternates: { canonical: "/architecture-review" },
};

type ArchitectureReviewPageProps = {
  searchParams: Promise<{ source?: string; calculator?: string }>;
};

function normalizeSource(value: string | undefined): "article" | "labs" | "contact" | "unknown" {
  return value === "article" || value === "labs" || value === "contact" ? value : "unknown";
}

export default async function ArchitectureReviewPage({
  searchParams,
}: ArchitectureReviewPageProps) {
  const params = await searchParams;
  const calculator = (params.calculator ?? "").trim().slice(0, 120);

  return (
    <section className="prose-page">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Request an Architecture Review",
          url: "https://hezqen.tinlance.com/architecture-review",
          isPartOf: { "@id": "https://hezqen.tinlance.com/#website" },
          about: { "@id": "https://hezqen.tinlance.com/#organization" },
        }}
      />
      <div className="container prose-container architecture-review-page">
        <p className="eyebrow">
          <span className="eyebrow-line" /> TINLANCE / ARCHITECTURE REVIEW
        </p>
        <h1>
          Make the next <em>infrastructure decision</em> with evidence.
        </h1>
        <p className="prose-lede">
          Tell us what you are building or securing. The Tinlance team can review GPU requirements,
          model deployment, inference economics, cloud architecture and security constraints.
        </p>
        {calculator ? (
          <p className="architecture-review-context">
            Calculator context: <strong>{calculator}</strong>
          </p>
        ) : null}
        <div className="prose-rule" />
        <ArchitectureReviewForm source={normalizeSource(params.source)} calculator={calculator} />
        <p className="prose-signoff">
          <Link href="/labs">Return to HEZQEN Labs</Link>
        </p>
      </div>
    </section>
  );
}
