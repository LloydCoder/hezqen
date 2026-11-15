import type { Metadata } from "next";
import Link from "next/link";

import { StructuredData } from "@/components/StructuredData";
import { getPublicCorrectionNotices } from "@/lib/public-articles";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Corrections Policy",
  description:
    "How HEZQEN reviews factual concerns, corrects material errors and records changes to published work.",
  alternates: { canonical: "/corrections" },
};

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(date);
}

export const revalidate = 300;

export default async function CorrectionsPage() {
  const notices = await getPublicCorrectionNotices();

  return (
    <section className="prose-page">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "HEZQEN Corrections Policy",
          url: `${site.url}/corrections`,
          isPartOf: { "@id": `${site.url}/#website` },
          about: { "@id": `${site.url}/#organization` },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: notices.map((notice, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: notice.title,
              url: `${site.url}/articles/${notice.slug}`,
            })),
          },
        }}
      />
      <div className="container prose-container">
        <p className="eyebrow">
          <span className="eyebrow-line" /> EDITORIAL ACCOUNTABILITY / 002
        </p>
        <h1>
          Corrections with <em>transparency.</em>
        </h1>
        <p className="prose-lede">
          Accuracy is an ongoing responsibility. When published work contains a material error, we
          aim to correct it clearly and preserve an accountable record of the change.
        </p>
        <div className="prose-rule" />
        <h2>How to report a concern</h2>
        <p>
          Email <a href="mailto:hello@tinlance.com">hello@tinlance.com</a> with the page or article
          URL, the passage in question, an explanation of the issue and links or documents
          supporting the concern.
        </p>
        <h2>How we review reports</h2>
        <p>
          An editor assesses the evidence, checks the original source context and determines whether
          a correction, clarification, update or no change is warranted. A report does not
          automatically establish that an error occurred.
        </p>
        <h2>How corrections are displayed</h2>
        <p>
          Where a material factual error is confirmed, the published item should carry a dated
          correction note describing what changed. Updates that add new information without
          correcting an error should be distinguished from corrections.
        </p>
        <h2>Editorial independence</h2>
        <p>
          Correction decisions are editorial decisions. Commercial relationships, source preferences
          and automated system outputs do not determine the outcome.
        </p>

        <div className="prose-rule" />
        <section className="correction-log" aria-labelledby="correction-log-heading">
          <p className="eyebrow">
            <span className="eyebrow-line" /> PUBLIC RECORD / CORRECTION LOG
          </p>
          <h2 id="correction-log-heading">Published correction notices</h2>
          <p>
            This log contains public correction notes only. It does not disclose private source
            material, internal review discussions or unverified allegations.
          </p>
          {notices.length > 0 ? (
            <div className="correction-log-list">
              {notices.map((notice) => (
                <article className="correction-log-item" key={notice.id}>
                  <div className="correction-log-meta">
                    <span className={notice.correctionStatus === "open" ? "correction-state is-open" : "correction-state"}>
                      {notice.correctionStatus === "open" ? "Under review" : "Resolved"}
                    </span>
                    {formatDate(notice.correctionRequestedAt ?? notice.correctionResolvedAt) ? (
                      <time dateTime={notice.correctionRequestedAt ?? notice.correctionResolvedAt ?? undefined}>
                        {formatDate(notice.correctionRequestedAt ?? notice.correctionResolvedAt)}
                      </time>
                    ) : null}
                  </div>
                  <h3>{notice.title}</h3>
                  <p>{notice.correctionPublicNote}</p>
                  <Link className="text-link" href={`/articles/${notice.slug}`}>
                    {notice.correctionStatus === "open" ? "Read correction notice" : "Read updated article"}
                    <span aria-hidden="true"> →</span>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <p className="correction-log-empty">No public correction notices are currently listed.</p>
          )}
        </section>
      </div>
    </section>
  );
}
