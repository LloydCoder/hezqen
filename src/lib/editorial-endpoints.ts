import type { Endpoint, PayloadRequest } from "payload";

import {
  executeEditorialReviewAction,
  executeEditorialWorkflowCommand,
  type EditorialWorkflowActor,
  type EditorialWorkflowStore,
  type StoredEditorialArticle,
  type EditorialAuditEvent,
} from "../domain/editorial/persisted-workflow.ts";
import type { WorkflowStatus } from "../domain/editorial/workflow.ts";

type RawRecord = Record<string, unknown>;

function asRecord(value: unknown): RawRecord {
  return value && typeof value === "object" ? (value as RawRecord) : {};
}

function relationshipId(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === "string" || typeof id === "number") return String(id);
  }
  return null;
}

function relationIds(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map(relationshipId).filter((id): id is string => id !== null)
    : [];
}

function normalizeArticle(value: unknown): StoredEditorialArticle {
  const doc = asRecord(value);
  return {
    id: String(doc.id),
    workflowStatus: doc.workflowStatus as WorkflowStatus,
    revision: Number(doc.revision),
    authorId: relationshipId(doc.author),
    editorId: relationshipId(doc.assignedEditor),
    factCheckerId: relationshipId(doc.assignedFactChecker),
    approvedById: relationshipId(doc.approvedBy),
    approvedAt: typeof doc.approvedAt === "string" ? doc.approvedAt : null,
    factCheckComplete: doc.factCheckComplete === true,
    disclosuresReviewed: doc.disclosuresReviewed === true,
    scheduledFor: typeof doc.scheduledFor === "string" ? doc.scheduledFor : null,
    publishedAt: typeof doc.publishedAt === "string" ? doc.publishedAt : null,
    correctionStatus:
      doc.correctionStatus === "open" || doc.correctionStatus === "resolved"
        ? doc.correctionStatus
        : "none",
    correctionReason: typeof doc.correctionReason === "string" ? doc.correctionReason : null,
  };
}

class PayloadEditorialWorkflowStore implements EditorialWorkflowStore {
  constructor(private readonly req: PayloadRequest) {}

  async beginTransaction(): Promise<string | number | null> {
    const transactionId = await this.req.payload.db.beginTransaction();
    if (transactionId) this.req.transactionID = transactionId;
    return transactionId;
  }

  async getArticle(id: string): Promise<StoredEditorialArticle | null> {
    const result = await this.req.payload.find({
      collection: "articles",
      where: { id: { equals: id } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req: this.req,
    });
    const doc = result.docs[0];
    return doc ? normalizeArticle(doc) : null;
  }

  async getMaterialClaims(articleId: string): Promise<Array<{ id: string; sourceIds: string[] }>> {
    const result = await this.req.payload.find({
      collection: "claims",
      where: {
        and: [{ article: { equals: articleId } }, { material: { equals: true } }],
      },
      limit: 500,
      depth: 0,
      overrideAccess: true,
      req: this.req,
    });
    return result.docs.map((item) => {
      const claim = asRecord(item);
      return {
        id: String(claim.id),
        sourceIds: relationIds(claim.sources),
      };
    });
  }

  async compareAndSwapArticle(
    id: string,
    expectedRevision: number,
    expectedStatus: WorkflowStatus,
    expectedAuthorId: string | null,
    expectedEditorId: string | null,
    expectedFactCheckerId: string | null,
    changes: Record<string, unknown>,
  ): Promise<boolean> {
    const mutableRequest = this.req as unknown as {
      context?: Record<string, unknown>;
    };
    const previousContext = mutableRequest.context;
    mutableRequest.context = {
      ...(previousContext ?? {}),
      hezqenSkipArticleRevisionIncrement: true,
    };
    try {
      const result = await this.req.payload.update({
        collection: "articles",
        where: {
          and: [
            { id: { equals: id } },
            { revision: { equals: expectedRevision } },
            { workflowStatus: { equals: expectedStatus } },
            { author: { equals: expectedAuthorId } },
            { assignedEditor: { equals: expectedEditorId } },
            { assignedFactChecker: { equals: expectedFactCheckerId } },
          ],
        },
        data: changes,
        limit: 1,
        depth: 0,
        overrideAccess: true,
        req: this.req,
      });
      return result.docs.length === 1;
    } finally {
      if (previousContext) mutableRequest.context = previousContext;
      else delete mutableRequest.context;
    }
  }

  async appendAuditEvent(event: EditorialAuditEvent): Promise<void> {
    await this.req.payload.create({
      collection: "audit-events",
      data: event,
      overrideAccess: true,
      req: this.req,
    });
  }

  async commitTransaction(transactionId: string | number): Promise<void> {
    await this.req.payload.db.commitTransaction(transactionId);
    delete this.req.transactionID;
  }

  async rollbackTransaction(transactionId: string | number): Promise<void> {
    await this.req.payload.db.rollbackTransaction(transactionId);
    delete this.req.transactionID;
  }
}

function actorFromRequest(req: PayloadRequest): EditorialWorkflowActor | null {
  if (!req.user) return null;
  const user = req.user as unknown as RawRecord;
  const role = typeof user.role === "string" ? user.role : "";
  if (!["author", "editor", "administrator", "fact_checker", "researcher"].includes(role)) {
    return null;
  }
  return {
    id: String(user.id),
    role: role as EditorialWorkflowActor["role"],
    isHuman: true,
    active: user.active !== false,
  };
}

function correlationId(req: PayloadRequest): string {
  return req.headers.get("x-request-id")?.slice(0, 128) || crypto.randomUUID();
}

function isWorkflowStatus(value: unknown): value is WorkflowStatus {
  return [
    "pitch",
    "research",
    "draft",
    "fact_check",
    "editorial_review",
    "approved",
    "scheduled",
    "published",
    "correction_required",
    "archived",
  ].includes(String(value));
}

export const editorialWorkflowEndpoint: Endpoint = {
  path: "/editorial/workflow",
  method: "post",
  handler: async (req) => {
    const actor = actorFromRequest(req);
    if (!actor) return Response.json({ error: "Authentication required." }, { status: 401 });
    if (actor.active === false)
      return Response.json({ error: "Account disabled." }, { status: 403 });

    const body = asRecord(await req.json().catch(() => null));
    const articleId = typeof body.articleId === "string" ? body.articleId.trim() : "";
    const correctionReason =
      typeof body.correctionReason === "string" ? body.correctionReason.trim() : undefined;
    const correctionPublicNote =
      typeof body.correctionPublicNote === "string"
        ? body.correctionPublicNote.trim()
        : undefined;
    const scheduledFor =
      typeof body.scheduledFor === "string" ? body.scheduledFor.trim() : undefined;
    if (
      !articleId ||
      articleId.length > 128 ||
      typeof body.expectedRevision !== "number" ||
      !Number.isInteger(body.expectedRevision) ||
      !isWorkflowStatus(body.targetStatus) ||
      (correctionReason !== undefined && correctionReason.length > 2000) ||
      (correctionPublicNote !== undefined && correctionPublicNote.length > 2000) ||
      (scheduledFor !== undefined && scheduledFor.length > 64)
    ) {
      return Response.json({ error: "Invalid workflow command." }, { status: 400 });
    }

    try {
      const result = await executeEditorialWorkflowCommand(
        new PayloadEditorialWorkflowStore(req),
        actor,
        {
          articleId,
          expectedRevision: body.expectedRevision,
          targetStatus: body.targetStatus,
          scheduledFor,
          correctionReason,
          correctionPublicNote,
          correlationId: correlationId(req),
        },
      );
      return Response.json(result, { status: result.ok ? 200 : result.status });
    } catch (error) {
      const code = error instanceof Error ? error.message : "EDITORIAL_WORKFLOW_FAILED";
      const status = code === "EDITORIAL_TRANSACTIONS_REQUIRED" ? 503 : 500;
      return Response.json({ error: "Editorial workflow command failed.", code }, { status });
    }
  },
};

export const editorialReviewEndpoint: Endpoint = {
  path: "/editorial/review",
  method: "post",
  handler: async (req) => {
    const actor = actorFromRequest(req);
    if (!actor) return Response.json({ error: "Authentication required." }, { status: 401 });
    const body = asRecord(await req.json().catch(() => null));
    const articleId = typeof body.articleId === "string" ? body.articleId.trim() : "";
    if (
      !articleId ||
      articleId.length > 128 ||
      typeof body.expectedRevision !== "number" ||
      !Number.isInteger(body.expectedRevision) ||
      !["complete_fact_check", "review_disclosures"].includes(String(body.action))
    ) {
      return Response.json({ error: "Invalid editorial review command." }, { status: 400 });
    }

    try {
      const result = await executeEditorialReviewAction(
        new PayloadEditorialWorkflowStore(req),
        actor,
        {
          articleId,
          expectedRevision: body.expectedRevision,
          action: body.action as "complete_fact_check" | "review_disclosures",
          correlationId: correlationId(req),
        },
      );
      return Response.json(result, { status: result.ok ? 200 : result.status });
    } catch (error) {
      const code = error instanceof Error ? error.message : "EDITORIAL_REVIEW_FAILED";
      const status = code === "EDITORIAL_TRANSACTIONS_REQUIRED" ? 503 : 500;
      return Response.json({ error: "Editorial review command failed.", code }, { status });
    }
  },
};

export const scheduledPublicationEndpoint: Endpoint = {
  path: "/editorial/publish-due",
  method: "post",
  handler: async (req) => {
    const secret = process.env.HEZQEN_SCHEDULER_SECRET;
    if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const now = new Date().toISOString();
    const due = await req.payload.find({
      collection: "articles",
      where: {
        and: [
          { workflowStatus: { equals: "scheduled" } },
          { scheduledFor: { less_than_equal: now } },
        ],
      },
      limit: 25,
      depth: 0,
      overrideAccess: true,
    });

    const results = [];
    const store = new PayloadEditorialWorkflowStore(req);
    for (const doc of due.docs) {
      const article = normalizeArticle(doc);
      try {
        const result = await executeEditorialWorkflowCommand(
          store,
          { id: "system:scheduler", role: "service", isHuman: false, active: true },
          {
            articleId: article.id,
            expectedRevision: article.revision,
            targetStatus: "published",
            now,
            correlationId: correlationId(req),
          },
        );
        results.push({
          articleId: article.id,
          ok: result.ok,
          blockers: result.ok ? [] : result.blockers,
        });
      } catch {
        results.push({ articleId: article.id, ok: false, blockers: ["PUBLISH_FAILED"] });
      }
    }

    return Response.json({
      checked: due.docs.length,
      published: results.filter((result) => result.ok).length,
      results,
    });
  },
};
