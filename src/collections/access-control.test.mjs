import assert from "node:assert/strict";
import test from "node:test";

import { Articles } from "./Articles.ts";
import { AuditEvents } from "./AuditEvents.ts";
import { Evidence } from "./Evidence.ts";

function accessResult(access, user) {
  return access({ req: { user } });
}

test("article update access follows the editorial role matrix", () => {
  assert.equal(accessResult(Articles.access.update, { id: 1, role: "administrator" }), true);
  assert.equal(accessResult(Articles.access.update, { id: 2, role: "editor" }), true);
  assert.equal(accessResult(Articles.access.update, { id: 3, role: "researcher" }), false);
  assert.equal(accessResult(Articles.access.update, { id: 4, role: "fact_checker" }), false);
  assert.equal(accessResult(Articles.access.update, null), false);

  const authorScope = accessResult(Articles.access.update, { id: 5, role: "author" });
  assert.equal(typeof authorScope, "object");
  assert.deepEqual(authorScope.and?.[0], { author: { equals: 5 } });
  assert.deepEqual(authorScope.and?.[1], {
    workflowStatus: { in: ["pitch", "research", "draft"] },
  });
});

test("workflow and publication authority fields cannot be written through collection APIs", () => {
  const protectedFields = [
    "workflowStatus",
    "factCheckComplete",
    "disclosuresReviewed",
    "approvedBy",
    "approvedAt",
    "publishedAt",
    "scheduledFor",
    "correctionStatus",
    "correctionReason",
    "correctionPublicNote",
    "correctionRequestedAt",
    "correctionResolvedAt",
    "correctionResolvedBy",
    "revision",
  ];

  for (const name of protectedFields) {
    const field = Articles.fields?.find((item) => item.name === name);
    assert.ok(field, \`Missing protected field \${name}\`);
    assert.equal(field.access?.create?.({ req: { user: { id: 1, role: "administrator" } } }), false);
    assert.equal(field.access?.update?.({ req: { user: { id: 1, role: "administrator" } } }), false);
  }
});

test("evidence is readable only by research and editorial roles", () => {
  for (const role of ["administrator", "editor", "researcher", "fact_checker"]) {
    assert.equal(accessResult(Evidence.access.read, { id: role, role }), true);
  }
  for (const role of ["reader", "author", "service"]) {
    assert.equal(accessResult(Evidence.access.read, { id: role, role }), false);
  }
  assert.equal(accessResult(Evidence.access.read, null), false);
  assert.equal(Evidence.access.create({ req: { user: { id: 1, role: "administrator" } } }), false);
  assert.equal(Evidence.access.update({ req: { user: { id: 1, role: "administrator" } } }), false);
  assert.equal(Evidence.access.delete({ req: { user: { id: 1, role: "administrator" } } }), false);
});

test("audit events are immutable through Payload collection access", () => {
  const admin = { id: 1, role: "administrator" };
  assert.equal(AuditEvents.access.create({ req: { user: admin } }), false);
  assert.equal(AuditEvents.access.update({ req: { user: admin } }), false);
  assert.equal(AuditEvents.access.delete({ req: { user: admin } }), false);
  assert.equal(AuditEvents.access.read({ req: { user: admin } }), true);
  assert.equal(AuditEvents.access.read({ req: { user: { id: 2, role: "author" } } }), false);
});
