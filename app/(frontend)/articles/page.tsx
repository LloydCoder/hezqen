import type { Metadata } from "next";
import Link from "next/link";

import { ArticleCard } from "@/components/articles/ArticleCard";
import { StructuredData } from "@/components/StructuredData";
import { getPublicArticles } from "@/lib/public-articles";
import { divisions, site } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: ArticlesPageProps): Promise<Metadata> {
  const params = await searchParams;
  const hasFilter = Boolean(params.division) || (typeof params.page === "string" && params.page !== "1");

  return {
    title: "Articles",
    description:
      "Read HEZQEN's latest reporting, investigations and analysis across AI, cybersecurity, cloud engineering and business.",
    alternates: { canonical: "/articles" },
    robots: hasFilter ? { index: false, follow: true } : undefined,
    openGraph: {
      title: "Articles | HEZQEN",
      description: "Evidence-led reporting and analysis from HEZQEN.",
      url: "/articles",
      type: "website",
    },
  };
}

type ArticlesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const params = await searchParams;
  const pageParam = typeof params.page === "string" ? params.page : "1";
  const divisionParam = typeof params.division === "string" ? params.division : undefined;
  const pageValue = Number(pageParam);
  const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? Math.min(pageValue, 1000) : 1;
  const division = divisions.find((item) => item.slug === divisionParam);
  const result = await getPublicArticles({ page, division: division?.slug, limit: 12 });

  const itemList = result.docs.map((article, index) => ({
    "@type": "ListItem",
    position: (page - 1) * 12 + index + 1,
    url: `${site.url}/articles/${article.slug}`,
    name: article.title,
  }));

  return (
    <main className="articles-page">
      <section className="articles-intro">
        <div className="page-container">
          <p className="eyebrow">HEZQEN / PUBLICATION</p>
          <h1>{division ? division.name : "Reporting, research and perspective."}</h1>
          <p className="articles-lede">
            {division
              ? division.description
              : "Original reporting and evidence-led analysis across the technologies, risks, markets and ideas shaping the world."}
          </p>
          <nav className="article-filters" aria-label="Filter articles by editorial division">
            <Link
              aria-current={!division ? "page" : undefined}
              className={!division ? "article-filter is-active" : "article-filter"}
              href="/articles"
            >
              All articles
            </Link>
            {divisions.map((item) => (
              <Link
                aria-current={division?.slug === item.slug ? "page" : undefined}
                className={division?.slug === item.slug ? "article-filter is-active" : "article-filter"}
                href={`/articles?division=${item.slug}`}
                key={item.slug}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="articles-content page-container" aria-labelledby="articles-list-heading">
        <div className="articles-section-heading">
          <div>
            <p className="eyebrow">THE LATEST</p>
            <h2 id="articles-list-heading">
              {division ? `Latest in ${division.name}` : "Latest articles"}
            </h2>
          </div>
          <p>{result.totalDocs} {result.totalDocs === 1 ? "article" : "articles"}</p>
        </div>

        {result.docs.length > 0 ? (
          <div className="article-grid">
            {result.docs.map((article) => (
              <ArticleCard article={article} key={article.id} />
            ))}
          </div>
        ) : (
          <div className="article-empty-state">
            <span className="article-empty-mark" aria-hidden="true">H</span>
            <h3>The newsroom is preparing its first edition.</h3>
            <p>
              HEZQEN publishes only after source review and accountable human editorial approval.
              Explore the coverage areas while the next stories are being prepared.
            </p>
            <Link className="text-link" href="/divisions/ai-technology">
              Explore editorial divisions <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}

        {result.totalPages > 1 ? (
          <nav className="article-pagination" aria-label="Article pages">
            {result.hasPrevPage ? (
              <Link href={`/articles?page=${page - 1}${division ? `&division=${division.slug}` : ""}`}>
                Previous
              </Link>
            ) : <span aria-disabled="true">Previous</span>}
            <span>Page {result.page} of {result.totalPages}</span>
            {result.hasNextPage ? (
              <Link href={`/articles?page=${page + 1}${division ? `&division=${division.slug}` : ""}`}>
                Next
              </Link>
            ) : <span aria-disabled="true">Next</span>}
          </nav>
        ) : null}
      </section>

      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${site.url}/articles#webpage`,
          name: "HEZQEN Articles",
          url: `${site.url}/articles`,
          description: "Evidence-led reporting and analysis from HEZQEN.",
          mainEntity: { "@type": "ItemList", itemListElement: itemList },
        }}
      />
    </main>
  );
}
