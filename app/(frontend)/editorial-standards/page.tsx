import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Editorial Standards",
  description:
    "The editorial principles, evidence standards and human accountability rules governing HEZQEN.",
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
        <h2>AI use</h2>
        <p>
          AI tools may assist research discovery, transcription, translation, data organization,
          code review, comparison, summarization and drafting. Human staff independently verify
          material facts, quotations, calculations, source context and conclusions. Fully automated
          publication without accountable human editorial approval is prohibited.
        </p>
        <h2>Sources and corrections</h2>
        <p>
          We prefer primary sources and assess authority, proximity to the facts, methodology,
          incentives, recency and corroboration. Material errors are corrected promptly; corrections
          identify what changed and when. Research and benchmarks must distinguish measured results
          from estimates and theoretical calculations.
        </p>
        <p className="policy-note">
          This public summary is not a substitute for the complete governing policy. The full
          standard is maintained in the HEZQEN repository and applies across Media, Labs
          publications and Intelligence research.
        </p>
      </div>
    </section>
  );
}
