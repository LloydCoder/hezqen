import { createHash, randomUUID } from "node:crypto";
import type { Endpoint, PayloadRequest } from "payload";

import {
  deleteEvidenceObject,
  getPrivateEvidenceObject,
  MAX_EVIDENCE_BYTES,
  putAndVerifyEvidenceObject,
  readNeonEvidenceStorageConfig,
  sha256Hex,
} from "./neon-evidence-storage.ts";

type RecordValue = Record<string, unknown>;

function asRecord(value: unknown): RecordValue {
  return value && typeof value === "object" ? (value as RecordValue) : {};
}

function actorForEvidence(req: PayloadRequest): { id: string; role: string } | null {
  if (!req.user) return null;
  const user = asRecord(req.user);
  const role = typeof user.role === "string" ? user.role : "";
  if (
    user.active === false ||
    !["administrator", "editor", "researcher", "fact_checker"].includes(role)
  ) {
    return null;
  }
  return { id: String(user.id), role };
}

function correlationId(req: PayloadRequest): string {
  return req.headers.get("x-request-id")?.slice(0, 128) || randomUUID();
}

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

async function appendEvidenceAudit(
  req: PayloadRequest,
  actor: { id: string; role: string },
  action: string,
  resourceId: string,
  afterDigest: string,
): Promise<void> {
  await req.payload.create({
    collection: "audit-events",
    data: {
      eventId: randomUUID(),
      actorId: actor.id,
      actorRole: actor.role,
      action,
      resource: "evidence",
      resourceId,
      beforeDigest: null,
      afterDigest,
      correlationId: correlationId(req),
      outcome: "success",
    },
    overrideAccess: true,
    req,
  });
}

export const evidenceUploadEndpoint: Endpoint = {
  path: "/evidence/upload",
  method: "post",
  handler: async (req) => {
    const actor = actorForEvidence(req);
    if (!actor) return Response.json({ error: "Authenticated research access required." }, { status: 403 });

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return Response.json({ error: "Expected a multipart form upload." }, { status: 400 });
    }

    const file = form.get("file");
    const sourceId = form.get("sourceId");
    const collectionMethod = form.get("collectionMethod");
    if (
      !file ||
      typeof file === "string" ||
      typeof file.arrayBuffer !== "function" ||
      typeof file.size !== "number" ||
      typeof file.type !== "string" ||
      typeof sourceId !== "string" ||
      !sourceId.trim() ||
      typeof collectionMethod !== "string" ||
      !collectionMethod.trim() ||
      collectionMethod.trim().length > 100
    ) {
      return Response.json({ error: "File, sourceId and collectionMethod are required." }, { status: 400 });
    }
    if (file.size < 1 || file.size > MAX_EVIDENCE_BYTES) {
      return Response.json({ error: "Evidence files must be between 1 byte and 4 MiB." }, { status: 413 });
    }

    const contentType = file.type.toLowerCase().split(";")[0]?.trim() ?? "";
    const storageConfig = (() => {
      try {
        return readNeonEvidenceStorageConfig();
      } catch {
        return null;
      }
    })();
    if (!storageConfig) {
      return Response.json({ error: "Private evidence storage is not configured." }, { status: 503 });
    }

    if (
      ![
        "application/pdf",
        "application/json",
        "application/xml",
        "text/xml",
        "text/plain",
        "text/csv",
        "image/png",
        "image/jpeg",
        "image/webp",
      ].includes(contentType)
    ) {
      return Response.json({ error: "This evidence content type is not allowed." }, { status: 415 });
    }

    try {
      await req.payload.findByID({
        collection: "sources",
        id: sourceId,
        depth: 0,
        overrideAccess: true,
        req,
      });
    } catch {
      return Response.json({ error: "The referenced source does not exist." }, { status: 404 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes.byteLength !== file.size || bytes.byteLength > MAX_EVIDENCE_BYTES) {
      return Response.json({ error: "Evidence upload size could not be verified." }, { status: 400 });
    }

    const key = \`evidence/\${randomUUID()}\`;
    let verifiedObject: Awaited<ReturnType<typeof putAndVerifyEvidenceObject>>;
    try {
      verifiedObject = await putAndVerifyEvidenceObject(storageConfig, {
        key,
        bytes,
        contentType,
      });
    } catch (error) {
      const code = error instanceof Error ? error.message : "EVIDENCE_STORAGE_FAILED";
      return Response.json({ error: "Evidence could not be preserved.", code }, { status: 502 });
    }

    const transactionId = await req.payload.db.beginTransaction();
    if (!transactionId) {
      await deleteEvidenceObject(storageConfig, key).catch(() => undefined);
      return Response.json({ error: "Database transactions are required for evidence preservation." }, { status: 503 });
    }
    req.transactionID = transactionId;

    try {
      const evidence = await req.payload.create({
        collection: "evidence",
        data: {
          evidenceId: randomUUID(),
          source: sourceId,
          collectionMethod: collectionMethod.trim(),
          retrievedAt: new Date().toISOString(),
          contentType: verifiedObject.contentType,
          byteSize: verifiedObject.byteSize,
          sha256: verifiedObject.sha256,
          storageRef: verifiedObject.key,
          verificationStatus: "verified",
        },
        overrideAccess: true,
        req,
      });
      const evidenceId = String(evidence.id);
      await appendEvidenceAudit(req, actor, "evidence.preserved", evidenceId, verifiedObject.sha256);
      await req.payload.db.commitTransaction(transactionId);
      delete req.transactionID;
      return Response.json({
        ok: true,
        evidenceId,
        sha256: verifiedObject.sha256,
        byteSize: verifiedObject.byteSize,
        contentType: verifiedObject.contentType,
      });
    } catch (error) {
      await req.payload.db.rollbackTransaction(transactionId);
      delete req.transactionID;
      await deleteEvidenceObject(storageConfig, key).catch(() => undefined);
      const code = error instanceof Error ? error.message : "EVIDENCE_METADATA_FAILED";
      return Response.json({ error: "Evidence metadata could not be committed.", code }, { status: 500 });
    }
  },
};

export const evidenceDownloadEndpoint: Endpoint = {
  path: "/evidence/download",
  method: "post",
  handler: async (req) => {
    const actor = actorForEvidence(req);
    if (!actor) return Response.json({ error: "Authenticated research access required." }, { status: 403 });

    const body = asRecord(await req.json().catch(() => null));
    if (typeof body.evidenceId !== "string" || !body.evidenceId.trim()) {
      return Response.json({ error: "evidenceId is required." }, { status: 400 });
    }

    let evidence: RecordValue;
    try {
      evidence = asRecord(
        await req.payload.findByID({
          collection: "evidence",
          id: body.evidenceId,
          depth: 0,
          overrideAccess: true,
          req,
        }),
      );
    } catch {
      return Response.json({ error: "Evidence not found." }, { status: 404 });
    }

    const storageRef = typeof evidence.storageRef === "string" ? evidence.storageRef : "";
    if (!storageRef.startsWith("evidence/") || storageRef.includes("..") || storageRef.includes("\\")) {
      return Response.json({ error: "Evidence storage reference is invalid." }, { status: 409 });
    }

    let storageConfig;
    try {
      storageConfig = readNeonEvidenceStorageConfig();
    } catch {
      return Response.json({ error: "Private evidence storage is not configured." }, { status: 503 });
    }

    try {
      const stored = await getPrivateEvidenceObject(storageConfig, storageRef);
      const expectedSha256 = String(evidence.sha256 ?? "");
      const actualSha256 = sha256Hex(stored.bytes);
      if (
        actualSha256 !== expectedSha256 ||
        stored.bytes.byteLength !== Number(evidence.byteSize)
      ) {
        return Response.json({ error: "Stored evidence failed its integrity check." }, { status: 409 });
      }

      const transactionId = await req.payload.db.beginTransaction();
      if (!transactionId) {
        return Response.json({ error: "Database transactions are required for evidence access auditing." }, { status: 503 });
      }
      req.transactionID = transactionId;
      try {
        await appendEvidenceAudit(
          req,
          actor,
          "evidence.downloaded",
          String(evidence.id),
          digest({ sha256: actualSha256, byteSize: stored.bytes.byteLength }),
        );
        await req.payload.db.commitTransaction(transactionId);
        delete req.transactionID;
      } catch (error) {
        await req.payload.db.rollbackTransaction(transactionId);
        delete req.transactionID;
        throw error;
      }

      return new Response(Buffer.from(stored.bytes), {
        status: 200,
        headers: {
          "content-type": stored.contentType,
          "content-length": String(stored.bytes.byteLength),
          "content-disposition": \`attachment; filename="hezqen-evidence-\${String(evidence.evidenceId)}"\`,
          "cache-control": "private, no-store",
          "x-content-type-options": "nosniff",
        },
      });
    } catch {
      return Response.json({ error: "Private evidence retrieval failed." }, { status: 502 });
    }
  },
};
