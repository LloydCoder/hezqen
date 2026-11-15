import assert from "node:assert/strict";
import test from "node:test";

import { Articles } from "./Articles.ts";
import { AuditEvents } from "./AuditEvents.ts";
import { Claims } from "./Claims.ts";
import { Evidence } from "./Evidence.ts";
import { Sources } from "./Sources.ts";
import { Topics } from "./Topics.ts";
import { Users } from "./Users.ts";
import { withRequestContext } from "../lib/request-context.ts";

const evidenceHook = Evidence.hooks?.beforeChange?.[0];
const claimHook = Claims.hooks?.beforeChange?.[0];
const auditHook = AuditEvents.hooks?.beforeChange?.[0];

test("evidence cannot be created outside the preservation endpoint", async () => {
  assert.ok(evidenceHook);
  assert.throws(
    () =>
      evidenceHook({
        data: { verificationStatus: "verified" },
        operation: "create",
        req: { context: {} },
      }),
    /preservation endpoint/,
  );
  const req = { context: {} };
  const data = { verificationStatus: "preserved" };
  const result = await withRequestContext(req, { hezqenEvidencePreservation: true }, async () =>
    evidenceHook({ data, operation: "create", req }),
  );
  assert.equal(result, data);
});

test("evidence verification cannot mutate immutable provenance fields", async () => {
  assert.ok(evidenceHook);
  assert.throws(
    () => evidenceHook({ data: { verificationStatus: "verified" }, operation: "update", req: { context: {} } }),
    /immutable outside human verification/,
  );
  const req = { context: {} };
  const data = { verificationStatus: "verified" };
  const result = await withRequestContext(req, { hezqenEvidenceVerification: true }, async () =>
    evidenceHook({ data, operation: "update", req }),
  );
  assert.equal(result, data);
  assert.throws(
    () =>
      evidenceHook({
        data: { storageRef: "evidence/replaced" },
        operation: "update",
        req: { context: { hezqenEvidenceVerification: true } },
      }),
    /Only evidence verification status/,
  );
});

test("claims cannot be created pre-verified or marked non-material by a caller", () => {
  assert.ok(claimHook);
  assert.throws(
    () => claimHook({ data: { verificationStatus: "verified" }, operation: "create", req: { context: {} } }),
    /begin as unverified/,
  );
  assert.throws(
    () => claimHook({ data: { material: false }, operation: "create", req: { context: {} } }),
    /verification metadata is server managed/,
  );
  const data = { verificationStatus: "unverified", material: true };
  assert.equal(claimHook({ data, operation: "create", req: { context: {} } }), data);
});

test("claim updates are limited to the human verification endpoint", async () => {
  assert.ok(claimHook);
  assert.throws(
    () => claimHook({ data: { verificationStatus: "verified" }, operation: "update", req: { context: {} } }),
    /immutable outside the verification workflow/,
  );
  const req = { context: {} };
  const data = {
    verificationStatus: "verified",
    reviewedBy: 12,
    reviewedAt: "2026-11-15T12:00:00.000Z",
  };
  const result = await withRequestContext(req, { hezqenClaimVerification: true }, async () =>
    claimHook({ data, operation: "update", req }),
  );
  assert.equal(result, data);
});

test("audit events can only be appended by trusted server operations", async () => {
  assert.ok(auditHook);
  assert.throws(
    () => auditHook({ data: {}, operation: "create", req: { context: {} } }),
    /append-only and server generated/,
  );
  const req = { context: {} };
  const data = { eventId: "event-1" };
  const result = await withRequestContext(req, { hezqenAuditWrite: true }, async () =>
    auditHook({ data, operation: "create", req }),
  );
  assert.equal(result, data);
  assert.throws(
    () => auditHook({ data, operation: "update", req: { context: { hezqenAuditWrite: true } } }),
    /append-only and server generated/,
  );
});

test("plain context flags cannot forge privileged write capabilities", () => {
  assert.throws(
    () =>
      auditHook({
        data: { eventId: "spoofed" },
        operation: "create",
        req: { context: { hezqenAuditWrite: true } },
      }),
    /append-only and server generated/,
  );
  assert.throws(
    () =>
      evidenceHook({
        data: { verificationStatus: "preserved" },
        operation: "create",
        req: { context: { hezqenEvidencePreservation: true } },
      }),
    /preservation endpoint/,
  );
});

test("immutable research records cannot be deleted through the Local API", () => {
  for (const [collection, pattern] of [
    [AuditEvents, /append-only and cannot be deleted/],
    [Evidence, /cannot be deleted/],
    [Claims, /cannot be deleted/],
    [Sources, /cannot be deleted/],
  ]) {
    const hook = collection.hooks?.beforeDelete?.[0];
    assert.ok(hook);
    assert.throws(() => hook({ id: 1, req: { context: {} } }), pattern);
  }
});

test("source provenance cannot be edited through the Local API", () => {
  const hook = Sources.hooks?.beforeChange?.[0];
  assert.ok(hook);
  assert.throws(
    () =>
      hook({
        data: { canonicalUrl: "https://example.com/changed" },
        operation: "update",
        req: { context: {} },
      }),
    /Source records are immutable/,
  );
});

test("core CMS records cannot be deleted through overrideAccess Local API calls", () => {
  for (const [collection, pattern] of [
    [Articles, /cannot be deleted/],
    [Topics, /cannot be deleted/],
    [Users, /cannot be deleted/],
  ]) {
    const hook = collection.hooks?.beforeDelete?.[0];
    assert.ok(hook);
    assert.throws(() => hook({ id: 1, req: { context: {} } }), pattern);
  }
});
