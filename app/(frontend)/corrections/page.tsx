import type { Metadata } from "next";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Corrections Policy",
  description:
    "How HEZQEN reviews factual concerns, corrects material errors and records changes to published work.",
  alternates: { canonical: "/corrections" },
};

export default function CorrectionsPage() {
  return (
    <section className="prose-page">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "HEZQEN Corrections Policy",
          url: "https://hezqen.tinlance.com/corrections",
          isPartOf: { "@id": "https://hezqen.tinlance.com/#website" },
          about: { "@id": "https://hezqen.tinlance.com/#organization" },
        }}
      />
      <div className="container prose-container">
        <p className="eyebrow">
          <span className="eyebrow-line" /> EDITORIAL ACCOUNTABILITY / 002
        </p>
        <h1>
          Corrections with <em>transparency.</em>
        </h1>
        <p className="prose-lede">
          Accuracy is an ongoing responsibility. When published work contains a material error, we
          aim to correct it clearly and preserve an accountable record of the change.
        </p>
        <div className="prose-rule" />
        <h2>How to report a concern</h2>
        <p>
          Email <a href="mailto:hello@tinlance.com">hello@tinlance.com</a> with the page or article
          URL, the passage in question, an explanation of the issue and links or documents supporting
          the concern.
        </p>
        <h2>How we review reports</h2>
        <p>
          An editor assesses the evidence, checks the original source context and determines whether
          a correction, clarification, update or no change is warranted. A report does not
          automatically establish that an error occurred.
        </p>
        <h2>How corrections are displayed</h2>
        <p>
          Where a material factual error is confirmed, the published item should carry a dated
          correction note describing what changed. Updates that add new information without
          correcting an error should be distinguished from corrections.
        </p>
        <h2>Editorial independence</h2>
        <p>
          Correction decisions are editorial decisions. Commercial relationships, source preferences
          and automated system outputs do not determine the outcome.
        </p>
      </div>
    </section>
  );
}
