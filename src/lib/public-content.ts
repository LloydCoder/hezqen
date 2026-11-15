import { getPayload } from "payload";

import config from "../payload.config.ts";
import {
  toPublicArticle,
  toPublicCorrectionHistory,
  type PublicArticle,
} from "./public-articles.ts";

export async function findPublicArticles(options: {
  division?: PublicArticle["division"];
  limit?: number;
} = {}): Promise<PublicArticle[]> {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "articles",
    where: {
      and: [
        { _status: { equals: "published" } },
        { workflowStatus: { equals: "published" } },
        ...(options.division ? [{ division: { equals: options.division } }] : []),
      ],
    },
    limit: Math.min(Math.max(options.limit ?? 10, 1), 50),
    sort: "-publishedAt",
    depth: 1,
    overrideAccess: false,
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
      and: [
        { _status: { equals: "published" } },
        { workflowStatus: { equals: "published" } },
        { slug: { equals: slug } },
      ],
    },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  });
  const article = toPublicArticle(result.docs[0]);
  if (!article) return null;

  const versions = await payload.findVersions({
    collection: "articles",
    where: { parent: { equals: article.id } },
    limit: 100,
    sort: "-updatedAt",
    depth: 0,
    overrideAccess: true,
  });

  return {
    ...article,
    correctionHistory: toPublicCorrectionHistory(versions.docs, article.correctionNotice),
  };
}

export async function findPublicCorrections(limit = 50): Promise<PublicArticle[]> {
  const articles = await findPublicArticles({ limit: 50 });
  const payload = await getPayload({ config });
  const records = await Promise.all(
    articles.map(async (article) => {
      const versions = await payload.findVersions({
        collection: "articles",
        where: { parent: { equals: article.id } },
        limit: 100,
        sort: "-updatedAt",
        depth: 0,
        overrideAccess: true,
      });
      const history = toPublicCorrectionHistory(versions.docs, article.correctionNotice);
      return history.map((notice) => ({
        ...article,
        correctionNotice: notice,
        correctionHistory: history,
      }));
    }),
  );

  return records
    .flat()
    .sort(
      (left, right) =>
        Date.parse(right.correctionNotice!.correctedAt) -
        Date.parse(left.correctionNotice!.correctedAt),
    )
    .slice(0, Math.min(Math.max(limit, 1), 50));
}
