export type EditorialRole = "reader" | "author" | "editor" | "administrator" | "service";
export interface PublishingActor {
  id: string;
  role: EditorialRole;
  isHuman: boolean;
}
export interface MaterialClaim {
  id: string;
  sourceIds: string[];
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
  | "CLAIM_WITHOUT_SOURCE";

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
  if (record.claims.some((claim) => claim.sourceIds.length === 0))
    blockers.push("CLAIM_WITHOUT_SOURCE");
  return blockers;
}
export function canPublish(record: PublicationRecord, actor: PublishingActor): boolean {
  return getPublicationBlockers(record, actor).length === 0;
}
