export type ClaimVerificationStatus =
  | "verified"
  | "corroborated"
  | "attributed"
  | "disputed"
  | "unverified"
  | "corrected";

export type EvidenceVerificationStatus = "captured" | "preserved" | "verified" | "rejected";

export interface ResearchSource {
  id: string;
  url: string;
  publisher: string;
  title: string;
  publishedAt?: string | null;
  retrievedAt: string;
}

export interface ResearchEvidence {
  id: string;
  sourceId: string;
  collectionMethod: string;
  retrievedAt: string;
  sha256: string;
  storageRef: string;
  verificationStatus: EvidenceVerificationStatus;
}

export interface ResearchClaim {
  status: ClaimVerificationStatus;
  sourceIds: string[];
  evidenceIds: string[];
}

export type ProvenanceIssue =
  | "SOURCE_ID_REQUIRED"
  | "SOURCE_URL_INVALID"
  | "SOURCE_URL_HTTPS_REQUIRED"
  | "SOURCE_URL_CREDENTIALS_FORBIDDEN"
  | "SOURCE_PUBLISHER_REQUIRED"
  | "SOURCE_TITLE_REQUIRED"
  | "SOURCE_RETRIEVAL_DATE_INVALID"
  | "SOURCE_PUBLICATION_DATE_INVALID"
  | "SOURCE_DATE_ORDER_INVALID"
  | "EVIDENCE_ID_REQUIRED"
  | "EVIDENCE_SOURCE_REQUIRED"
  | "EVIDENCE_METHOD_REQUIRED"
  | "EVIDENCE_RETRIEVAL_DATE_INVALID"
  | "EVIDENCE_CHECKSUM_INVALID"
  | "EVIDENCE_STORAGE_REF_REQUIRED"
  | "CLAIM_STATUS_NOT_VERIFIED"
  | "CLAIM_SOURCE_REQUIRED"
  | "CLAIM_EVIDENCE_REQUIRED"
  | "CLAIM_SOURCE_NOT_FOUND"
  | "CLAIM_EVIDENCE_NOT_FOUND"
  | "CLAIM_EVIDENCE_SOURCE_MISMATCH"
  | "CLAIM_EVIDENCE_NOT_VERIFIED"
  | "CLAIM_SOURCE_INVALID"
  | "CLAIM_EVIDENCE_INVALID";

export interface ClaimAssessment {
  allowed: boolean;
  blockers: ProvenanceIssue[];
}

function isValidTimestamp(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0 && !Number.isNaN(Date.parse(value));
}

export function validateSourceRecord(source: ResearchSource): ProvenanceIssue[] {
  const issues: ProvenanceIssue[] = [];
  if (!source.id?.trim()) issues.push("SOURCE_ID_REQUIRED");
  let parsedUrl: URL | undefined;
  try {
    parsedUrl = new URL(source.url);
  } catch {
    issues.push("SOURCE_URL_INVALID");
  }
  if (parsedUrl && parsedUrl.protocol !== "https:") {
    issues.push("SOURCE_URL_HTTPS_REQUIRED");
  }
  if (parsedUrl && (parsedUrl.username || parsedUrl.password)) {
    issues.push("SOURCE_URL_CREDENTIALS_FORBIDDEN");
  }
  if (!source.publisher?.trim()) issues.push("SOURCE_PUBLISHER_REQUIRED");
  if (!source.title?.trim()) issues.push("SOURCE_TITLE_REQUIRED");
  if (!isValidTimestamp(source.retrievedAt)) issues.push("SOURCE_RETRIEVAL_DATE_INVALID");
  if (source.publishedAt != null) {
    if (!isValidTimestamp(source.publishedAt)) {
      issues.push("SOURCE_PUBLICATION_DATE_INVALID");
    } else if (
      isValidTimestamp(source.retrievedAt) &&
      Date.parse(source.publishedAt) > Date.parse(source.retrievedAt)
    ) {
      issues.push("SOURCE_DATE_ORDER_INVALID");
    }
  }
  return issues;
}

export function validateEvidenceRecord(evidence: ResearchEvidence): ProvenanceIssue[] {
  const issues: ProvenanceIssue[] = [];
  if (!evidence.id?.trim()) issues.push("EVIDENCE_ID_REQUIRED");
  if (!evidence.sourceId?.trim()) issues.push("EVIDENCE_SOURCE_REQUIRED");
  if (!evidence.collectionMethod?.trim()) issues.push("EVIDENCE_METHOD_REQUIRED");
  if (!isValidTimestamp(evidence.retrievedAt)) {
    issues.push("EVIDENCE_RETRIEVAL_DATE_INVALID");
  }
  if (!/^[a-f0-9]{64}$/i.test(evidence.sha256)) {
    issues.push("EVIDENCE_CHECKSUM_INVALID");
  }
  if (!evidence.storageRef?.trim()) issues.push("EVIDENCE_STORAGE_REF_REQUIRED");
  return issues;
}

export function assessClaim(
  claim: ResearchClaim,
  sources: ResearchSource[],
  evidenceRecords: ResearchEvidence[],
): ClaimAssessment {
  const blockers: ProvenanceIssue[] = [];
  if (claim.status !== "verified") blockers.push("CLAIM_STATUS_NOT_VERIFIED");
  if (claim.sourceIds.length === 0) blockers.push("CLAIM_SOURCE_REQUIRED");
  if (claim.evidenceIds.length === 0) blockers.push("CLAIM_EVIDENCE_REQUIRED");

  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const evidenceById = new Map(evidenceRecords.map((item) => [item.id, item]));

  for (const sourceId of claim.sourceIds) {
    const source = sourceById.get(sourceId);
    if (!source) {
      blockers.push("CLAIM_SOURCE_NOT_FOUND");
    } else if (validateSourceRecord(source).length > 0) {
      blockers.push("CLAIM_SOURCE_INVALID");
    }
  }

  for (const evidenceId of claim.evidenceIds) {
    const item = evidenceById.get(evidenceId);
    if (!item) {
      blockers.push("CLAIM_EVIDENCE_NOT_FOUND");
      continue;
    }
    if (validateEvidenceRecord(item).length > 0) {
      blockers.push("CLAIM_EVIDENCE_INVALID");
    }
    if (!claim.sourceIds.includes(item.sourceId)) {
      blockers.push("CLAIM_EVIDENCE_SOURCE_MISMATCH");
    }
    if (item.verificationStatus !== "verified") {
      blockers.push("CLAIM_EVIDENCE_NOT_VERIFIED");
    }
  }

  return {
    allowed: blockers.length === 0,
    blockers: [...new Set(blockers)],
  };
}
