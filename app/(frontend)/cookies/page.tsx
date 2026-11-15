import type { Metadata } from "next";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Cookie Notice",
  description:
    "Information about cookies and similar technologies that may be used by the HEZQEN website.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <section className="prose-page">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "HEZQEN Cookie Notice",
          url: "https://hezqen.tinlance.com/cookies",
          isPartOf: { "@id": "https://hezqen.tinlance.com/#website" },
          about: { "@id": "https://hezqen.tinlance.com/#organization" },
        }}
      />
      <div className="container prose-container">
        <p className="eyebrow">
          <span className="eyebrow-line" /> PRIVACY / COOKIES
        </p>
        <h1>
          Cookies, <em>explained.</em>
        </h1>
        <p className="prose-lede">
          This notice describes the intended approach to cookies and similar browser storage on
          HEZQEN.
        </p>
        <div className="prose-rule" />
        <h2>Strictly necessary technologies</h2>
        <p>
          Hosting, security and authenticated content-management functions may require technically
          necessary cookies or similar mechanisms. These support delivery, session security and
          administration.
        </p>
        <h2>Analytics and advertising</h2>
        <p>
          HEZQEN does not announce an advertising or analytics programme in this release. If
          non-essential analytics, advertising, embedded media or third-party tracking is
          introduced, the technology inventory, purposes, providers, retention and consent controls
          must be reviewed and this notice updated before activation.
        </p>
        <h2>Browser controls</h2>
        <p>
          You can review and clear cookies through your browser settings. Blocking strictly
          necessary technologies may affect authenticated administration functions.
        </p>
        <h2>Before production launch</h2>
        <p>
          The live deployment&apos;s cookie and storage inventory must be tested in a clean browser
          profile. This initial notice is not a certification that no third-party cookies are set
          and must receive legal review for the jurisdictions served.
        </p>
      </div>
    </section>
  );
}
