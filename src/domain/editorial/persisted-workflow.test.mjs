import assert from "node:assert/strict";
import test from "node:test";

import {
  executeEditorialReviewAction,
  executeEditorialWorkflowCommand,
  type EditorialAuditEvent,
  type EditorialWorkflowStore,
  type StoredEditorialArticle,
} from "./persisted-workflow.ts";

const initialArticle: StoredEditorialArticle = {
  id: "article-1",
  workflowStatus: "approved",
  revision: 4,
  authorId: "author-1",
  editorId: "editor-1",
  factCheckerId: "checker-1",
  approvedById: "editor-1",
  approvedAt: "2026-11-15T10:00:00.000Z",
  factCheckComplete: true,
  disclosuresReviewed: true,
  scheduledFor: null,
  publishedAt: null,
  correctionStatus: "none",
  correctionReason: null,
};

class MemoryStore implements EditorialWorkflowStore {
  article = { ...initialArticle };
  claims = [{ id: "claim-1", sourceIds: ["source-1"] }];
  auditEvents: EditorialAuditEvent[] = [];
  snapshot: { article: StoredEditorialArticle; auditEvents: EditorialAuditEvent[] } | null = null;
  failAudit = false;
  committed = false;
  rolledBack = false;

  async beginTransaction() {
    this.snapshot = {
      article: { ...this.article },
      auditEvents: [...this.auditEvents],
    };
    return "transaction-1";
  }

  async getArticle(id: string) {
    return id === this.article.id ? { ...this.article } : null;
  }

  async getMaterialClaims() {
    return this.claims;
  }

  async compareAndSwapArticle(
    id: string,
    expectedRevision: number,
    expectedStatus: StoredEditorialArticle["workflowStatus"],
    changes: Record<string, unknown>,
  ) {
    if (
      id !== this.article.id ||
      expectedRevision !== this.article.revision ||
      expectedStatus !== this.article.workflowStatus
    ) {
      return false;
    }
    this.article = { ...this.article, ...changes } as StoredEditorialArticle;
    return true;
  }

  async appendAuditEvent(event: EditorialAuditEvent) {
    if (this.failAudit) throw new Error("audit storage unavailable");
    this.auditEvents.push(event);
  }

  async commitTransaction() {
    this.committed = true;
    this.snapshot = null;
  }

  async rollbackTransaction() {
    this.rolledBack = true;
    if (this.snapshot) {
      this.article = { ...this.snapshot.article };
      this.auditEvents = [...this.snapshot.auditEvents];
      this.snapshot = null;
    }
  }
}

const editor = { id: "editor-1", role: "editor" as const, isHuman: true, active: true };
const scheduler = { id: "system:scheduler", role: "service" as const, isHuman: false, active: true };
const now = "2026-11-15T12:00:00.000Z";

test("commits article transition and immutable audit event in the same transaction", async () => {
  const store = new MemoryStore();
  const result = await executeEditorialWorkflowCommand(store, editor, {
    articleId: "article-1",
    expectedRevision: 4,
    targetStatus: "published",
    now,
  });

  assert.equal(result.ok, true);
  assert.equal(store.article.workflowStatus, "published");
  assert.equal(store.article.publishedAt, now);
  assert.equal(store.auditEvents.length, 1);
  assert.equal(store.committed, true);
  assert.equal(store.rolledBack, false);
});

test("rolls back the article update when the audit event cannot be persisted", async () => {
  const store = new MemoryStore();
  store.failAudit = true;

  await assert.rejects(
    executeEditorialWorkflowCommand(store, editor, {
      articleId: "article-1",
      expectedRevision: 4,
      targetStatus: "published",
      now,
    }),
    /audit storage unavailable/,
  );

  assert.equal(store.article.workflowStatus, "approved");
  assert.equal(store.auditEvents.length, 0);
  assert.equal(store.rolledBack, true);
  assert.equal(store.committed, false);
});

test("rejects stale revisions without changing the article", async () => {
  const store = new MemoryStore();
  const result = await executeEditorialWorkflowCommand(store, editor, {
    articleId: "article-1",
    expectedRevision: 3,
    targetStatus: "published",
    now,
  });

  assert.equal(result.ok, false);
  if (!result.ok) assert.ok(result.blockers.includes("REVISION_CONFLICT"));
  assert.equal(store.article.workflowStatus, "approved");
  assert.equal(store.auditEvents.length, 0);
});

test("allows the scheduler to publish only a due record with prior human approval", async () => {
  const store = new MemoryStore();
  store.article = {
    ...initialArticle,
    workflowStatus: "scheduled",
    scheduledFor: "2026-11-15T11:00:00.000Z",
  };
  const result = await executeEditorialWorkflowCommand(store, scheduler, {
    articleId: "article-1",
    expectedRevision: 4,
    targetStatus: "published",
    now,
  });

  assert.equal(result.ok, true);
  assert.equal(store.article.workflowStatus, "published");
  assert.equal(store.auditEvents[0]?.actorRole, "service");
});

test("does not let the scheduler publish before the approved schedule time", async () => {
  const store = new MemoryStore();
  store.article = {
    ...initialArticle,
    workflowStatus: "scheduled",
    scheduledFor: "2026-11-15T13:00:00.000Z",
  };
  const result = await executeEditorialWorkflowCommand(store, scheduler, {
    articleId: "article-1",
    expectedRevision: 4,
    targetStatus: "published",
    now,
  });

  assert.equal(result.ok, false);
  if (!result.ok) assert.ok(result.blockers.includes("SCHEDULE_TIME_NOT_REACHED"));
  assert.equal(store.article.workflowStatus, "scheduled");
});

test("requires the assigned fact-checker to complete fact-checking", async () => {
  const store = new MemoryStore();
  store.article = { ...initialArticle, workflowStatus: "fact_check", factCheckComplete: false };
  const result = await executeEditorialReviewAction(
    store,
    { id: "checker-1", role: "fact_checker", isHuman: true, active: true },
    {
      articleId: "article-1",
      expectedRevision: 4,
      action: "complete_fact_check",
      now,
    },
  );

  assert.equal(result.ok, true);
  assert.equal(store.article.factCheckComplete, true);
  assert.equal(store.article.revision, 5);
  assert.equal(store.auditEvents.length, 1);
});

test("rejects a fact-checker who is not assigned to the article", async () => {
  const store = new MemoryStore();
  store.article = { ...initialArticle, workflowStatus: "fact_check", factCheckComplete: false };
  const result = await executeEditorialReviewAction(
    store,
    { id: "checker-2", role: "fact_checker", isHuman: true, active: true },
    {
      articleId: "article-1",
      expectedRevision: 4,
      action: "complete_fact_check",
      now,
    },
  );

  assert.equal(result.ok, false);
  if (!result.ok) assert.ok(result.blockers.includes("ACTOR_NOT_AUTHORIZED"));
  assert.equal(store.article.factCheckComplete, false);
});

test("requires the assigned editor to review disclosures", async () => {
  const store = new MemoryStore();
  store.article = {
    ...initialArticle,
    workflowStatus: "editorial_review",
    disclosuresReviewed: false,
  };
  const result = await executeEditorialReviewAction(store, editor, {
    articleId: "article-1",
    expectedRevision: 4,
    action: "review_disclosures",
    now,
  });

  assert.equal(result.ok, true);
  assert.equal(store.article.disclosuresReviewed, true);
  assert.equal(store.auditEvents.length, 1);
});
