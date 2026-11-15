import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";

import { StructuredData } from "@/components/StructuredData";
import {
  getArticleAuthorName,
  getPublicArticleBySlug,
  getPublicCorrectionNoticeBySlug,
  getReadingTimeMinutes,
} from "@/lib/public-articles";
import { divisions, site } from "@/lib/site";

export const revalidate = 300;

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

const openGraphImage = "/opengraph-image";

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(date);
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublicArticleBySlug(slug);

  if (article) {
    const division = divisions.find((item) => item.slug === article.division);
    const canonical = `/articles/${article.slug}`;
    const author = getArticleAuthorName(article.author);
    const publishedAt = article.publishedAt ?? undefined;
    const modifiedAt = article.updatedAt ?? publishedAt;

    return {
      title: article.title,
      description: article.excerpt ?? `Evidence-led reporting from HEZQEN in ${division?.name ?? "technology and business"}.`,
      alternates: { canonical },
      openGraph: {
        title: article.title,
        description: article.excerpt ?? undefined,
        url: canonical,
        type: "article",
        publishedTime: publishedAt,
        modifiedTime: modifiedAt,
        authors: [author],
        section: division?.name,
        images: [openGraphImage],
      },
      twitter: {
        card: "summary_large_image",
        title: article.title,
        description: article.excerpt ?? undefined,
        images: [openGraphImage],
      },
    };
  }

  const correction = await getPublicCorrectionNoticeBySlug(slug);
  if (correction) {
    return {
      title: `Correction notice: ${correction.title}`,
      description: correction.correctionPublicNote,
      alternates: { canonical: `/articles/${correction.slug}` },
      openGraph: {
        title: `Correction notice: ${correction.title}`,
        description: correction.correctionPublicNote,
        url: `/articles/${correction.slug}`,
        type: "article",
        images: [openGraphImage],
      },
      robots: { index: true, follow: true },
    };
  }

  return {
    title: "Article not found",
    robots: { index: false, follow: true },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getPublicArticleBySlug(slug);

  if (!article) {
    const correction = await getPublicCorrectionNoticeBySlug(slug);
    if (!correction) notFound();

    const division = divisions.find((item) => item.slug === correction.division);
    return (
      <main className="article-detail-page">
        <div className="article-detail-container">
          <nav className="article-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/articles">Articles</Link>
            <span aria-hidden="true">/</span>
            <span>Correction notice</span>
          </nav>
          <section className="correction-notice correction-notice-prominent">
            <p className="eyebrow">EDITORIAL UPDATE / CORRECTION NOTICE</p>
            <h1>{correction.title}</h1>
            {division ? <p className="article-division-label">{division.name}</p> : null}
            <p>{correction.correctionPublicNote}</p>
            <p className="correction-notice-status">This article is temporarily unavailable while the editorial team reviews the reported issue.</p>
            <Link className="text-link" href="/corrections">
              Read the corrections log <span aria-hidden="true">→</span>
            </Link>
          </section>
        </div>
      </main>
    );
  }

  const division = divisions.find((item) => item.slug === article.division);
  const author = getArticleAuthorName(article.author);
  const publishedDate = formatDate(article.publishedAt);
  const modifiedDate = formatDate(article.updatedAt);
  const topicNames = (article.topics ?? [])
    .map((topic) => (topic && typeof topic === "object" && "name" in topic ? topic.name : null))
    .filter((name): name is string => typeof name === "string" && name.trim().length > 0);
  const canonical = `${site.url}/articles/${article.slug}`;

  return (
    <main className="article-detail-page">
      <div className="article-detail-container">
        <nav className="article-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/articles">Articles</Link>
          <span aria-hidden="true">/</span>
          <span>{division?.name ?? "Research"}</span>
        </nav>

        <header className="article-detail-header">
          <p className="eyebrow">HEZQEN / {division?.name ?? "RESEARCH"}</p>
          <h1>{article.title}</h1>
          {article.excerpt ? <p className="article-detail-excerpt">{article.excerpt}</p> : null}
          <div className="article-byline">
            <span>By {author}</span>
            {publishedDate && article.publishedAt ? (
              <time dateTime={article.publishedAt}>{publishedDate}</time>
            ) : null}
            <span>{getReadingTimeMinutes(article.body)} min read</span>
          </div>
          {modifiedDate && modifiedDate !== publishedDate ? (
            <p className="article-updated">Updated {modifiedDate}</p>
          ) : null}
        </header>

        {article.correctionStatus === "resolved" && article.correctionPublicNote?.trim() ? (
          <aside className="correction-notice" aria-label="Correction notice">
            <p className="eyebrow">CORRECTION / EDITORIAL NOTE</p>
            <p>{article.correctionPublicNote}</p>
          </aside>
        ) : null}

        <article className="article-body">
          {article.body ? <RichText data={article.body} /> : <p>This article has no published body content.</p>}
        </article>

        {topicNames.length > 0 ? (
          <footer className="article-topics" aria-label="Article topics">
            <span>Topics</span>
            {topicNames.map((topic) => <span className="article-topic" key={topic}>{topic}</span>)}
          </footer>
        ) : null}

        <div className="article-end-note">
          <p>HEZQEN — Research. Intelligence. Perspective.</p>
          <Link href="/corrections">Report a factual concern or read our corrections policy.</Link>
        </div>
      </div>

      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "@id": `${canonical}#article`,
          headline: article.title,
          description: article.excerpt ?? undefined,
          url: canonical,
          mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
          datePublished: article.publishedAt ?? undefined,
          dateModified: article.updatedAt ?? article.publishedAt ?? undefined,
          author: { "@type": "Person", name: author },
          publisher: { "@id": `${site.url}/#organization` },
          articleSection: division?.name ?? "Research",
          keywords: topicNames,
          isAccessibleForFree: true,
        }}
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: site.url },
            { "@type": "ListItem", position: 2, name: "Articles", item: `${site.url}/articles` },
            { "@type": "ListItem", position: 3, name: article.title, item: canonical },
          ],
        }}
      />
    </main>
  );
}
