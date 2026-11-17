import { findPublicArticles } from "@/lib/public-content";
import { createRssFeed } from "@/lib/rss";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET() {
  const articles = await findPublicArticles({ limit: 50 });
  const feed = createRssFeed(articles, site.url);

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
