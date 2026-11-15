import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import { StructuredData } from "@/components/StructuredData";
import { findPublicArticleBySlug } from "@/lib/public-content";
import { divisions } from "@/lib/site";

export const dynamic = "force-dynamic";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(value));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await findPublicArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt || undefined,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt || undefined,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await findPublicArticleBySlug(slug);
  if (!article) notFound();

  const division = divisions.find((item) => item.slug === article.division);
  const authorName = article.authorName || "HEZQEN Editorial Desk";
  const correctionNotice = article.correctionNotice ?? article.correctionHistory[0] ?? null;

  return (
    <article className="article-page">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: article.title,
          description: article.excerpt,
          datePublished: article.publishedAt,
          dateModified: article.updatedAt,
          author: { "@type": "Person", name: authorName },
          publisher: { "@id": "https://hezqen.tinlance.com/#organization" },
          mainEntityOfPage: `https://hezqen.tinlance.com/articles/${article.slug}`,
        }}
      />
      <div className="container article-container">
        <Link className="back-link" href={division ? `/divisions/${division.slug}` : "/"}>
          ← {division ? division.name : "HEZQEN"}
        </Link>
        <p className="eyebrow">
          <span className="eyebrow-line" /> {division?.name ?? "EDITORIAL"}
        </p>
        <h1>{article.title}</h1>
        {article.excerpt ? <p className="article-deck">{article.excerpt}</p> : null}
        <div className="article-byline">
          <span>By {authorName}</span>
          <span>Published {formatDate(article.publishedAt)}</span>
          {article.updatedAt !== article.publishedAt ? (
            <span>Updated {formatDate(article.updatedAt)}</span>
          ) : null}
        </div>
        {correctionNotice ? (
          <aside className="correction-notice" aria-label="Correction notice">
            <p className="correction-notice-label">
              CORRECTION / {formatDate(correctionNotice.correctedAt)}
            </p>
            <p>{correctionNotice.note}</p>
            <Link href="/corrections">Read HEZQEN&apos;s corrections record ↗</Link>
          </aside>
        ) : null}
        {article.correctionHistory.length > 1 ? (
          <section className="correction-history" aria-labelledby="correction-history-heading">
            <h2 id="correction-history-heading">Correction history</h2>
            <ol>
              {article.correctionHistory.map((correction) => (
                <li key={`${correction.correctedAt}-${correction.note}`}>
                  <time dateTime={correction.correctedAt}>
                    {formatDate(correction.correctedAt)}
                  </time>
                  <p>{correction.note}</p>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
        <div className="article-rich-text">
          {article.body ? (
            <RichText data={article.body as SerializedEditorState} />
          ) : (
            <p>Article content is not available.</p>
          )}
        </div>
        <div className="article-endnote">
          <p>HEZQEN — Research. Intelligence. Perspective.</p>
          <Link href="/editorial-standards">Read our editorial standards ↗</Link>
        </div>
      </div>
    </article>
  );
}
