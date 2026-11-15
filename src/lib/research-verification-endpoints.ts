import { createHash, randomUUID } from "node:crypto";
import type { Endpoint, PayloadRequest } from "payload";

import { assessClaim, validateSourceRecord } from "../domain/research/evidence.ts";
import type { ResearchEvidence, ResearchSource } from "../domain/research/evidence.ts";
import {
  getPrivateEvidenceObject,
  readNeonEvidenceStorageConfig,
  sha256Hex,
} from "./neon-evidence-storage.ts";

type RecordValue = Record<string, unknown>;

function asRecord(value: unknown): RecordValue {
  return value && typeof value === "object" ? (value as RecordValue) : {};
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

function relationRecords(value: unknown): RecordValue[] {
  return Array.isArray(value)
    ? value
        .filter((item) => item && typeof item === "object" && "id" in item)
        .map(asRecord)
    : [];
}

function actorForVerification(req: PayloadRequest): { id: string; role: string } | null {
  if (!req.user) return null;
  const user = asRecord(req.user);
  const role = typeof user.role === "string" ? user.role : "";
  if (user.active === false || !["editor", "fact_checker"].includes(role)) return null;
  return { id: String(user.id), role };
}

function correlationId(req: PayloadRequest): string {
  return req.headers.get("x-request-id")?.slice(0, 128) || randomUUID();
}

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

async function appendVerificationAudit(
  req: PayloadRequest,
  actor: { id: string; role: string },
  action: string,
  resource: "evidence" | "claims",
  resourceId: string,
  before: unknown,
  after: unknown,
): Promise<void> {
  await req.payload.create({
    collection: "audit-events",
    data: {
      eventId: randomUUID(),
      actorId: actor.id,
      actorRole: actor.role,
      action,
      resource,
      resourceId,
      beforeDigest: digest(before),
      afterDigest: digest(after),
      correlationId: correlationId(req),
      outcome: "success",
    },
    overrideAccess: true,
    req,
  });
}

function sourceRecord(value: RecordValue): ResearchSource {
  return {
    id: String(value.id),
    url: typeof value.canonicalUrl === "string" ? value.canonicalUrl : "",
    publisher: typeof value.publisher === "string" ? value.publisher : "",
    title: typeof value.title === "string" ? value.title : "",
    publishedAt: typeof value.publishedAt === "string" ? value.publishedAt : null,
    retrievedAt: typeof value.retrievedAt === "string" ? value.retrievedAt : "",
  };
}

function evidenceRecord(value: RecordValue): ResearchEvidence {
  return {
    id: String(value.id),
    sourceId: relationshipId(value.source) ?? "",
    collectionMethod: typeof value.collectionMethod === "string" ? value.collectionMethod : "",
    retrievedAt: typeof value.retrievedAt === "string" ? value.retrievedAt : "",
    sha256: typeof value.sha256 === "string" ? value.sha256 : "",
    storageRef: typeof value.storageRef === "string" ? value.storageRef : "",
    verificationStatus:
      value.verificationStatus === "captured" ||
      value.verificationStatus === "preserved" ||
      value.verificationStatus === "verified" ||
      value.verificationStatus === "rejected"
        ? value.verificationStatus
        : "captured",
  };
}

export const evidenceVerifyEndpoint: Endpoint = {
  path: "/evidence/verify",
  method: "post",
  handler: async (req) => {
    const actor = actorForVerification(req);
    if (!actor) {
      return Response.json(
        { error: "An active human editor or fact-checker is required." },
        { status: 403 },
      );
    }

    const body = asRecord(await req.json?.().catch(() => null));
    const evidenceId =
      typeof body.evidenceId === "string" || typeof body.evidenceId === "number"
        ? String(body.evidenceId)
        : "";
    const expectedSha256 =
      typeof body.expectedSha256 === "string" ? body.expectedSha256.toLowerCase() : "";
    if (!evidenceId.trim() || !/^[a-f0-9]{64}$/.test(expectedSha256)) {
      return Response.json(
        { error: "evidenceId and expectedSha256 are required." },
        { status: 400 },
      );
    }

    let evidence: RecordValue;
    try {
      evidence = asRecord(
        await req.payload.findByID({
          collection: "evidence",
          id: evidenceId,
          depth: 1,
          overrideAccess: true,
          req,
        }),
      );
    } catch {
      return Response.json({ error: "Evidence not found." }, { status: 404 });
    }

    if (evidence.verificationStatus !== "preserved") {
      return Response.json(
        { error: "Only preserved evidence can enter human verification." },
        { status: 409 },
      );
    }
    if (String(evidence.sha256 ?? "").toLowerCase() !== expectedSha256) {
      return Response.json({ error: "Evidence checksum changed." }, { status: 409 });
    }

    const sourceId = relationshipId(evidence.source);
    if (!sourceId) {
      return Response.json({ error: "Evidence source is missing." }, { status: 422 });
    }
    let source: RecordValue;
    try {
      source = asRecord(
        await req.payload.findByID({
          collection: "sources",
          id: sourceId,
          depth: 0,
          overrideAccess: true,
          req,
        }),
      );
    } catch {
      return Response.json({ error: "Evidence source not found." }, { status: 422 });
    }
    const sourceIssues = validateSourceRecord(sourceRecord(source));
    if (sourceIssues.length > 0) {
      return Response.json({ error: "Evidence source metadata is invalid.", blockers: sourceIssues }, { status: 422 });
    }

    let storageConfig;
    try {
      storageConfig = readNeonEvidenceStorageConfig();
    } catch {
      return Response.json({ error: "Private evidence storage is not configured." }, { status: 503 });
    }

    const storageRef = typeof evidence.storageRef === "string" ? evidence.storageRef : "";
    const expectedContentType = typeof evidence.contentType === "string" ? evidence.contentType : "";
    try {
      const stored = await getPrivateEvidenceObject(storageConfig, storageRef);
      const actualSha256 = sha256Hex(stored.bytes);
      if (
        actualSha256 !== expectedSha256 ||
        stored.bytes.byteLength !== Number(evidence.byteSize) ||
        stored.contentType !== expectedContentType
      ) {
        return Response.json({ error: "Evidence failed byte-integrity verification." }, { status: 409 });
      }
    } catch {
      return Response.json({ error: "Evidence object could not be read from private storage." }, { status: 502 });
    }

    const transactionId = await req.payload.db.beginTransaction();
    if (!transactionId) {
      return Response.json({ error: "Database transactions are required." }, { status: 503 });
    }
    req.transactionID = transactionId;
    try {
      const result = await req.payload.update({
        collection: "evidence",
        where: {
          and: [
            { id: { equals: evidenceId } },
            { verificationStatus: { equals: "preserved" } },
            { sha256: { equals: expectedSha256 } },
          ],
        },
        data: { verificationStatus: "verified" },
        limit: 1,
        overrideAccess: true,
        req,
      });
      const updated = result.docs[0];
      if (!updated) {
        await req.payload.db.rollbackTransaction(transactionId);
        delete req.transactionID;
        return Response.json({ error: "Evidence changed during verification." }, { status: 409 });
      }
      await appendVerificationAudit(
        req,
        actor,
        "evidence.verified",
        "evidence",
        evidenceId,
        { verificationStatus: "preserved", sha256: expectedSha256 },
        { verificationStatus: "verified", sha256: expectedSha256 },
      );
      await req.payload.db.commitTransaction(transactionId);
      delete req.transactionID;
      return Response.json({ ok: true, evidenceId, verificationStatus: "verified" });
    } catch {
      await req.payload.db.rollbackTransaction(transactionId);
      delete req.transactionID;
      return Response.json({ error: "Evidence verification could not be committed." }, { status: 500 });
    }
  },
};

export const claimVerifyEndpoint: Endpoint = {
  path: "/claims/verify",
  method: "post",
  handler: async (req) => {
    const actor = actorForVerification(req);
    if (!actor) {
      return Response.json(
        { error: "An active human editor or fact-checker is required." },
        { status: 403 },
      );
    }

    const body = asRecord(await req.json?.().catch(() => null));
    const claimId =
      typeof body.claimId === "string" || typeof body.claimId === "number"
        ? String(body.claimId)
        : "";
    const expectedUpdatedAt =
      typeof body.expectedUpdatedAt === "string" ? body.expectedUpdatedAt : "";
    if (!claimId.trim() || !expectedUpdatedAt.trim() || Number.isNaN(Date.parse(expectedUpdatedAt))) {
      return Response.json(
        { error: "claimId and expectedUpdatedAt are required." },
        { status: 400 },
      );
    }

    let claim: RecordValue;
    try {
      claim = asRecord(
        await req.payload.findByID({
          collection: "claims",
          id: claimId,
          depth: 2,
          overrideAccess: true,
          req,
        }),
      );
    } catch {
      return Response.json({ error: "Claim not found." }, { status: 404 });
    }

    if (claim.verificationStatus !== "unverified") {
      return Response.json(
        { error: "Only unverified claims can enter the verification workflow." },
        { status: 409 },
      );
    }
    if (typeof claim.updatedAt !== "string" || claim.updatedAt !== expectedUpdatedAt) {
      return Response.json({ error: "Claim changed before verification." }, { status: 409 });
    }

    const sources = relationRecords(claim.sources).map(sourceRecord);
    const evidence = relationRecords(claim.evidence).map(evidenceRecord);
    const sourceIds = relationIds(claim.sources);
    const evidenceIds = relationIds(claim.evidence);
    const assessment = assessClaim(
      { status: "verified", sourceIds, evidenceIds },
      sources,
      evidence,
    );
    if (!assessment.allowed) {
      return Response.json(
        { error: "Claim does not meet the evidence verification policy.", blockers: assessment.blockers },
        { status: 422 },
      );
    }

    const now = new Date().toISOString();
    const before = {
      claimText: String(claim.claimText ?? ""),
      verificationStatus: "unverified",
      sourceIds,
      evidenceIds,
      reviewedBy: relationshipId(claim.reviewedBy),
      reviewedAt: typeof claim.reviewedAt === "string" ? claim.reviewedAt : null,
    };
    const after = {
      ...before,
      verificationStatus: "verified",
      reviewedBy: actor.id,
      reviewedAt: now,
    };

    const transactionId = await req.payload.db.beginTransaction();
    if (!transactionId) {
      return Response.json({ error: "Database transactions are required." }, { status: 503 });
    }
    req.transactionID = transactionId;
    try {
      const result = await req.payload.update({
        collection: "claims",
        where: {
          and: [
            { id: { equals: claimId } },
            { updatedAt: { equals: expectedUpdatedAt } },
            { verificationStatus: { equals: "unverified" } },
          ],
        },
        data: {
          verificationStatus: "verified",
          reviewedBy: actor.id,
          reviewedAt: now,
        },
        limit: 1,
        overrideAccess: true,
        req,
      });
      if (!result.docs[0]) {
        await req.payload.db.rollbackTransaction(transactionId);
        delete req.transactionID;
        return Response.json({ error: "Claim changed during verification." }, { status: 409 });
      }
      await appendVerificationAudit(
        req,
        actor,
        "claim.verified",
        "claims",
        claimId,
        before,
        after,
      );
      await req.payload.db.commitTransaction(transactionId);
      delete req.transactionID;
      return Response.json({ ok: true, claimId, verificationStatus: "verified", reviewedAt: now });
    } catch {
      await req.payload.db.rollbackTransaction(transactionId);
      delete req.transactionID;
      return Response.json({ error: "Claim verification could not be committed." }, { status: 500 });
    }
  },
};
