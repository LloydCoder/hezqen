import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authors and Contributors",
  description:
    "HEZQEN's standards for author attribution, contributor biographies, independent review and editorial accountability.",
  alternates: { canonical: "/authors" },
};

export default function AuthorsPage() {
  return (
    <section className="prose-page">
      <div className="container prose-container">
        <p className="eyebrow">
          <span className="eyebrow-line" /> PEOPLE &amp; ACCOUNTABILITY / 004
        </p>
        <h1>
          People behind the <em>work.</em>
        </h1>
        <p className="prose-lede">
          Every published editorial item must have an accountable human author and editor. We
          publish contributor information only with the person's consent and after their role and
          credentials have been checked.
        </p>
        <div className="prose-rule" />
        <h2>Author attribution</h2>
        <p>
          By-lines identify the person responsible for the reporting, analysis or research. A
          contributor's name is not used without their agreement. Where a work is produced by a
          team, the contribution and accountable editorial owner are described accurately.
        </p>
        <h2>Contributor profiles</h2>
        <p>
          Profiles may describe a contributor's relevant experience, professional affiliations,
          published work and areas of expertise. Biographical claims are checked with the
          contributor and must not imply qualifications, employment, certifications or institutional
          endorsement that have not been verified.
        </p>
        <h2>Review and fact-checking</h2>
        <p>
          Reviewers assess the work within their actual competence and disclose relevant conflicts.
          Technical review, fact-checking and final editorial approval are distinct
          responsibilities. A reviewer does not become the author unless they materially
          contributed to the work and agree to that attribution.
        </p>
        <h2>Corrections and accountability</h2>
        <p>
          Authors and editors remain accountable after publication. Material corrections are
          recorded on the affected work and in our{" "}
          <a href="/corrections">public corrections record</a>.
        </p>
        <h2>Contribute to HEZQEN</h2>
        <p>
          We welcome evidence-led pitches and specialist contributions across AI, cybersecurity,
          cloud engineering and technology business. Send a short outline, relevant experience,
          proposed sources or methodology, and any conflicts of interest to
          <a href="mailto:hello@tinlance.com"> hello@tinlance.com</a>. Submission does not guarantee
          acceptance or publication.
        </p>
        <p className="policy-note">
          This page describes our attribution and review policy. It does not list contributors who
          have not yet consented to a public profile; no placeholder authors or reviewer credentials
          are used.
        </p>
      </div>
    </section>
  );
}
