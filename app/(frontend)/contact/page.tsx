import type { Metadata } from "next";
import Link from "next/link";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Contact HEZQEN",
  description:
    "Contact HEZQEN at Tinlance for editorial enquiries, research questions, corrections, partnerships and general enquiries.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <section className="prose-page">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact HEZQEN",
          url: "https://hezqen.tinlance.com/contact",
          isPartOf: { "@id": "https://hezqen.tinlance.com/#website" },
          about: { "@id": "https://hezqen.tinlance.com/#organization" },
        }}
      />
      <div className="container prose-container">
        <p className="eyebrow">
          <span className="eyebrow-line" /> CONTACT / HEZQEN
        </p>
        <h1>
          Start a <em>conversation.</em>
        </h1>
        <p className="prose-lede">
          For editorial enquiries, research questions, corrections, partnership proposals and
          general correspondence, contact the publishing team.
        </p>
        <div className="prose-rule" />
        <h2>General enquiries</h2>
        <p>
          <a href="mailto:hello@tinlance.com">hello@tinlance.com</a>
        </p>
        <h2>Corrections and factual concerns</h2>
        <p>
          Identify the article or page, the specific claim, and any supporting source material. We
          review substantive corrections under our <Link href="/corrections">corrections policy</Link>.
        </p>
        <h2>Editorial independence</h2>
        <p>
          HEZQEN is published by Tinlance and maintains its own editorial identity and governance.
          Commercial enquiries do not confer editorial influence.
        </p>
        <p className="prose-signoff">
          <Link href="/editorial-standards">Read our editorial standards</Link>
        </p>
      </div>
    </section>
  );
}
