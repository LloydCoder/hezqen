import {
  canPublish,
  type PublicationRecord,
  type PublishingActor,
} from "./publishing-policy.ts";

export type WorkflowStatus =
  | PublicationRecord["status"]
  | "scheduled"
  | "correction_required"
  | "archived";

export interface EditorialWorkflowRecord extends Omit<PublicationRecord, "status"> {
  status: WorkflowStatus;
  revision: number;
  scheduledFor?: string | null;
}

export interface WorkflowOptions {
  now?: string;
  scheduledFor?: string;
}

export type WorkflowBlocker =
  | "INVALID_TRANSITION"
  | "ACTOR_NOT_AUTHORIZED"
  | "FACT_CHECK_INCOMPLETE"
  | "AUTHOR_EDITOR_CONFLICT"
  | "PUBLICATION_BLOCKED"
  | "SCHEDULE_TIME_REQUIRED"
  | "SCHEDULE_TIME_INVALID"
  | "SCHEDULE_TIME_NOT_REACHED";

export type WorkflowTransitionResult =
  | { ok: true; record: EditorialWorkflowRecord }
  | { ok: false; blockers: WorkflowBlocker[] };

function isHumanAssignedEditor(
  record: EditorialWorkflowRecord,
  actor: PublishingActor,
): boolean {
  return actor.isHuman && actor.role === "editor" && actor.id === record.editorId;
}

function isAssignedContributor(
  record: EditorialWorkflowRecord,
  actor: PublishingActor,
): boolean {
  return (
    actor.isHuman &&
    ((actor.role === "author" && actor.id === record.authorId) ||
      (actor.role === "editor" && actor.id === record.editorId))
  );
}

function resultWithBlockers(...blockers: WorkflowBlocker[]): WorkflowTransitionResult {
  return { ok: false, blockers };
}

export function transitionPublication(
  record: EditorialWorkflowRecord,
  actor: PublishingActor,
  targetStatus: WorkflowStatus,
  options: WorkflowOptions = {},
): WorkflowTransitionResult {
  const now = options.now ?? new Date().toISOString();
  const nowMs = Date.parse(now);
  if (Number.isNaN(nowMs)) {
    return resultWithBlockers("SCHEDULE_TIME_INVALID");
  }

  if (record.status === targetStatus) {
    return resultWithBlockers("INVALID_TRANSITION");
  }

  if (
    (record.status === "pitch" && targetStatus === "research") ||
    (record.status === "research" && targetStatus === "draft") ||
    (record.status === "draft" && targetStatus === "fact_check")
  ) {
    if (!isAssignedContributor(record, actor)) {
      return resultWithBlockers("ACTOR_NOT_AUTHORIZED");
    }
    return { ok: true, record: { ...record, status: targetStatus } };
  }

  if (record.status === "fact_check" && targetStatus === "editorial_review") {
    if (!isHumanAssignedEditor(record, actor)) {
      return resultWithBlockers("ACTOR_NOT_AUTHORIZED");
    }
    if (!record.factCheckComplete) {
      return resultWithBlockers("FACT_CHECK_INCOMPLETE");
    }
    return { ok: true, record: { ...record, status: "editorial_review" } };
  }

  if (record.status === "editorial_review" && targetStatus === "draft") {
    if (!isHumanAssignedEditor(record, actor)) {
      return resultWithBlockers("ACTOR_NOT_AUTHORIZED");
    }
    return { ok: true, record: { ...record, status: "draft" } };
  }

  if (record.status === "editorial_review" && targetStatus === "approved") {
    if (record.authorId === record.editorId) {
      return resultWithBlockers("AUTHOR_EDITOR_CONFLICT");
    }
    if (!isHumanAssignedEditor(record, actor)) {
      return resultWithBlockers("ACTOR_NOT_AUTHORIZED");
    }
    const candidate: EditorialWorkflowRecord = {
      ...record,
      status: "approved",
      approvedById: actor.id,
      approvedAt: now,
    };
    if (!canPublish(candidate, actor)) {
      return resultWithBlockers("PUBLICATION_BLOCKED");
    }
    return { ok: true, record: candidate };
  }

  if (record.status === "approved" && targetStatus === "scheduled") {
    if (!isHumanAssignedEditor(record, actor)) {
      return resultWithBlockers("ACTOR_NOT_AUTHORIZED");
    }
    if (!options.scheduledFor) {
      return resultWithBlockers("SCHEDULE_TIME_REQUIRED");
    }
    const scheduledMs = Date.parse(options.scheduledFor);
    if (Number.isNaN(scheduledMs)) {
      return resultWithBlockers("SCHEDULE_TIME_INVALID");
    }
    if (scheduledMs <= nowMs) {
      return resultWithBlockers("SCHEDULE_TIME_INVALID");
    }
    return {
      ok: true,
      record: { ...record, status: "scheduled", scheduledFor: options.scheduledFor },
    };
  }

  if (
    (record.status === "approved" || record.status === "scheduled") &&
    targetStatus === "published"
  ) {
    if (!isHumanAssignedEditor(record, actor)) {
      return resultWithBlockers("ACTOR_NOT_AUTHORIZED");
    }
    if (record.status === "scheduled") {
      if (!record.scheduledFor || Number.isNaN(Date.parse(record.scheduledFor))) {
        return resultWithBlockers("SCHEDULE_TIME_INVALID");
      }
      if (Date.parse(record.scheduledFor) > nowMs) {
        return resultWithBlockers("SCHEDULE_TIME_NOT_REACHED");
      }
    }
    const approvedRecord: PublicationRecord = { ...record, status: "approved" };
    if (!canPublish(approvedRecord, actor)) {
      return resultWithBlockers("PUBLICATION_BLOCKED");
    }
    return { ok: true, record: { ...record, status: "published" } };
  }

  if (
    record.status === "published" &&
    (targetStatus === "correction_required" || targetStatus === "archived")
  ) {
    if (!isHumanAssignedEditor(record, actor)) {
      return resultWithBlockers("ACTOR_NOT_AUTHORIZED");
    }
    return { ok: true, record: { ...record, status: targetStatus } };
  }

  if (record.status === "correction_required" && targetStatus === "draft") {
    if (!isHumanAssignedEditor(record, actor)) {
      return resultWithBlockers("ACTOR_NOT_AUTHORIZED");
    }
    return {
      ok: true,
      record: {
        ...record,
        status: "draft",
        revision: record.revision + 1,
        approvedById: null,
        approvedAt: null,
        factCheckComplete: false,
        disclosuresReviewed: false,
        scheduledFor: null,
      },
    };
  }

  return resultWithBlockers("INVALID_TRANSITION");
}
