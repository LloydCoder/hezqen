import { getPayload, type Where } from "payload";

import config from "../payload.config.ts";
import { toPublicArticle, type PublicArticle } from "./public-articles.ts";

const publishedWhere: Where = {
  and: [{ _status: { equals: "published" } }, { workflowStatus: { equals: "published" } }],
};

export async function findPublicArticles(options: {
  division?: PublicArticle["division"];
  limit?: number;
} = {}): Promise<PublicArticle[]> {
  const payload = await getPayload({ config });
  const clauses = [...(publishedWhere.and ?? [])];
  if (options.division) clauses.push({ division: { equals: options.division } });

  const result = await payload.find({
    collection: "articles",
    where: { and: clauses },
    limit: Math.min(Math.max(options.limit ?? 10, 1), 50),
    sort: "-publishedAt",
    depth: 1,
    overrideAccess: true,
  });

  return result.docs
    .map((doc) => toPublicArticle(doc))
    .filter((article): article is PublicArticle => article !== null);
}

export async function findPublicArticleBySlug(slug: string): Promise<PublicArticle | null> {
  if (!slug || slug.length > 180) return null;
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "articles",
    where: {
      and: [...(publishedWhere.and ?? []), { slug: { equals: slug } }],
    },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  });
  return toPublicArticle(result.docs[0]);
}

export async function findPublicCorrections(limit = 50): Promise<PublicArticle[]> {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "articles",
    where: {
      and: [
        ...(publishedWhere.and ?? []),
        { correctionStatus: { equals: "resolved" } },
        { correctionPublicNote: { exists: true } },
      ],
    },
    limit: Math.min(Math.max(limit, 1), 50),
    sort: "-correctionResolvedAt",
    depth: 1,
    overrideAccess: true,
  });
  return result.docs
    .map((doc) => toPublicArticle(doc))
    .filter((article): article is PublicArticle => article !== null && article.correctionNotice !== null);
}
