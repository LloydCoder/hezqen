import type { Metadata } from "next";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Research Methodology",
  description:
    "How HEZQEN discovers sources, verifies claims, preserves research context and reports technical findings.",
  alternates: { canonical: "/research-methodology" },
};

export default function ResearchMethodologyPage() {
  return (
    <section className="prose-page">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "HEZQEN Research Methodology",
          url: "https://hezqen.tinlance.com/research-methodology",
          isPartOf: { "@id": "https://hezqen.tinlance.com/#website" },
          about: { "@id": "https://hezqen.tinlance.com/#organization" },
        }}
      />
      <div className="container prose-container">
        <p className="eyebrow">
          <span className="eyebrow-line" /> RESEARCH GOVERNANCE / 003
        </p>
        <h1>
          Research that can be <em>examined.</em>
        </h1>
        <p className="prose-lede">
          HEZQEN explains not only what we conclude, but how we reached the conclusion, what
          evidence supports it and where uncertainty remains.
        </p>
        <div className="prose-rule" />
        <h2>Our research process</h2>
        <ol>
          <li>
            <strong>Define the question.</strong> State the decision, claim or technical problem
            being examined, its scope and the limits of the assignment.
          </li>
          <li>
            <strong>Find original sources.</strong> Prefer primary records, research papers,
            standards, regulatory material, source repositories, technical documentation, datasets
            and direct interviews.
          </li>
          <li>
            <strong>Preserve context.</strong> Record source identity, publication date, retrieval
            date, relevant versions and evidence references where lawful.
          </li>
          <li>
            <strong>Break down material claims.</strong> Separate factual assertions, attributed
            statements, estimates, analysis and opinion.
          </li>
          <li>
            <strong>Verify and corroborate.</strong> Check the original context, methodology,
            incentives, recency and independent corroboration. A citation alone does not prove a
            claim.
          </li>
          <li>
            <strong>Reproduce technical work.</strong> Record code, configuration, hardware,
            software versions, workload, units, repetitions and measurement limitations when an
            experiment is performed.
          </li>
          <li>
            <strong>Review and approve.</strong> An accountable human author, independent reviewer
            where appropriate, fact-checker and authorized editor assess the work before
            publication.
          </li>
          <li>
            <strong>Monitor and correct.</strong> Revisit material claims when sources change or
            credible corrections are received.
          </li>
        </ol>
        <h2>Source hierarchy</h2>
        <p>
          We generally prioritize original datasets and research, official documentation, standards,
          regulatory filings, court records, security advisories, source-code repositories, direct
          statements and interviews. Reputable secondary reporting is useful for context and
          corroboration. Repetition across outlets is not independent confirmation when those
          outlets rely on the same original source.
        </p>
        <h2>Technical tests and benchmarks</h2>
        <p>
          Research reports distinguish measured observations from calculations, estimates, forecasts
          and vendor claims. Where practical, we disclose the environment, hardware, software and
          model versions, workload, baseline, measurement method, repetitions, units, uncertainty
          and exclusions. We do not describe a theoretical calculation as an empirical benchmark.
        </p>
        <h2>Claims, evidence and uncertainty</h2>
        <p>
          Material claims should be traceable to identifiable sources and supporting evidence. We
          explain when evidence is incomplete, disputed, unavailable or not independently verified.
          We do not invent sources, quotations, interviews, datasets, tests or results. Sensitive
          evidence and confidential sources receive appropriate access and safety controls.
        </p>
        <h2>AI-assisted research</h2>
        <p>
          AI tools may assist discovery, extraction, transcription, translation, data organization,
          coding, comparison and drafting. Human staff remain responsible for verifying source
          context, material facts, quotations, calculations and conclusions. AI output and retrieved
          content are treated as untrusted inputs; neither can authorize publication. AI cannot
          independently approve or publish editorial work.
        </p>
        <h2>Limitations and corrections</h2>
        <p>
          Research is bounded by the sources, access, methods and time available. We disclose
          material limitations rather than implying certainty. Readers can report factual concerns
          through our <a href="/corrections">corrections process</a>. Confirmed material errors
          receive a dated, visible correction.
        </p>
        <p>
          This methodology applies across AI &amp; Technology, Cybersecurity, Cloud &amp; Engineering,
          and Business &amp; Startups. It is read together with our
          <a href="/editorial-standards"> Editorial Standards</a> and
          <a href="/commercial-disclosure"> Commercial Disclosure</a>.
        </p>
      </div>
    </section>
  );
}
