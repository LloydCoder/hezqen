import test from "node:test";
import assert from "node:assert/strict";

import { Articles } from "./Articles.ts";

test("Payload owns the draft _status field when version drafts are enabled", () => {
  assert.equal(Articles.versions?.drafts !== false, true);
  assert.equal(
    Articles.fields?.some((field) => field.name === "_status"),
    false,
  );
});

test("workflow state remains server-managed", () => {
  const field = Articles.fields?.find((item) => item.name === "workflowStatus");
  assert.ok(field);
  assert.equal(field.access?.create?.(), false);
  assert.equal(field.access?.update?.(), false);
});

test("publication scheduling and correction metadata are server-managed", () => {
  for (const name of [
    "scheduledFor",
    "correctionStatus",
    "correctionReason",
    "correctionPublicNote",
    "correctionRequestedAt",
    "correctionResolvedAt",
    "correctionResolvedBy",
  ]) {
    const field = Articles.fields?.find((item) => item.name === name);
    assert.ok(field, `Expected ${name} field to exist`);
    assert.equal(field.access?.create?.(), false);
    assert.equal(field.access?.update?.(), false);
  }
});

const revisionHook = Articles.hooks?.beforeChange?.[0];

test("increments article revision when editorial content changes", async () => {
  assert.ok(revisionHook);
  const result = await revisionHook({
    data: { title: "Revised headline" },
    originalDoc: { workflowStatus: "draft", revision: 7 },
    operation: "update",
    req: { context: {} },
  });
  assert.equal(result.revision, 8);
});

test("requires an explicit return-to-draft transition before editing reviewed or scheduled content", async () => {
  assert.ok(revisionHook);
  for (const workflowStatus of ["fact_check", "editorial_review", "approved", "scheduled"]) {
    assert.throws(
      () =>
        revisionHook({
          data: { body: { root: { children: [] } } },
          originalDoc: { workflowStatus, revision: 3 },
          operation: "update",
          req: { context: {} },
        }),
      /Return the article to draft/,
    );
  }
});

test("draft content edits increment revision and invalidate prior review flags", async () => {
  assert.ok(revisionHook);
  const result = await revisionHook({
    data: { body: { root: { children: [] } } },
    originalDoc: {
      workflowStatus: "draft",
      revision: 3,
      factCheckComplete: true,
      disclosuresReviewed: true,
      approvedBy: 12,
      approvedAt: "2026-11-15T10:00:00.000Z",
      scheduledFor: "2026-11-16T10:00:00.000Z",
    },
    operation: "update",
    req: { context: {} },
  });
  assert.equal(result.revision, 4);
  assert.equal(result.approvedBy, null);
  assert.equal(result.approvedAt, null);
  assert.equal(result.scheduledFor, null);
  assert.equal(result.factCheckComplete, false);
  assert.equal(result.disclosuresReviewed, false);
});

test("blocks direct content edits to published and correction-required articles", async () => {
  assert.ok(revisionHook);
  for (const workflowStatus of ["published", "correction_required"]) {
    assert.throws(
      () =>
        revisionHook({
          data: { title: "Unapproved edit" },
          originalDoc: { workflowStatus, revision: 2 },
          operation: "update",
          req: { context: {} },
        }),
      /correction workflow/,
    );
  }
});

test("does not double-increment revisions for the audited workflow command", async () => {
  assert.ok(revisionHook);
  const data = { title: "Workflow-owned update", revision: 9 };
  const result = await revisionHook({
    data,
    originalDoc: { workflowStatus: "draft", revision: 9 },
    operation: "update",
    req: { context: { hezqenSkipArticleRevisionIncrement: true } },
  });
  assert.equal(result, data);
});


test("rejects privileged Local API workflow mutations outside the editorial command service", () => {
  assert.ok(revisionHook);
  assert.throws(
    () =>
      revisionHook({
        data: { workflowStatus: "published", revision: 99 },
        originalDoc: { workflowStatus: "approved", revision: 3 },
        operation: "update",
        req: { context: { hezqenSkipArticleRevisionIncrement: true } },
      }),
    /editorial workflow command service/,
  );
});
