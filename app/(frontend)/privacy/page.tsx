import type { Metadata } from "next";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description:
    "How HEZQEN and its publisher, Tinlance, approach personal information and privacy on the public website.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <section className="prose-page">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "HEZQEN Privacy Notice",
          url: "https://hezqen.tinlance.com/privacy",
          isPartOf: { "@id": "https://hezqen.tinlance.com/#website" },
          about: { "@id": "https://hezqen.tinlance.com/#organization" },
        }}
      />
      <div className="container prose-container">
        <p className="eyebrow">
          <span className="eyebrow-line" /> PRIVACY / NOTICE
        </p>
        <h1>
          Privacy deserves <em>clarity.</em>
        </h1>
        <p className="prose-lede">
          This notice explains the privacy approach for the public HEZQEN website. HEZQEN is
          published by Tinlance.
        </p>
        <div className="prose-rule" />
        <h2>Information that may be processed</h2>
        <p>
          When you visit a website, the hosting and security providers may process technical request
          information such as IP address, user-agent, requested URL, timestamp, response status and
          security events to deliver, protect and troubleshoot the service. If you contact us, we
          receive the information you choose to include in your message.
        </p>
        <h2>Calculators and information you enter</h2>
        <p>
          HEZQEN Labs calculators are intended to calculate results in your browser. Do not enter
          confidential, personal or regulated information. The site should not be treated as a
          secure data-processing environment for sensitive workloads.
        </p>
        <h2>Newsletter subscriptions</h2>
        <p>
          If you subscribe to The HEZQEN Intelligence Brief, we process your email address, signup
          source, consent version and timestamps, confirmation state and unsubscribe preference.
          Subscription begins only after you confirm the email we send. Confirmation tokens are
          stored as hashes and expire after 24 hours. We apply a per-address confirmation cooldown
          and send limit to reduce abuse.
        </p>
        <p>
          Resend provides newsletter email delivery and contact/topic management. We synchronize an
          address to the HEZQEN newsletter topic only after confirmation. You can unsubscribe at any
          time using the link provided in newsletter communications. We retain a minimal suppression
          record so an unsubscribed address is not accidentally re-added.
        </p>
        <h2>Architecture-review requests</h2>
        <p>
          If you submit an architecture-review request, we process the name and work email you
          provide, optional company and role, project category, description, indicative budget and
          timeline, referral source and your permission for Tinlance to respond. The information is
          stored in the HEZQEN CMS and used to evaluate and answer that specific enquiry. It is not
          newsletter consent.
        </p>
        <p>
          Architecture-review requests are stored in the HEZQEN CMS for human review. An
          automated acknowledgement or sales notification is not currently guaranteed; do not
          assume that submitting the form creates an email conversation. Do not include passwords,
          API keys, payment details, confidential customer data or other secrets in the form.
        </p>
        <h2>Retention and user choices</h2>
        <p>
          Active newsletter records are retained while subscribed. Unsubscribe records are retained
          in a minimized form to respect the preference. Architecture-review enquiries are reviewed
          for deletion after 12 months without meaningful activity unless an ongoing commercial
          relationship, legal obligation or dispute requires longer retention. You can request
          access, correction or deletion by contacting hello@tinlance.com, subject to applicable
          legal requirements.
        </p>
        <h2>Cookies and similar technologies</h2>
        <p>
          See the <a href="/cookies">cookie notice</a>. Technical cookies may be used by hosting or
          authenticated administration functions. Any analytics, advertising or non-essential
          tracking must be separately assessed and disclosed before activation.
        </p>
        <h2>Your questions and requests</h2>
        <p>
          For privacy questions, contact <a href="mailto:hello@tinlance.com">hello@tinlance.com</a>.
          Do not send passwords, payment-card data or other sensitive information by email.
        </p>
        <h2>Important publication status</h2>
        <p>
          This is an initial website notice, not a legal opinion or a complete jurisdiction-specific
          privacy policy. Before public production launch, Tinlance must verify the actual hosting
          logs, cookie inventory, processors, retention periods, cross-border transfers, legal bases
          and applicable data-subject request process, and obtain legal review for the markets
          served.
        </p>
      </div>
    </section>
  );
}
