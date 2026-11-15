import { createHash } from "node:crypto";

import type { PublishingActor } from "./publishing-policy.ts";
import { transitionPublication, type WorkflowStatus } from "./workflow.ts";

export interface StoredEditorialArticle {
  id: string;
  workflowStatus: WorkflowStatus;
  revision: number;
  authorId: string | null;
  editorId: string | null;
  factCheckerId: string | null;
  approvedById: string | null;
  approvedAt: string | null;
  factCheckComplete: boolean;
  disclosuresReviewed: boolean;
  scheduledFor: string | null;
  publishedAt: string | null;
  correctionStatus: "none" | "open" | "resolved";
  correctionReason: string | null;
}

export interface EditorialAuditEvent {
  eventId: string;
  actorId: string;
  actorRole: string;
  action: string;
  resource: "articles";
  resourceId: string;
  beforeDigest: string;
  afterDigest: string;
  correlationId: string;
  outcome: "success";
}

export interface EditorialWorkflowStore {
  beginTransaction(): Promise<string | null>;
  getArticle(id: string, transactionId: string): Promise<StoredEditorialArticle | null>;
  getMaterialClaims(articleId: string, transactionId: string): Promise<Array<{ id: string; sourceIds: string[] }>>;
  compareAndSwapArticle(id: string, expectedRevision: number, expectedStatus: WorkflowStatus, changes: Record<string, unknown>, transactionId: string): Promise<boolean>;
  appendAuditEvent(event: EditorialAuditEvent, transactionId: string): Promise<void>;
  commitTransaction(transactionId: string): Promise<void>;
  rollbackTransaction(transactionId: string): Promise<void>;
}

export interface EditorialWorkflowCommand {
  articleId: string;
  expectedRevision: number;
  targetStatus: WorkflowStatus;
  scheduledFor?: string;
  correctionReason?: string;
  correctionPublicNote?: string;
  now?: string;
  correlationId?: string;
}

export type EditorialWorkflowActor = Omit<PublishingActor, "role"> & {
  role: PublishingActor["role"] | "fact_checker" | "researcher";
  active?: boolean;
};

export type EditorialWorkflowCommandResult =
  | { ok: true; article: StoredEditorialArticle }
  | { ok: false; status: 400 | 403 | 404 | 409; blockers: string[] };

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function snapshot(article: StoredEditorialArticle): Record<string, unknown> {
  return {
    id: article.id,
    workflowStatus: article.workflowStatus,
    revision: article.revision,
    approvedById: article.approvedById,
    approvedAt: article.approvedAt,
    scheduledFor: article.scheduledFor,
    publishedAt: article.publishedAt,
    correctionStatus: article.correctionStatus,
    correctionReason: article.correctionReason,
  };
}

function rollbackResult(store: EditorialWorkflowStore, transactionId: string, status: 400 | 403 | 404 | 409, ...blockers: string[]): Promise<EditorialWorkflowCommandResult> {
  return store.rollbackTransaction(transactionId).then(() => ({ ok: false, status, blockers }));
}

export async function executeEditorialWorkflowCommand(
  store: EditorialWorkflowStore,
  actor: EditorialWorkflowActor,
  command: EditorialWorkflowCommand,
): Promise<EditorialWorkflowCommandResult> {
  if (actor.active === false || (!actor.isHuman && actor.role !== "service")) {
    return { ok: false, status: 403, blockers: ["ACTOR_NOT_AUTHORIZED"] };
  }
  if (!command.articleId.trim() || !Number.isInteger(command.expectedRevision) || command.expectedRevision < 1) {
    return { ok: false, status: 400, blockers: ["COMMAND_INVALID"] };
  }
  if (!["author", "editor", "administrator", "service"].includes(actor.role)) {
    return { ok: false, status: 403, blockers: ["ACTOR_NOT_AUTHORIZED"] };
  }
  if (actor.role === "service" && (actor.isHuman || command.targetStatus !== "published")) {
    return { ok: false, status: 403, blockers: ["SERVICE_TRANSITION_NOT_ALLOWED"] };
  }

  const transactionId = await store.beginTransaction();
  if (!transactionId) throw new Error("EDITORIAL_TRANSACTIONS_REQUIRED");

  try {
    const article = await store.getArticle(command.articleId, transactionId);
    if (!article) return await rollbackResult(store, transactionId, 404, "ARTICLE_NOT_FOUND");
    if (article.revision !== command.expectedRevision) {
      return await rollbackResult(store, transactionId, 409, "REVISION_CONFLICT");
    }

    const claims = await store.getMaterialClaims(article.id, transactionId);
    const now = command.now ?? new Date().toISOString();
    const transition = transitionPublication(
      {
        status: article.workflowStatus,
        revision: article.revision,
        authorId: article.authorId,
        editorId: article.editorId,
        approvedById: article.approvedById,
        approvedAt: article.approvedAt,
        factCheckComplete: article.factCheckComplete,
        disclosuresReviewed: article.disclosuresReviewed,
        claims,
        scheduledFor: article.scheduledFor,
      },
      actor as PublishingActor,
      command.targetStatus,
      { now, scheduledFor: command.scheduledFor, correctionReason: command.correctionReason },
    );

    if (!transition.ok) {
      return await rollbackResult(store, transactionId, 409, ...transition.blockers);
    }

    const next = transition.record;
    const changes: Record<string, unknown> = {
      workflowStatus: next.status,
      revision: next.revision,
      scheduledFor: next.scheduledFor ?? null,
    };

    if (next.approvedById !== article.approvedById) changes.approvedBy = next.approvedById;
    if (next.approvedAt !== article.approvedAt) changes.approvedAt = next.approvedAt;
    if (next.status === "published") {
      changes.publishedAt = now;
      changes._status = "published";
    }
    if (next.status === "correction_required") {
      changes.correctionStatus = "open";
      changes.correctionReason = command.correctionReason?.trim();
      changes.correctionPublicNote = command.correctionPublicNote?.trim() || null;
      changes.correctionRequestedAt = now;
      changes.correctionResolvedAt = null;
      changes.correctionResolvedBy = null;
    } else if (next.status === "published" && article.correctionStatus === "open") {
      changes.correctionStatus = "resolved";
      changes.correctionResolvedAt = now;
      changes.correctionResolvedBy = actor.id;
    }

    if (!(await store.compareAndSwapArticle(article.id, command.expectedRevision, article.workflowStatus, changes, transactionId))) {
      return await rollbackResult(store, transactionId, 409, "REVISION_CONFLICT");
    }

    const updated: StoredEditorialArticle = {
      ...article,
      workflowStatus: next.status,
      revision: next.revision,
      approvedById: next.approvedById,
      approvedAt: next.approvedAt,
      scheduledFor: next.scheduledFor ?? null,
      publishedAt: next.status === "published" ? now : article.publishedAt,
      correctionStatus:
        next.status === "correction_required"
          ? "open"
          : next.status === "published" && article.correctionStatus === "open"
            ? "resolved"
            : article.correctionStatus,
      correctionReason:
        next.status === "correction_required"
          ? command.correctionReason?.trim() ?? null
          : article.correctionReason,
    };

    await store.appendAuditEvent(
      {
        eventId: crypto.randomUUID(),
        actorId: actor.id,
        actorRole: actor.role,
        action: \`article.workflow.\${next.status}\`,
        resource: "articles",
        resourceId: article.id,
        beforeDigest: digest(snapshot(article)),
        afterDigest: digest(snapshot(updated)),
        correlationId: command.correlationId ?? crypto.randomUUID(),
        outcome: "success",
      },
      transactionId,
    );
    await store.commitTransaction(transactionId);
    return { ok: true, article: updated };
  } catch (error) {
    await store.rollbackTransaction(transactionId);
    throw error;
  }
}

export type EditorialReviewAction = "complete_fact_check" | "review_disclosures";

export async function executeEditorialReviewAction(
  store: EditorialWorkflowStore,
  actor: EditorialWorkflowActor,
  input: { articleId: string; expectedRevision: number; action: EditorialReviewAction; now?: string; correlationId?: string },
): Promise<EditorialWorkflowCommandResult> {
  if (actor.active === false || !actor.isHuman) {
    return { ok: false, status: 403, blockers: ["ACTOR_NOT_AUTHORIZED"] };
  }
  if (!input.articleId.trim() || !Number.isInteger(input.expectedRevision) || input.expectedRevision < 1) {
    return { ok: false, status: 400, blockers: ["COMMAND_INVALID"] };
  }

  const transactionId = await store.beginTransaction();
  if (!transactionId) throw new Error("EDITORIAL_TRANSACTIONS_REQUIRED");

  try {
    const article = await store.getArticle(input.articleId, transactionId);
    if (!article) return await rollbackResult(store, transactionId, 404, "ARTICLE_NOT_FOUND");
    if (article.revision !== input.expectedRevision) {
      return await rollbackResult(store, transactionId, 409, "REVISION_CONFLICT");
    }

    const allowed =
      (input.action === "complete_fact_check" && actor.role === "fact_checker" && article.workflowStatus === "fact_check") ||
      (input.action === "review_disclosures" && actor.role === "editor" && article.editorId === actor.id && article.workflowStatus === "editorial_review");
    if (!allowed) {
      return await rollbackResult(store, transactionId, 403, "ACTOR_NOT_AUTHORIZED");
    }

    const changes =
      input.action === "complete_fact_check"
        ? { factCheckComplete: true, revision: article.revision + 1 }
        : { disclosuresReviewed: true, revision: article.revision + 1 };
    if (!(await store.compareAndSwapArticle(article.id, input.expectedRevision, article.workflowStatus, changes, transactionId))) {
      return await rollbackResult(store, transactionId, 409, "REVISION_CONFLICT");
    }

    const updated = { ...article, ...changes } as StoredEditorialArticle;
    await store.appendAuditEvent(
      {
        eventId: crypto.randomUUID(),
        actorId: actor.id,
        actorRole: actor.role,
        action: \`article.review.\${input.action}\`,
        resource: "articles",
        resourceId: article.id,
        beforeDigest: digest(snapshot(article)),
        afterDigest: digest(snapshot(updated)),
        correlationId: input.correlationId ?? crypto.randomUUID(),
        outcome: "success",
      },
      transactionId,
    );
    await store.commitTransaction(transactionId);
    return { ok: true, article: updated };
  } catch (error) {
    await store.rollbackTransaction(transactionId);
    throw error;
  }
}
