import type { Metadata } from "next";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Security & Responsible Disclosure",
  description:
    "Security contact and responsible vulnerability disclosure information for HEZQEN, published by Tinlance.",
  alternates: { canonical: "/security" },
};

export default function SecurityPage() {
  return (
    <section className="prose-page">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "HEZQEN Security",
          url: "https://hezqen.tinlance.com/security",
          isPartOf: { "@id": "https://hezqen.tinlance.com/#website" },
          about: { "@id": "https://hezqen.tinlance.com/#organization" },
        }}
      />
      <div className="container prose-container">
        <p className="eyebrow">
          <span className="eyebrow-line" /> SECURITY / TRUST
        </p>
        <h1>
          Security is an <em>operating discipline.</em>
        </h1>
        <p className="prose-lede">
          HEZQEN is developed and operated by Tinlance. We treat application security, access
          control, evidence integrity and responsible disclosure as ongoing engineering
          responsibilities.
        </p>
        <div className="prose-rule" />
        <h2>Report a vulnerability</h2>
        <p>
          Send a concise report to <a href="mailto:hello@tinlance.com">hello@tinlance.com</a> with the
          affected URL, a description of the issue, its potential impact and safe reproduction steps.
          Do not access, modify, delete or retain data that does not belong to you.
        </p>
        <h2>Safe testing</h2>
        <p>
          Do not perform denial-of-service testing, social engineering, credential attacks,
          destructive testing or tests against third-party services. Stop if you encounter personal
          data or confidential information and include only the minimum evidence needed to explain
          the issue.
        </p>
        <h2>Scope and status</h2>
        <p>
          This page provides a reporting channel; it is not a bug-bounty offer, a service-level
          commitment or a claim that an independent security assessment has been completed. Current
          release and security limitations are documented in the public{" "}
          <a href="https://github.com/LloydCoder/hezqen" target="_blank" rel="noopener noreferrer">
            HEZQEN repository
          </a>
          .
        </p>
      </div>
    </section>
  );
}
