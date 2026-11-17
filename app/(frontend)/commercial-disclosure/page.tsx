import type { Metadata } from "next";

import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Commercial Disclosure",
  description:
    "How HEZQEN discloses ownership, Tinlance services, sponsorships, affiliate relationships, gifts and other commercial interests.",
  alternates: { canonical: "/commercial-disclosure" },
};

export default function CommercialDisclosurePage() {
  return (
    <section className="prose-page">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "HEZQEN Commercial Disclosure",
          url: "https://hezqen.tinlance.com/commercial-disclosure",
          isPartOf: { "@id": "https://hezqen.tinlance.com/#website" },
          about: { "@id": "https://hezqen.tinlance.com/#organization" },
        }}
      />
      <div className="container prose-container">
        <p className="eyebrow">
          <span className="eyebrow-line" /> TRANSPARENCY / COMMERCIAL RELATIONSHIPS
        </p>
        <h1>
          Clear about <em>commercial interests.</em>
        </h1>
        <p className="prose-lede">
          Readers should be able to understand who publishes HEZQEN, how the publication may earn
          revenue and where a commercial relationship exists.
        </p>
        <div className="prose-rule" />
        <h2>Ownership and publisher</h2>
        <p>
          HEZQEN is owned, operated and published by Tinlance. Tinlance also provides AI,
          cybersecurity, cloud, software engineering and related professional services. HEZQEN has
          its own editorial governance, but it is not a separately owned company. This relationship
          is disclosed so readers can evaluate our work with the correct context.
        </p>
        <h2>Editorial independence</h2>
        <p>
          Commercial relationships do not buy editorial coverage, favorable conclusions, product
          ratings, source treatment or approval rights. Tinlance's sales and delivery teams cannot
          direct an editor to alter an evidence-based conclusion. Editors retain responsibility for
          assignments, verification, headlines, corrections and publication decisions. Where a
          conflict cannot be managed transparently, HEZQEN may decline or reassign the work.
        </p>
        <h2>Sponsored content and advertising</h2>
        <p>
          Any paid placement, sponsorship, advertorial or materially controlled promotional content
          will be clearly identified at the point where it appears. Sponsors do not receive
          undisclosed editorial control. Payment for a placement does not make the content
          independent reporting, and sponsored material is not presented as an independent product
          assessment.
        </p>
        <h2>Affiliate links and referrals</h2>
        <p>
          If HEZQEN uses an affiliate or referral link, we identify the commercial relationship
          clearly near the link or recommendation. The publisher may receive a commission or other
          benefit if a reader follows the link or completes a qualifying action. The presence of a
          commission does not determine our technical findings or recommendation. Readers should
          check current pricing, availability and provider terms directly before purchasing.
        </p>
        <h2>Products, access and other benefits</h2>
        <p>
          We disclose material benefits that could affect, or reasonably appear to affect, an
          assessment. These may include review units, free trials, credits, travel, event access,
          consulting arrangements, investments, employment, gifts or other non-cash benefits.
          Relevant benefits are recorded and evaluated by an editor. Access to a product or service
          does not guarantee coverage or a positive assessment.
        </p>
        <h2>Tinlance services and related-party coverage</h2>
        <p>
          When HEZQEN covers a Tinlance product, service, customer engagement or commercial
          initiative, the relationship is disclosed prominently. The editorial team determines
          whether independent review, additional evidence, reassignment or non-publication is
          appropriate. A Tinlance commercial offer is not an editorial endorsement by HEZQEN.
        </p>
        <h2>How to raise a concern</h2>
        <p>
          Readers can ask about a disclosure or report a potential conflict through
          <a href="mailto:hello@tinlance.com"> hello@tinlance.com</a>. Material errors in a
          disclosure are handled through our <a href="/corrections">Corrections Policy</a>.
        </p>
        <p className="prose-signoff">
          This policy applies to HEZQEN articles, research, Labs publications, newsletters,
          recommendations and other public editorial surfaces.
        </p>
      </div>
    </section>
  );
}
