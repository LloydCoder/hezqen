import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editorial Standards",
  description:
    "The editorial principles, evidence standards and human accountability rules governing HEZQEN.",
  alternates: { canonical: "/editorial-standards" },
};

const principles = [
  [
    "Evidence before assertion",
    "Material factual claims must be supported by identifiable, relevant evidence.",
  ],
  [
    "Original value",
    "Our work must contribute reporting, investigation, technical analysis, data analysis or a clearly reasoned perspective.",
  ],
  [
    "Human accountability",
    "A named human author and accountable editor own every published editorial item.",
  ],
  [
    "Transparency",
    "We distinguish verified fact, attributed claim, analysis, opinion, estimate and speculation.",
  ],
  ["Independence", "Commercial relationships do not determine editorial conclusions."],
  [
    "Correction over concealment",
    "Material errors are corrected visibly, with a dated explanation.",
  ],
];

export default function EditorialStandardsPage() {
  return (
    <section className="prose-page">
      <div className="container prose-container">
        <p className="eyebrow">
          <span className="eyebrow-line" /> PUBLIC POLICY / 001
        </p>
        <h1>
          Our editorial
          <br />
          <em>standards.</em>
        </h1>
        <p className="prose-lede">
          Trust is earned through the work: how we find information, test claims, make decisions and
          correct mistakes.
        </p>
        <div className="prose-rule" />
        <h2>Non-negotiable principles</h2>
        <div className="principle-list">
          {principles.map(([title, description], index) => (
            <article className="principle-row" key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
        <h2>Reporting and source quality</h2>
        <p>
          We prioritize original research, official documentation, standards, regulatory filings,
          court records, security advisories, source repositories, primary datasets and direct
          interviews. Reputable secondary reporting may provide context and corroboration. Multiple
          articles repeating the same original claim do not count as independent confirmation.
          Editors assess a source's authority, proximity to the facts, methodology, incentives,
          recency and limitations.
        </p>
        <h2>Claims and evidence</h2>
        <p>
          Material claims are separated from opinion, estimates and attributed statements. Authors
          link claims to relevant sources and record supporting evidence where lawful. A citation
          alone does not prove a claim. We disclose when evidence is incomplete, disputed,
          unavailable or not independently verified. We do not fabricate sources, quotations,
          interviews, datasets, screenshots, tests or benchmark results.
        </p>
        <h2>Authorship, review and approval</h2>
        <p>
          Every published editorial item has an accountable human author and editor. Fact-checking,
          technical review and final editorial approval are distinct responsibilities. Reviewers
          work within their actual competence and disclose conflicts. Authors do not approve their
          own work. Only an authorized human editor may approve and publish editorial content.
        </p>
        <p>
          Our normal workflow is assignment, research, evidence capture, drafting, fact-checking,
          independent review where appropriate, editorial approval, publication and post-publication
          monitoring. A system, model, prompt, memory or tool output cannot grant editorial
          authority.
        </p>
        <h2>AI-assisted work</h2>
        <p>
          AI tools may assist research discovery, transcription, translation, data organization,
          code review, comparison, summarization and drafting. Human staff independently verify
          material facts, quotations, calculations, source context and conclusions. Material AI
          assistance is disclosed when readers could reasonably misunderstand how the work was
          produced. Fully automated publication without accountable human editorial approval is
          prohibited.
        </p>
        <h2>Technical testing and benchmarks</h2>
        <p>
          Research and benchmarks disclose the question, scope, hardware, software and model
          versions, configuration, workload, baseline, dataset provenance, measurement method,
          repetitions, units, uncertainty, exclusions and relevant limitations where practical.
          Measured results are distinguished from calculations, estimates, forecasts and vendor
          claims. A theoretical model is not presented as an empirical benchmark.
        </p>
        <h2>Headlines, charts and visuals</h2>
        <p>
          Headlines and summaries must represent the evidence accurately. Charts identify units,
          sources, time periods and material transformations. Images and illustrations must not
          misrepresent events or imply firsthand observation that did not occur. Synthetic or
          illustrative visuals are labelled when readers could mistake them for documentary
          evidence.
        </p>
        <h2>Ownership and commercial independence</h2>
        <p>
          HEZQEN is owned and operated by Tinlance, which also provides commercial technology and
          engineering services. Relevant Tinlance services, sponsorships, affiliate relationships,
          product access, funding and other material commercial interests must be disclosed clearly
          where they appear. Payment, partnership status or a service relationship does not grant an
          advertiser, sponsor, affiliate partner or Tinlance sales team editorial approval rights.
          Where a conflict cannot be managed transparently, we may decline or reassign the work.
        </p>
        <h2>Corrections and updates</h2>
        <p>
          Material errors are corrected promptly. A correction identifies the affected work, what
          was wrong, what changed and when. Routine updates, clarifications and additions are
          distinguished from corrections. We preserve material revision history where practical and
          lawful. Readers can report concerns through our{" "}
          <a href="/corrections">corrections process</a>.
        </p>
        <h2>Safety, privacy and responsible reporting</h2>
        <p>
          We minimize collection and retention of personal data, protect confidential sources and
          sensitive evidence, and apply heightened review to allegations, private individuals,
          minors and security vulnerabilities. We do not publish credentials, personal data or
          operational details that create disproportionate risk. Responsible disclosure is used
          where appropriate.
        </p>
        <p>
          These standards apply across AI &amp; Technology, Cybersecurity, Cloud &amp; Engineering,
          Business &amp; Startups, HEZQEN Labs and research publications. Read them with our
          <a href="/research-methodology"> Research Methodology</a>,
          <a href="/authors"> Authors &amp; Contributors policy</a>,
          <a href="/commercial-disclosure"> Commercial Disclosure</a> and
          <a href="/corrections"> Corrections Policy</a>.
        </p>
      </div>
    </section>
  );
}
