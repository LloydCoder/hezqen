import assert from "node:assert/strict";
import test from "node:test";

import { normalizeSubscriberId } from "./newsletter-endpoints.ts";

test("normalizes numeric Payload subscriber IDs without corrupting string IDs", () => {
  assert.equal(normalizeSubscriberId("123"), 123);
  assert.equal(normalizeSubscriberId("subscriber-123"), "subscriber-123");
  assert.equal(normalizeSubscriberId("9007199254740992"), "9007199254740992");
  assert.equal(normalizeSubscriberId(""), "");
});
