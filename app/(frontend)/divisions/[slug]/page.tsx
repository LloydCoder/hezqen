import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { findPublicArticles } from "@/lib/public-content";
import { divisions, getDivision } from "@/lib/site";

export const dynamic = "force-dynamic";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(
    new Date(value),
  );
}

export function generateStaticParams() {
  return divisions.map((division) => ({ slug: division.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const division = getDivision(slug);
  if (!division) return {};
  return {
    title: division.name,
    description: division.description,
    alternates: { canonical: `/divisions/${division.slug}` },
  };
}

export default async function DivisionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const division = getDivision(slug);
  if (!division) notFound();
  const articles = await findPublicArticles({ division: division.slug, limit: 30 });

  return (
    <section className="division-page">
      <div className="container">
        <Link className="back-link" href="/#divisions">
          ← All divisions
        </Link>
        <p className="eyebrow">
          <span className="eyebrow-line" /> DIVISION {division.number}
        </p>
        <h1>{division.name}</h1>
        <p className="division-lede">{division.description}</p>
        <div className="division-detail-grid">
          <div>
            <p className="section-label">EDITORIAL SCOPE</p>
            <h2>What we examine</h2>
          </div>
          <ul className="focus-list">
            {division.focus.map((focus) => (
              <li key={focus}>
                {focus}
                <span aria-hidden="true">↗</span>
              </li>
            ))}
          </ul>
        </div>
        <section className="division-articles" aria-labelledby="division-articles-heading">
          <p className="section-label">PUBLISHED WORK</p>
          <h2 id="division-articles-heading">Latest in {division.name}</h2>
          {articles.length ? (
            <div className="latest-grid">
              {articles.map((article) => (
                <article className="latest-card" key={article.id}>
                  <p className="latest-card-meta">{formatDate(article.publishedAt)}</p>
                  <h3>
                    <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                  </h3>
                  {article.excerpt ? <p>{article.excerpt}</p> : null}
                  <Link className="text-link" href={`/articles/${article.slug}`}>
                    Read analysis ↗
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <p className="latest-empty">
              No articles have been published in this division yet. New work will appear here after
              it passes editorial review.
            </p>
          )}
        </section>
        <div className="division-note">
          <p className="section-label">OUR APPROACH</p>
          <p>
            We prioritize original reporting, primary-source research and clearly explained
            analysis. Published work is added as it passes HEZQEN&apos;s editorial review and
            verification standards.
          </p>
          <Link className="text-link" href="/editorial-standards">
            Read our editorial standards ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
