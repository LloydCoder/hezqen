import assert from "node:assert/strict";
import test from "node:test";
import { canPublish, getPublicationBlockers } from "./publishing-policy.ts";

const editor = { id: "editor-1", role: "editor", isHuman: true };
const approvedRecord = {
  status: "approved",
  authorId: "author-1",
  editorId: "editor-1",
  approvedById: "editor-1",
  approvedAt: "2026-11-15T08:00:00.000Z",
  claims: [
    {
      id: "claim-1",
      sourceIds: ["source-1"],
      verificationStatus: "verified",
      evidence: [{ id: "evidence-1", sourceId: "source-1", verificationStatus: "verified" }],
    },
  ],
  factCheckComplete: true,
  disclosuresReviewed: true,
};

test("allows a fully reviewed record approved by the acting human editor", () =>
  assert.equal(canPublish(approvedRecord, editor), true));
test("rejects automated actors", () => {
  const agent = { id: "agent-1", role: "administrator", isHuman: false };
  assert.equal(canPublish(approvedRecord, agent), false);
  assert.ok(getPublicationBlockers(approvedRecord, agent).includes("ACTOR_NOT_HUMAN"));
});
test("does not grant administrators editorial publication authority by default", () =>
  assert.equal(
    canPublish(approvedRecord, { id: "editor-1", role: "administrator", isHuman: true }),
    false,
  ));
test("requires the acting editor to be the assigned editor", () =>
  assert.equal(canPublish({ ...approvedRecord, editorId: "editor-2" }, editor), false));
test("rejects malformed approval timestamps", () =>
  assert.equal(canPublish({ ...approvedRecord, approvedAt: "not-a-date" }, editor), false));
test("rejects authors and readers attempting to publish", () =>
  assert.equal(
    canPublish(approvedRecord, { id: "author-1", role: "author", isHuman: true }),
    false,
  ));
test("requires an explicit human approval state", () =>
  assert.equal(
    canPublish({ ...approvedRecord, status: "editorial_review", approvedById: null }, editor),
    false,
  ));
test("rejects approval by a different editor", () =>
  assert.equal(canPublish({ ...approvedRecord, approvedById: "editor-2" }, editor), false));
test("requires sources for material claims", () =>
  assert.equal(
    canPublish({ ...approvedRecord, claims: [{ id: "claim-2", sourceIds: [] }] }, editor),
    false,
  ));
test("requires fact-check and disclosure review", () =>
  assert.equal(
    canPublish({ ...approvedRecord, factCheckComplete: false, disclosuresReviewed: false }, editor),
    false,
  ));


test("requires every material claim to be independently verified", () => {
  const result = getPublicationBlockers(
    {
      ...approvedRecord,
      claims: [
        {
          id: "claim-1",
          sourceIds: ["source-1"],
          verificationStatus: "unverified",
          evidence: [{ id: "evidence-1", sourceId: "source-1", verificationStatus: "verified" }],
        },
      ],
    },
    editor,
  );
  assert.ok(result.includes("CLAIM_NOT_VERIFIED"));
});

test("requires preserved evidence for every material claim", () => {
  const result = getPublicationBlockers(
    {
      ...approvedRecord,
      claims: [
        {
          id: "claim-1",
          sourceIds: ["source-1"],
          verificationStatus: "verified",
          evidence: [],
        },
      ],
    },
    editor,
  );
  assert.ok(result.includes("CLAIM_EVIDENCE_REQUIRED"));
});

test("rejects evidence that has not passed human verification", () => {
  const result = getPublicationBlockers(
    {
      ...approvedRecord,
      claims: [
        {
          id: "claim-1",
          sourceIds: ["source-1"],
          verificationStatus: "verified",
          evidence: [{ id: "evidence-1", sourceId: "source-1", verificationStatus: "preserved" }],
        },
      ],
    },
    editor,
  );
  assert.ok(result.includes("CLAIM_EVIDENCE_NOT_VERIFIED"));
});

test("rejects evidence captured from a source not cited by its claim", () => {
  const result = getPublicationBlockers(
    {
      ...approvedRecord,
      claims: [
        {
          id: "claim-1",
          sourceIds: ["source-1"],
          verificationStatus: "verified",
          evidence: [{ id: "evidence-1", sourceId: "source-2", verificationStatus: "verified" }],
        },
      ],
    },
    editor,
  );
  assert.ok(result.includes("CLAIM_EVIDENCE_SOURCE_MISMATCH"));
});
