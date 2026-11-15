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
