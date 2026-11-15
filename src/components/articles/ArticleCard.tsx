import Link from "next/link";

import {
  getArticleAuthorName,
  getReadingTimeMinutes,
  type PublicArticle,
} from "@/lib/public-articles";
import { divisions } from "@/lib/site";

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(date);
}

export function ArticleCard({ article }: { article: PublicArticle }) {
  const division = divisions.find((item) => item.slug === article.division);
  const publishedDate = formatDate(article.publishedAt);

  return (
    <article className="article-card">
      <div className="article-card-meta">
        <span className="article-division-label">{division?.name ?? "Research"}</span>
        {publishedDate ? <time dateTime={article.publishedAt ?? undefined}>{publishedDate}</time> : null}
        <span>{getReadingTimeMinutes(article.body)} min read</span>
      </div>
      <h3>
        <Link href={`/articles/${article.slug}`}>{article.title}</Link>
      </h3>
      {article.excerpt ? <p>{article.excerpt}</p> : <p>Evidence-led reporting and analysis from HEZQEN.</p>}
      <div className="article-card-footer">
        <span>{getArticleAuthorName(article.author)}</span>
        <Link className="article-card-read-link" href={`/articles/${article.slug}`}>
          Read article <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
