import assert from "node:assert/strict";
import test from "node:test";
import { parseVramShareParams, serializeVramShareParams } from "./vram-sharing.ts";

const input = {
  parametersB: 14.7,
  weightFormat: "int4",
  layers: 48,
  kvHeads: 8,
  headDimension: 128,
  contextLength: 8192,
  batchSize: 2,
  kvCacheFormat: "fp8",
  runtimeReservePercent: 20,
};

test("round-trips validated calculator inputs through a versioned share URL payload", () => {
  const serialized = serializeVramShareParams(input);
  const parsed = parseVramShareParams(new URLSearchParams(serialized));

  assert.deepEqual(parsed, input);
});

test("rejects unsupported share payload versions and incomplete values", () => {
  assert.equal(parseVramShareParams(new URLSearchParams("v=2")), null);
  assert.equal(parseVramShareParams(new URLSearchParams("v=1&parametersB=7")), null);
});

test("rejects invalid or excessive values rather than trusting URL parameters", () => {
  const invalid = new URLSearchParams(serializeVramShareParams(input));
  invalid.set("contextLength", "999999999");
  assert.equal(parseVramShareParams(invalid), null);
});

test("share payload contains only allowlisted calculator inputs", () => {
  const params = new URLSearchParams(serializeVramShareParams(input));
  params.set("email", "private@example.com");
  const parsed = parseVramShareParams(params);

  assert.deepEqual(parsed, input);
  assert.equal(params.get("email"), "private@example.com");
});
