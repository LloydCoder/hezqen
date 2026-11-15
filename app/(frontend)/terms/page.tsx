import type { Metadata } from "next";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms and limitations for using HEZQEN's public website, editorial content and engineering calculators.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <section className="prose-page">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "HEZQEN Terms of Use",
          url: "https://hezqen.tinlance.com/terms",
          isPartOf: { "@id": "https://hezqen.tinlance.com/#website" },
          about: { "@id": "https://hezqen.tinlance.com/#organization" },
        }}
      />
      <div className="container prose-container">
        <p className="eyebrow">
          <span className="eyebrow-line" /> TERMS / USE
        </p>
        <h1>
          Use the work <em>responsibly.</em>
        </h1>
        <p className="prose-lede">
          These initial terms describe basic expectations for visitors using the public HEZQEN
          website.
        </p>
        <div className="prose-rule" />
        <h2>Editorial information</h2>
        <p>
          HEZQEN publishes reporting, research and analysis for general informational purposes.
          Publication does not create a professional, advisory, fiduciary or client relationship.
        </p>
        <h2>Calculators and tools</h2>
        <p>
          Calculator outputs are estimates based on user inputs and disclosed assumptions. They are
          not provider quotes, guarantees, security assessments, legal advice, investment advice or
          a substitute for independent engineering validation. Verify material decisions against
          current primary documentation and your own environment.
        </p>
        <h2>Acceptable use</h2>
        <p>
          Do not disrupt the website, attempt unauthorized access, bypass access controls, submit
          malicious content, or use the service in a way that violates applicable law or the rights
          of others.
        </p>
        <h2>Third-party resources</h2>
        <p>
          Links to external sites are provided for reference. HEZQEN does not control their content,
          availability, security or privacy practices.
        </p>
        <h2>Intellectual property and open materials</h2>
        <p>
          Unless a page or linked repository states otherwise, HEZQEN editorial content and branding
          are not granted for unrestricted commercial reuse. Separate open-source repositories
          remain governed by their own license files.
        </p>
        <h2>Contact and legal review</h2>
        <p>
          Questions may be sent to <a href="mailto:hello@tinlance.com">hello@tinlance.com</a>. These
          initial terms require review and completion by Tinlance legal counsel before production
          launch, including governing law, limitation of liability, dispute resolution and any
          product-specific terms.
        </p>
      </div>
    </section>
  );
}
