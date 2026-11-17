import type { Metadata } from "next";

import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Research Methodology",
  description:
    "How HEZQEN frames research questions, evaluates sources, verifies claims, conducts technical analysis and reports uncertainty.",
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
          <span className="eyebrow-line" /> RESEARCH / METHODOLOGY
        </p>
        <h1>
          How we establish <em>what is true.</em>
        </h1>
        <p className="prose-lede">
          HEZQEN separates evidence from assertion, measurement from estimate, and analysis from
          opinion. This methodology explains the standards we apply across reporting, investigations,
          technical research and HEZQEN Labs.
        </p>
        <div className="prose-rule" />
        <h2>1. Start with a testable question</h2>
        <p>
          Each substantial assignment begins with a defined question, scope, intended reader and
          explanation of the original value it will add. We identify what would support or weaken
          the working hypothesis, what evidence is available, what cannot be established and which
          decisions the work may influence. A commissioning brief is not evidence and does not
          predetermine the conclusion.
        </p>
        <h2>2. Evaluate sources in context</h2>
        <p>
          We prioritize primary material: original research, standards, official documentation,
          regulatory filings, court records, security advisories, source repositories, product
          specifications, datasets, direct interviews and first-party disclosures. Independent
          secondary reporting can add context and corroboration. Repetition across publications
          that rely on the same original source is not independent confirmation.
        </p>
        <p>
          Editors assess a source's authority, proximity to the facts, methodology, publication
          date, incentives, independence, completeness and known limitations. We record stable
          URLs, source titles, publishers, publication dates and access dates where relevant.
          Material documents, excerpts, configuration files and datasets are preserved as evidence
          where lawful and proportionate.
        </p>
        <h2>3. Connect claims to evidence</h2>
        <p>
          Material claims are broken into verifiable propositions and linked to the evidence that
          supports, qualifies or contradicts them. A citation is a route to evidence, not proof by
          itself. We distinguish direct observation, independently verified fact, attributed
          statement, vendor claim, calculation, estimate, forecast, interpretation and opinion.
          Where evidence is disputed, incomplete, inaccessible or not independently verified, we
          say so.
        </p>
        <p>
          Consequential allegations receive heightened scrutiny. We seek corroboration, preserve
          relevant context and give affected parties a fair opportunity to respond before
          publication where appropriate. We do not fabricate sources, quotations, interviews,
          screenshots, test results, datasets or expert endorsements.
        </p>
        <h2>4. Make technical work reproducible</h2>
        <p>
          Technical analysis should disclose enough information for a competent reader to understand
          the method and, where practical, reproduce it. Depending on the work, this includes
          hardware, model and software versions, configuration, workload, dataset provenance,
          baseline, measurement method, repetitions, units, environment, uncertainty, exclusions
          and relevant limitations. We distinguish observed results from vendor specifications,
          theoretical calculations and simulations.
        </p>
        <p>
          Calculator outputs are deterministic estimates under stated assumptions, not hardware
          benchmarks or deployment guarantees. Formula versions, assumptions, public test vectors
          and material changes are documented. A passing arithmetic test does not prove that a
          runtime supports a configuration or that a system meets performance, reliability or
          security requirements.
        </p>
        <h2>5. Report uncertainty and limitations</h2>
        <p>
          We identify the boundary of what the evidence can establish. Estimates disclose inputs,
          units, rounding and sensitivity to assumptions. Benchmarks disclose the tested workload
          and environment. Market comparisons state the pricing date, region, service tier and
          relevant exclusions. Forecasts and scenarios are not presented as observed outcomes.
          Where a conclusion depends on assumptions, readers should be able to find those
          assumptions.
        </p>
        <h2>6. Use independent human review</h2>
        <p>
          Authors are responsible for the accuracy and integrity of their work. Fact-checking,
          specialist review and final editorial approval are distinct responsibilities. Reviewers
          work within their actual competence and disclose relevant conflicts. Authors do not
          approve their own work. Only an authorized human editor can approve and publish an
          editorial item.
        </p>
        <h2>7. Use AI as assistance, not authority</h2>
        <p>
          AI systems may assist discovery, transcription, translation, data organization, code
          review, comparison, summarization and drafting. Human staff independently verify material
          facts, quotations, calculations, source context and conclusions. Material AI assistance
          is disclosed when readers could reasonably misunderstand how the work was produced.
          AI-generated material is not treated as an interview, firsthand observation, experiment
          or independent source. No model, prompt, memory, agent or tool output can approve or
          publish editorial work.
        </p>
        <h2>8. Correct the public record</h2>
        <p>
          When a material error is confirmed, we correct it promptly and add a dated notice that
          explains what changed. Clarifications, routine updates and corrections are distinguished.
          We preserve relevant revision history where practical and lawful. Readers can report
          concerns through the <a href="/corrections">corrections process</a>.
        </p>
        <h2>Related policies</h2>
        <p>
          Read this methodology with our <a href="/editorial-standards">Editorial Standards</a>,
          <a href="/authors"> Authors &amp; Contributors policy</a> and
          <a href="/commercial-disclosure"> Commercial Disclosure</a>. HEZQEN is owned and
          published by Tinlance; editorial accountability remains with human editors.
        </p>
      </div>
    </section>
  );
}
