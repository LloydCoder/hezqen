import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/articles/ArticleCard";
import { StructuredData } from "@/components/StructuredData";
import { getPublicArticles } from "@/lib/public-articles";
import { divisions, getDivision, site } from "@/lib/site";

export const revalidate = 300;

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
  const articles = await getPublicArticles({ division: division.slug, limit: 12 });

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

        <section className="division-articles" aria-labelledby="division-articles-heading">
          <div className="articles-section-heading">
            <div>
              <p className="section-label">LATEST REPORTING / {division.number}</p>
              <h2 id="division-articles-heading">Latest in {division.name}</h2>
            </div>
            <Link className="text-link" href={`/articles?division=${division.slug}`}>
              View all articles <span aria-hidden="true">→</span>
            </Link>
          </div>
          {articles.docs.length > 0 ? (
            <div className="article-grid">
              {articles.docs.slice(0, 3).map((article) => (
                <ArticleCard article={article} key={article.id} />
              ))}
            </div>
          ) : (
            <p className="article-empty-inline">No articles have been published in this division yet.</p>
          )}
        </section>
        <StructuredData
          data={{
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": `${site.url}/divisions/${division.slug}#webpage`,
            name: `HEZQEN — ${division.name}`,
            url: `${site.url}/divisions/${division.slug}`,
            description: division.description,
            mainEntity: {
              "@type": "ItemList",
              itemListElement: articles.docs.slice(0, 3).map((article, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: `${site.url}/articles/${article.slug}`,
                name: article.title,
              })),
            },
          }}
        />
      </div>
    </section>
  );
}
