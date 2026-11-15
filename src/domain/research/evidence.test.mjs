import assert from "node:assert/strict";
import test from "node:test";
import { assessClaim, validateEvidenceRecord, validateSourceRecord } from "./evidence.ts";

const source = {
  id: "source-1",
  url: "https://example.org/report",
  publisher: "Example Research",
  title: "Infrastructure report",
  publishedAt: "2026-10-01T00:00:00.000Z",
  retrievedAt: "2026-11-15T09:00:00.000Z",
};

const evidence = {
  id: "evidence-1",
  sourceId: "source-1",
  collectionMethod: "web_fetch",
  retrievedAt: "2026-11-15T09:00:00.000Z",
  sha256: "a".repeat(64),
  storageRef: "evidence/2026/11/evidence-1.html",
  verificationStatus: "verified",
};

test("accepts a source with an absolute HTTPS URL and valid provenance dates", () => {
  assert.deepEqual(validateSourceRecord(source), []);
});

test("rejects non-HTTPS, credential-bearing and malformed source URLs", () => {
  assert.ok(
    validateSourceRecord({ ...source, url: "http://example.org" }).includes(
      "SOURCE_URL_HTTPS_REQUIRED",
    ),
  );
  assert.ok(
    validateSourceRecord({ ...source, url: "https://user:pass@example.org" }).includes(
      "SOURCE_URL_CREDENTIALS_FORBIDDEN",
    ),
  );
  assert.ok(validateSourceRecord({ ...source, url: "not-a-url" }).includes("SOURCE_URL_INVALID"));
});

test("rejects a source whose publication date is after retrieval", () => {
  assert.ok(
    validateSourceRecord({
      ...source,
      publishedAt: "2026-12-01T00:00:00.000Z",
    }).includes("SOURCE_DATE_ORDER_INVALID"),
  );
});

test("accepts evidence with checksum, storage reference and collection method", () => {
  assert.deepEqual(validateEvidenceRecord(evidence), []);
});

test("rejects malformed SHA-256 digests and empty storage references", () => {
  assert.ok(
    validateEvidenceRecord({ ...evidence, sha256: "xyz" }).includes("EVIDENCE_CHECKSUM_INVALID"),
  );
  assert.ok(
    validateEvidenceRecord({ ...evidence, storageRef: " " }).includes(
      "EVIDENCE_STORAGE_REF_REQUIRED",
    ),
  );
});

test("requires evidence retrieval time to be a valid timestamp", () => {
  assert.ok(
    validateEvidenceRecord({ ...evidence, retrievedAt: "yesterday" }).includes(
      "EVIDENCE_RETRIEVAL_DATE_INVALID",
    ),
  );
});

test("marks claims verified only when supported by verified evidence and sources", () => {
  const result = assessClaim(
    {
      status: "verified",
      sourceIds: ["source-1"],
      evidenceIds: ["evidence-1"],
    },
    [source],
    [evidence],
  );
  assert.equal(result.allowed, true);
  assert.deepEqual(result.blockers, []);
});

test("does not treat a source citation without preserved evidence as verified", () => {
  const result = assessClaim(
    {
      status: "verified",
      sourceIds: ["source-1"],
      evidenceIds: [],
    },
    [source],
    [],
  );
  assert.equal(result.allowed, false);
  assert.ok(result.blockers.includes("CLAIM_EVIDENCE_REQUIRED"));
});

test("blocks a claim whose source or evidence reference is missing", () => {
  const result = assessClaim(
    {
      status: "verified",
      sourceIds: ["missing-source"],
      evidenceIds: ["missing-evidence"],
    },
    [source],
    [evidence],
  );
  assert.equal(result.allowed, false);
  assert.ok(result.blockers.includes("CLAIM_SOURCE_NOT_FOUND"));
  assert.ok(result.blockers.includes("CLAIM_EVIDENCE_NOT_FOUND"));
});

test("disputed and unverified claims cannot be promoted to verified by this check", () => {
  for (const status of ["disputed", "unverified", "attributed", "corrected"]) {
    const result = assessClaim(
      {
        status,
        sourceIds: ["source-1"],
        evidenceIds: ["evidence-1"],
      },
      [source],
      [evidence],
    );
    assert.equal(result.allowed, false);
    assert.ok(result.blockers.includes("CLAIM_STATUS_NOT_VERIFIED"));
  }
});

test("rejects evidence linked to a different source than the claim cites", () => {
  const result = assessClaim(
    {
      status: "verified",
      sourceIds: ["source-1"],
      evidenceIds: ["evidence-2"],
    },
    [source],
    [{ ...evidence, id: "evidence-2", sourceId: "source-2" }],
  );
  assert.equal(result.allowed, false);
  assert.ok(result.blockers.includes("CLAIM_EVIDENCE_SOURCE_MISMATCH"));
});
