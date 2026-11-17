import type { Metadata } from "next";

import { NewsletterSignupForm } from "@/components/NewsletterSignupForm";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "The HEZQEN Intelligence Brief",
  description:
    "Subscribe to the HEZQEN Intelligence Brief for evidence-led reporting and technical analysis across AI, cybersecurity, cloud engineering and business.",
  alternates: { canonical: "/newsletter" },
};

export default function NewsletterPage() {
  return (
    <section className="prose-page">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "The HEZQEN Intelligence Brief",
          url: "https://hezqen.tinlance.com/newsletter",
          isPartOf: { "@id": "https://hezqen.tinlance.com/#website" },
          about: { "@id": "https://hezqen.tinlance.com/#organization" },
        }}
      />
      <div className="container prose-container newsletter-page">
        <p className="eyebrow">
          <span className="eyebrow-line" /> HEZQEN / THE INTELLIGENCE BRIEF
        </p>
        <h1>
          Signal over <em>noise.</em>
        </h1>
        <p className="prose-lede">
          A concise weekly briefing on the research, systems, security decisions and business
          developments shaping the global technology economy.
        </p>
        <div className="prose-rule" />
        <h2>What you will receive</h2>
        <ul>
          <li>Original HEZQEN reporting and research worth reading in full.</li>
          <li>Technical analysis across AI, cybersecurity, cloud and engineering.</li>
          <li>Evidence-led context on companies, markets and technology strategy.</li>
          <li>New Labs tools, benchmark findings and methodology updates.</li>
        </ul>
        <div className="newsletter-page-signup">
          <p className="section-label">SUBSCRIBE TO THE BRIEF</p>
          <NewsletterSignupForm source="newsletter" />
          <p className="form-footnote">
            We use double opt-in: your subscription starts only after you confirm the email we send.
            You can unsubscribe at any time. Email delivery is provided by Resend. Read the{" "}
            <a href="/privacy">privacy notice</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
