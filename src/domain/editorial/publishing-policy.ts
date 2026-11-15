export type EditorialRole = "reader" | "author" | "editor" | "administrator" | "service";
export interface PublishingActor {
  id: string;
  role: EditorialRole;
  isHuman: boolean;
}
export interface MaterialEvidence {
  id: string;
  sourceId: string;
  verificationStatus: string;
}
export interface MaterialClaim {
  id: string;
  sourceIds: string[];
  verificationStatus: string;
  evidence: MaterialEvidence[];
}
export interface PublicationRecord {
  status:
    | "pitch"
    | "research"
    | "draft"
    | "fact_check"
    | "editorial_review"
    | "approved"
    | "published";
  authorId: string | null;
  editorId: string | null;
  approvedById: string | null;
  approvedAt: string | null;
  claims: MaterialClaim[];
  factCheckComplete: boolean;
  disclosuresReviewed: boolean;
}
export type PublicationBlocker =
  | "ACTOR_NOT_HUMAN"
  | "ACTOR_NOT_EDITOR"
  | "ACTOR_NOT_ASSIGNED_EDITOR"
  | "AUTHOR_MISSING"
  | "EDITOR_MISSING"
  | "APPROVAL_REQUIRED"
  | "APPROVAL_ACTOR_MISMATCH"
  | "FACT_CHECK_INCOMPLETE"
  | "DISCLOSURES_NOT_REVIEWED"
  | "CLAIM_WITHOUT_SOURCE"
  | "CLAIM_NOT_VERIFIED"
  | "CLAIM_EVIDENCE_REQUIRED"
  | "CLAIM_EVIDENCE_NOT_VERIFIED"
  | "CLAIM_EVIDENCE_SOURCE_MISMATCH";

export function getClaimVerificationBlockers(claims: MaterialClaim[]): PublicationBlocker[] {
  const blockers: PublicationBlocker[] = [];
  for (const claim of claims) {
    const sourceIds = Array.isArray(claim.sourceIds) ? claim.sourceIds : [];
    const evidenceItems = Array.isArray(claim.evidence) ? claim.evidence : [];
    if (sourceIds.length === 0) blockers.push("CLAIM_WITHOUT_SOURCE");
    if (claim.verificationStatus !== "verified") blockers.push("CLAIM_NOT_VERIFIED");
    if (evidenceItems.length === 0) blockers.push("CLAIM_EVIDENCE_REQUIRED");
    for (const evidence of evidenceItems) {
      if (evidence.verificationStatus !== "verified") {
        blockers.push("CLAIM_EVIDENCE_NOT_VERIFIED");
      }
      if (!sourceIds.includes(evidence.sourceId)) {
        blockers.push("CLAIM_EVIDENCE_SOURCE_MISMATCH");
      }
    }
  }
  return blockers;
}

export function getPublicationBlockers(
  record: PublicationRecord,
  actor: PublishingActor,
): PublicationBlocker[] {
  const blockers: PublicationBlocker[] = [];
  if (!actor.isHuman) blockers.push("ACTOR_NOT_HUMAN");
  if (actor.role !== "editor") blockers.push("ACTOR_NOT_EDITOR");
  if (record.editorId !== actor.id) blockers.push("ACTOR_NOT_ASSIGNED_EDITOR");
  if (!record.authorId) blockers.push("AUTHOR_MISSING");
  if (!record.editorId) blockers.push("EDITOR_MISSING");
  if (
    record.status !== "approved" ||
    !record.approvedAt ||
    Number.isNaN(Date.parse(record.approvedAt)) ||
    !record.approvedById
  )
    blockers.push("APPROVAL_REQUIRED");
  if (record.approvedById && record.approvedById !== actor.id)
    blockers.push("APPROVAL_ACTOR_MISMATCH");
  if (!record.factCheckComplete) blockers.push("FACT_CHECK_INCOMPLETE");
  if (!record.disclosuresReviewed) blockers.push("DISCLOSURES_NOT_REVIEWED");
  blockers.push(...getClaimVerificationBlockers(record.claims));
  return blockers;
}
export function canPublish(record: PublicationRecord, actor: PublishingActor): boolean {
  return getPublicationBlockers(record, actor).length === 0;
}
