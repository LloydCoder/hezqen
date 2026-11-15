import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { getPayload, type Where } from "payload";

import config from "@payload-config";
import { divisions } from "./site.ts";

export type PublicArticleAuthor = {
  id: string | number;
  name?: string | null;
};

export type PublicArticleTopic = {
  id: string | number;
  name?: string | null;
  slug?: string | null;
};

export type PublicArticle = {
  id: string | number;
  title: string;
  slug: string;
  excerpt?: string | null;
  body?: SerializedEditorState | null;
  division: string;
  topics?: Array<PublicArticleTopic | string | number> | null;
  author?: PublicArticleAuthor | string | number | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  correctionStatus?: "none" | "open" | "resolved" | null;
  correctionPublicNote?: string | null;
};

export type PublicCorrectionNotice = {
  id: string | number;
  title: string;
  slug: string;
  division: string;
  correctionStatus: "open" | "resolved";
  correctionPublicNote: string;
  correctionRequestedAt?: string | null;
  correctionResolvedAt?: string | null;
};

export type PublicArticlePage = {
  docs: PublicArticle[];
  page: number;
  totalPages: number;
  totalDocs: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

const ARTICLE_PAGE_SIZE = 12;
const CORRECTION_NOTICE_LIMIT = 100;
const ARTICLE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

let payloadPromise: ReturnType<typeof getPayload> | undefined;

function publicCMSIsEnabled(): boolean {
  if (process.env.HEZQEN_PUBLIC_CMS_ENABLED === "true") return true;
  if (process.env.HEZQEN_PUBLIC_CMS_ENABLED === "false") return false;
  return process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV !== "production";
}

async function getCMS() {
  payloadPromise ??= getPayload({ config });
  return payloadPromise;
}

function emptyPage(page: number): PublicArticlePage {
  return {
    docs: [],
    page,
    totalPages: 0,
    totalDocs: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };
}

function isValidSlug(slug: string): boolean {
  return slug.length <= 120 && ARTICLE_SLUG_PATTERN.test(slug);
}

export async function getPublicArticles({
  page = 1,
  division,
  limit = ARTICLE_PAGE_SIZE,
}: {
  page?: number;
  division?: string;
  limit?: number;
} = {}): Promise<PublicArticlePage> {
  const safePage = Number.isSafeInteger(page) && page > 0 ? Math.min(page, 1000) : 1;
  const safeLimit = Number.isSafeInteger(limit) && limit > 0 ? Math.min(limit, 24) : ARTICLE_PAGE_SIZE;

  if (!publicCMSIsEnabled()) return emptyPage(safePage);
  if (division && !divisions.some((item) => item.slug === division)) return emptyPage(safePage);

  const filters: Where[] = [
    { _status: { equals: "published" } },
    { workflowStatus: { equals: "published" } },
  ];
  if (division) filters.push({ division: { equals: division } });

  const payload = await getCMS();
  const result = await payload.find({
    collection: "articles",
    where: { and: filters },
    sort: "-publishedAt",
    page: safePage,
    limit: safeLimit,
    depth: 1,
    overrideAccess: false,
  });

  return {
    docs: result.docs as unknown as PublicArticle[],
    page: result.page ?? safePage,
    totalPages: result.totalPages,
    totalDocs: result.totalDocs,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
  };
}

export async function getPublicArticleBySlug(slug: string): Promise<PublicArticle | null> {
  if (!isValidSlug(slug) || !publicCMSIsEnabled()) return null;

  const payload = await getCMS();
  const result = await payload.find({
    collection: "articles",
    where: {
      and: [
        { slug: { equals: slug } },
        { _status: { equals: "published" } },
        { workflowStatus: { equals: "published" } },
      ],
    },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  });

  return (result.docs[0] as unknown as PublicArticle | undefined) ?? null;
}

export async function getPublicCorrectionNoticeBySlug(
  slug: string,
): Promise<PublicCorrectionNotice | null> {
  if (!isValidSlug(slug) || !publicCMSIsEnabled()) return null;

  const payload = await getCMS();
  const result = await payload.find({
    collection: "articles",
    where: {
      and: [
        { slug: { equals: slug } },
        { workflowStatus: { equals: "correction_required" } },
        { correctionStatus: { equals: "open" } },
        { correctionPublicNote: { exists: true } },
      ],
    },
    select: {
      title: true,
      slug: true,
      division: true,
      correctionStatus: true,
      correctionPublicNote: true,
      correctionRequestedAt: true,
      correctionResolvedAt: true,
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  const notice = result.docs[0] as unknown as PublicCorrectionNotice | undefined;
  if (!notice || !notice.correctionPublicNote?.trim()) return null;
  return notice;
}

export async function getPublicCorrectionNotices(): Promise<PublicCorrectionNotice[]> {
  if (!publicCMSIsEnabled()) return [];

  const payload = await getCMS();
  const result = await payload.find({
    collection: "articles",
    where: {
      correctionStatus: { in: ["open", "resolved"] },
    },
    select: {
      title: true,
      slug: true,
      division: true,
      correctionStatus: true,
      correctionPublicNote: true,
      correctionRequestedAt: true,
      correctionResolvedAt: true,
    },
    sort: "-correctionRequestedAt",
    limit: CORRECTION_NOTICE_LIMIT,
    depth: 0,
    overrideAccess: true,
  });

  return (result.docs as unknown as PublicCorrectionNotice[]).filter(
    (notice) => Boolean(notice.correctionPublicNote?.trim()),
  );
}

export function getArticleWordCount(body: SerializedEditorState | null | undefined): number {
  if (!body || typeof body !== "object") return 0;

  const collect = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.flatMap(collect);
    if (!value || typeof value !== "object") return [];

    const record = value as Record<string, unknown>;
    const ownText = typeof record.text === "string" ? [record.text] : [];
    const childText = Object.entries(record)
      .filter(([key]) => key === "root" || key === "children")
      .flatMap(([, child]) => collect(child));
    return [...ownText, ...childText];
  };

  return collect(body).join(" ").trim().split(/\s+/).filter(Boolean).length;
}

export function getReadingTimeMinutes(body: SerializedEditorState | null | undefined): number {
  return Math.max(1, Math.ceil(getArticleWordCount(body) / 220));
}

export function getArticleAuthorName(author: PublicArticle["author"]): string {
  if (author && typeof author === "object" && "name" in author && author.name?.trim()) {
    return author.name.trim();
  }
  return "HEZQEN Editorial Desk";
}
