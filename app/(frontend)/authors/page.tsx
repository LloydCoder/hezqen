import type { Metadata } from "next";

import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Authors & Contributors",
  description:
    "HEZQEN's standards for authorship, specialist review, contributor profiles, conflicts and editorial accountability.",
  alternates: { canonical: "/authors" },
};

export default function AuthorsPage() {
  return (
    <section className="prose-page">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "HEZQEN Authors and Contributors",
          url: "https://hezqen.tinlance.com/authors",
          isPartOf: { "@id": "https://hezqen.tinlance.com/#website" },
          about: { "@id": "https://hezqen.tinlance.com/#organization" },
        }}
      />
      <div className="container prose-container">
        <p className="eyebrow">
          <span className="eyebrow-line" /> PEOPLE / ACCOUNTABILITY
        </p>
        <h1>
          Expertise with <em>accountability.</em>
        </h1>
        <p className="prose-lede">
          HEZQEN publishes work by people who can explain their methods, substantiate their claims
          and take responsibility for what appears under their byline.
        </p>
        <div className="prose-rule" />
        <h2>Who contributes</h2>
        <p>
          Our contributor network is built around the publication's four divisions: AI &amp;
          Technology, Cybersecurity, Cloud &amp; Engineering, and Business &amp; Startups. We work
          with researchers, engineers, security practitioners, analysts, operators and experienced
          reporters whose knowledge is relevant to the assignment.
        </p>
        <h2>Authorship and bylines</h2>
        <p>
          A byline identifies the person who made a substantive contribution and accepts
          responsibility for the work. Authors must consent to publication under their name and
          approve the final version attributed to them. We do not invent authors, biographies,
          credentials, affiliations, interviews or expert endorsements. Editorial staff may use a
          desk byline only where the publication's internal policy permits it and a responsible
          human editor is recorded internally.
        </p>
        <h2>Contributor profiles</h2>
        <p>
          Published profiles may describe a contributor's relevant experience, professional
          background, research interests and selected work. Credentials and affiliations are
          checked against reliable information and presented with appropriate context. Profiles
          are published with the contributor's knowledge and consent. A contributor's views are
          not automatically the views of an employer, client, institution or partner.
        </p>
        <h2>Reviewers and editors</h2>
        <p>
          Technical reviewers assess work within their specialist competence. Fact-checkers
          examine material claims and source context. Editors determine scope, fairness, clarity,
          disclosures and publication readiness. These roles are not interchangeable: a technical
          review is not final editorial approval, and an author cannot approve their own work.
          Reviewer acknowledgement is published only with consent and where it adds useful
          accountability.
        </p>
        <h2>Conflicts of interest</h2>
        <p>
          Authors, reviewers and editors must disclose relevant financial, professional, personal
          and organizational interests, including employment, consulting, investments, product
          access, gifts, sponsorships and close relationships. The editor decides whether a
          disclosure, independent review, reassignment or withdrawal is necessary. A contributor
          must not use a HEZQEN assignment to promote a client or conceal a material conflict.
        </p>
        <h2>AI-assisted contributions</h2>
        <p>
          AI systems cannot be listed as authors, reviewers or accountable editors. People remain
          responsible for verifying research, calculations, quotations, code, images and
          conclusions. Material AI assistance is disclosed where readers could reasonably
          misunderstand how the work was produced.
        </p>
        <h2>Corrections and contributor concerns</h2>
        <p>
          Contributors are expected to cooperate with reasonable fact-checking and post-publication
          corrections. Concerns about attribution, errors or conflicts can be sent to
          <a href="mailto:hello@tinlance.com"> hello@tinlance.com</a>. See our
          <a href="/corrections"> Corrections Policy</a> and
          <a href="/editorial-standards"> Editorial Standards</a>.
        </p>
        <p className="prose-signoff">
          Contributor names and biographies will appear with individual work only after identity,
          credentials, contribution and publication consent have been verified.
        </p>
      </div>
    </section>
  );
}
