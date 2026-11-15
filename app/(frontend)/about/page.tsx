import type { Metadata } from "next";
import { site } from "@/lib/site";
export const metadata: Metadata = {
  title: "About",
  description:
    "About HEZQEN, a global technology and business intelligence publication by Tinlance.",
  alternates: { canonical: "/about" },
};
export default function AboutPage() {
  return (
    <section className="prose-page">
      <div className="container prose-container">
        <p className="eyebrow">
          <span className="eyebrow-line" /> ABOUT HEZQEN
        </p>
        <h1>
          Research with purpose.
          <br />
          <em>Intelligence with context.</em>
        </h1>
        <p className="prose-lede">
          HEZQEN is a global technology and business intelligence publication built to help readers
          understand consequential developments, evaluate evidence and make better decisions.
        </p>
        <div className="prose-rule" />
        <h2>What we cover</h2>
        <p>
          Our editorial work spans AI & Technology, Cybersecurity, Cloud & Engineering, and Business
          & Startups. We connect technical detail with the market, policy and human consequences
          around it.
        </p>
        <h2>How we work</h2>
        <p>
          We value original reporting, primary sources, reproducible research and transparent
          methodology. Human authors and editors remain accountable for every published item.
          Automated systems may assist research and production, but they cannot approve or publish
          editorial work.
        </p>
        <h2>Who publishes HEZQEN</h2>
        <p>
          HEZQEN is published by Tinlance and maintains its own editorial identity and governance.
          Commercial relationships do not confer editorial approval rights.
        </p>
        <p className="prose-signoff">{site.tagline}</p>
      </div>
    </section>
  );
}
