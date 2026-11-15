import assert from "node:assert/strict";
import test from "node:test";
import { transitionPublication } from "./workflow.ts";

const editor = { id: "editor-1", role: "editor", isHuman: true };
const author = { id: "author-1", role: "author", isHuman: true };
const agent = { id: "agent-1", role: "service", isHuman: false };
const now = "2026-11-15T10:00:00.000Z";

const record = {
  status: "draft",
  authorId: "author-1",
  editorId: "editor-1",
  approvedById: null,
  approvedAt: null,
  claims: [{ id: "claim-1", sourceIds: ["source-1"] }],
  factCheckComplete: false,
  disclosuresReviewed: false,
  revision: 1,
  scheduledFor: null,
};

test("allows an assigned human author to submit a draft for fact-checking", () => {
  const result = transitionPublication(record, author, "fact_check", { now });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.record.status, "fact_check");
});

test("requires the assigned human editor to move fact-checked work to editorial review", () => {
  const ready = { ...record, status: "fact_check", factCheckComplete: true };
  const result = transitionPublication(ready, editor, "editorial_review", { now });
  assert.equal(result.ok, true);
  assert.equal(transitionPublication(ready, author, "editorial_review", { now }).ok, false);
});

test("requires source-backed claims, completed fact-check and disclosure review before approval", () => {
  const review = {
    ...record,
    status: "editorial_review",
    factCheckComplete: true,
    disclosuresReviewed: true,
  };
  const result = transitionPublication(review, editor, "approved", { now });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.record.status, "approved");
    assert.equal(result.record.approvedById, editor.id);
    assert.equal(result.record.approvedAt, now);
  }
  assert.equal(
    transitionPublication(
      { ...review, claims: [{ id: "claim-2", sourceIds: [] }] },
      editor,
      "approved",
      { now },
    ).ok,
    false,
  );
  assert.equal(
    transitionPublication({ ...review, factCheckComplete: false }, editor, "approved", { now }).ok,
    false,
  );
  assert.equal(
    transitionPublication({ ...review, disclosuresReviewed: false }, editor, "approved", { now })
      .ok,
    false,
  );
});

test("prevents authors from approving their own work", () => {
  const selfAssigned = {
    ...record,
    status: "editorial_review",
    editorId: "author-1",
    factCheckComplete: true,
    disclosuresReviewed: true,
  };
  const result = transitionPublication(selfAssigned, author, "approved", { now });
  assert.equal(result.ok, false);
  if (!result.ok) assert.ok(result.blockers.includes("AUTHOR_EDITOR_CONFLICT"));
});

test("rejects automated actors and administrator role from approval", () => {
  const review = {
    ...record,
    status: "editorial_review",
    factCheckComplete: true,
    disclosuresReviewed: true,
  };
  assert.equal(transitionPublication(review, agent, "approved", { now }).ok, false);
  assert.equal(
    transitionPublication(
      review,
      { id: "editor-1", role: "administrator", isHuman: true },
      "approved",
      { now },
    ).ok,
    false,
  );
});

test("does not allow skipping review stages to publish", () => {
  const result = transitionPublication(record, editor, "published", { now });
  assert.equal(result.ok, false);
});

test("publishes only an approved record through its assigned human editor", () => {
  const approved = {
    ...record,
    status: "approved",
    approvedById: "editor-1",
    approvedAt: now,
    factCheckComplete: true,
    disclosuresReviewed: true,
  };
  const result = transitionPublication(approved, editor, "published", { now });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.record.status, "published");
  assert.equal(transitionPublication(approved, author, "published", { now }).ok, false);
  assert.equal(transitionPublication(approved, agent, "published", { now }).ok, false);
});

test("requires scheduled publication time to be valid and in the future", () => {
  const approved = {
    ...record,
    status: "approved",
    approvedById: "editor-1",
    approvedAt: now,
    factCheckComplete: true,
    disclosuresReviewed: true,
  };
  assert.equal(transitionPublication(approved, editor, "scheduled", { now }).ok, false);
  const result = transitionPublication(approved, editor, "scheduled", {
    now,
    scheduledFor: "2026-11-15T11:00:00.000Z",
  });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.record.scheduledFor, "2026-11-15T11:00:00.000Z");
});

test("scheduled records cannot publish before their scheduled time", () => {
  const scheduled = {
    ...record,
    status: "scheduled",
    approvedById: "editor-1",
    approvedAt: now,
    factCheckComplete: true,
    disclosuresReviewed: true,
    scheduledFor: "2026-11-15T11:00:00.000Z",
  };
  const early = transitionPublication(scheduled, editor, "published", { now });
  assert.equal(early.ok, false);
  const due = transitionPublication(scheduled, editor, "published", {
    now: "2026-11-15T11:00:00.000Z",
  });
  assert.equal(due.ok, true);
});

test("correction workflow reopens a new revision and clears prior approval", () => {
  const published = {
    ...record,
    status: "published",
    approvedById: "editor-1",
    approvedAt: now,
    factCheckComplete: true,
    disclosuresReviewed: true,
  };
  const reopened = transitionPublication(published, editor, "correction_required", { now });
  assert.equal(reopened.ok, true);
  if (reopened.ok) {
    const revised = transitionPublication(reopened.record, editor, "draft", { now });
    assert.equal(revised.ok, true);
    if (revised.ok) {
      assert.equal(revised.record.revision, 2);
      assert.equal(revised.record.approvedById, null);
      assert.equal(revised.record.status, "draft");
    }
  }
});
