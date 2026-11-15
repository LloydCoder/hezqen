import assert from "node:assert/strict";
import test from "node:test";

import { createLivenessPayload, createReadinessResponse } from "./health.ts";

test("liveness payload is deterministic and contains no infrastructure secrets", () => {
  const payload = createLivenessPayload(new Date("2026-11-15T12:00:00.000Z"));

  assert.deepEqual(payload, {
    status: "ok",
    service: "hezqen",
    checkedAt: "2026-11-15T12:00:00.000Z",
  });
  assert.equal(JSON.stringify(payload).includes("DATABASE_URL"), false);
});

test("readiness returns a cache-disabled ready response when the dependency check passes", async () => {
  const response = await createReadinessResponse(async () => undefined);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { status: "ready" });
});

test("readiness returns a generic 503 without leaking dependency errors", async () => {
  const response = await createReadinessResponse(async () => {
    throw new Error("database connection password=must-not-leak");
  });

  assert.equal(response.status, 503);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const body = await response.json();
  assert.deepEqual(body, { status: "not_ready" });
  assert.equal(JSON.stringify(body).includes("password"), false);
});
