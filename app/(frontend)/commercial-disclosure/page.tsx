import type { Metadata } from "next";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Commercial Disclosure",
  description:
    "HEZQEN's ownership, Tinlance relationship, sponsorship, affiliate and editorial-independence disclosures.",
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
          <span className="eyebrow-line" /> OWNERSHIP &amp; TRANSPARENCY / 005
        </p>
        <h1>
          Clear about <em>commercial interests.</em>
        </h1>
        <p className="prose-lede">
          HEZQEN is a publication owned and operated by Tinlance. We disclose relevant commercial
          relationships so readers can evaluate our work with the right context.
        </p>
        <div className="prose-rule" />
        <h2>Ownership</h2>
        <p>
          Tinlance owns and operates HEZQEN. HEZQEN is not a separately owned or
          corporate-independent newsroom. It maintains editorial standards and independent
          editorial judgment within its ownership structure.
        </p>
        <h2>Tinlance services</h2>
        <p>
          Tinlance provides technology, AI, cybersecurity, cloud and software engineering services.
          When an article, calculator or page links to a Tinlance service, requests an architecture
          review, or otherwise promotes a Tinlance offering, the relationship must be clear in the
          relevant context. A lead or service relationship does not purchase coverage or determine
          editorial conclusions.
        </p>
        <h2>Affiliate links and referrals</h2>
        <p>
          If HEZQEN uses an affiliate or referral link, we identify it near the relevant link or
          recommendation. HEZQEN or Tinlance may receive a commission or other benefit if a reader
          takes an eligible action. Commercial compensation does not guarantee inclusion or a
          positive assessment. We aim to evaluate products using disclosed criteria and evidence.
        </p>
        <h2>Sponsored content and paid research</h2>
        <p>
          Sponsored placements, commissioned work, paid research and material in-kind support must
          be clearly labelled. Sponsors and clients may check factual details about their own
          products for accuracy where agreed, but they do not receive editorial approval rights or
          control conclusions. Sponsored work is distinguished from independent editorial coverage.
        </p>
        <h2>Product access and conflicts</h2>
        <p>
          We disclose material product access, loans, gifts, travel, funding, investments,
          professional relationships and other conflicts when they could reasonably affect how a
          reader interprets the work. Authors and reviewers must disclose relevant interests to the
          editor before publication.
        </p>
        <h2>Editorial independence</h2>
        <p>
          Editorial decisions remain with the accountable editor. Advertisers, sponsors, affiliate
          partners, vendors, investors and Tinlance's sales function cannot require favorable
          coverage, suppress substantiated criticism or approve editorial conclusions. Where a
          conflict cannot be managed transparently, we may decline or reassign the work.
        </p>
        <h2>Questions</h2>
        <p>
          Questions about ownership, sponsorship or a specific disclosure can be sent to
          <a href="mailto:hello@tinlance.com"> hello@tinlance.com</a>. See also our
          <a href="/editorial-standards"> Editorial Standards</a> and
          <a href="/corrections"> Corrections Policy</a>.
        </p>
      </div>
    </section>
  );
}
