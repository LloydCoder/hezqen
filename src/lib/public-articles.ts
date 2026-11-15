export type PublicCorrectionNotice = {
  note: string;
  correctedAt: string;
};

export type PublicArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  division: "ai-technology" | "cybersecurity" | "cloud-engineering" | "business-startups";
  body: Record<string, unknown> | null;
  authorName: string | null;
  publishedAt: string;
  updatedAt: string;
  correctionNotice: PublicCorrectionNotice | null;
  correctionHistory: PublicCorrectionNotice[];
};

type RecordValue = Record<string, unknown>;

function asRecord(value: unknown): RecordValue {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as RecordValue) : {};
}

function validDate(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function getPublicCorrectionNotice(value: unknown): PublicCorrectionNotice | null {
  const record = asRecord(value);
  if (record.correctionStatus !== "resolved") return null;
  const note =
    typeof record.correctionPublicNote === "string" ? record.correctionPublicNote.trim() : "";
  const correctedAt = validDate(record.correctionResolvedAt);
  if (!note || note.length > 2000 || !correctedAt) return null;
  return { note, correctedAt };
}

export function toPublicCorrectionHistory(
  value: unknown,
  currentNotice: PublicCorrectionNotice | null = null,
): PublicCorrectionNotice[] {
  const versions = Array.isArray(value) ? value : [];
  const notices = versions.flatMap((item) => {
    const record = asRecord(item);
    const version = asRecord(record.version);
    const notice = getPublicCorrectionNotice({
      correctionStatus: version.correctionStatus,
      correctionPublicNote: version.correctionPublicNote,
      correctionResolvedAt: version.correctionResolvedAt ?? record.updatedAt ?? record.createdAt,
    });
    return notice ? [notice] : [];
  });
  if (currentNotice) notices.push(currentNotice);

  const unique = new Map<string, PublicCorrectionNotice>();
  for (const notice of notices) {
    unique.set(`${notice.correctedAt}\u0000${notice.note}`, notice);
  }
  return [...unique.values()].sort(
    (left, right) => Date.parse(right.correctedAt) - Date.parse(left.correctedAt),
  );
}

export function toPublicArticle(value: unknown): PublicArticle | null {
  const record = asRecord(value);
  if (record._status !== "published" || record.workflowStatus !== "published") return null;

  const title = typeof record.title === "string" ? record.title.trim() : "";
  const slug = typeof record.slug === "string" ? record.slug.trim() : "";
  const excerpt = typeof record.excerpt === "string" ? record.excerpt.trim() : "";
  const division = record.division;
  const publishedAt = validDate(record.publishedAt);
  const updatedAt = validDate(record.updatedAt);
  const allowedDivisions = [
    "ai-technology",
    "cybersecurity",
    "cloud-engineering",
    "business-startups",
  ] as const;

  if (
    !title ||
    title.length > 180 ||
    !slug ||
    slug.length > 180 ||
    !allowedDivisions.includes(division as (typeof allowedDivisions)[number]) ||
    !publishedAt ||
    !updatedAt
  ) {
    return null;
  }

  const author = asRecord(record.author);
  const authorName =
    typeof author.name === "string" && author.name.trim() ? author.name.trim().slice(0, 120) : null;
  const body = asRecord(record.body);
  const hasBody = Object.keys(body).length > 0;
  const correctionNotice = getPublicCorrectionNotice(record);

  return {
    id: String(record.id ?? slug),
    title,
    slug,
    excerpt: excerpt.slice(0, 320),
    division: division as PublicArticle["division"],
    body: hasBody ? body : null,
    authorName,
    publishedAt,
    updatedAt,
    correctionNotice,
    correctionHistory: correctionNotice ? [correctionNotice] : [],
  };
}
