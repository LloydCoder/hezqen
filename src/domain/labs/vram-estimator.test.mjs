import assert from "node:assert/strict";
import test from "node:test";
import { estimateVram } from "./vram-estimator.ts";

test("estimates FP16 model weights using binary GiB", () => {
  const result = estimateVram({
    parametersB: 7,
    weightFormat: "fp16",
    layers: 32,
    kvHeads: 8,
    headDimension: 128,
    contextLength: 4096,
    batchSize: 1,
  });
  assert.equal(result.weightMemoryGiB, (7_000_000_000 * 2) / 1_073_741_824);
});

test("includes grouped-query KV cache and configurable runtime reserve", () => {
  const result = estimateVram({
    parametersB: 7,
    weightFormat: "int4",
    layers: 32,
    kvHeads: 8,
    headDimension: 128,
    contextLength: 4096,
    batchSize: 2,
    kvCacheFormat: "fp16",
    runtimeReservePercent: 20,
  });
  assert.equal(result.kvCacheMemoryGiB, (2 * 32 * 8 * 128 * 4096 * 2 * 2) / 1_073_741_824);
  assert.equal(result.runtimeReserveGiB, (result.weightMemoryGiB + result.kvCacheMemoryGiB) * 0.2);
  assert.equal(
    result.totalMemoryGiB,
    result.weightMemoryGiB + result.kvCacheMemoryGiB + result.runtimeReserveGiB,
  );
});

test("accounts for quantization metadata with conservative effective bytes per parameter", () => {
  const fp16 = estimateVram({
    parametersB: 1,
    weightFormat: "fp16",
    layers: 1,
    kvHeads: 1,
    headDimension: 1,
    contextLength: 1,
    batchSize: 1,
  });
  const int8 = estimateVram({
    parametersB: 1,
    weightFormat: "int8",
    layers: 1,
    kvHeads: 1,
    headDimension: 1,
    contextLength: 1,
    batchSize: 1,
  });
  const int4 = estimateVram({
    parametersB: 1,
    weightFormat: "int4",
    layers: 1,
    kvHeads: 1,
    headDimension: 1,
    contextLength: 1,
    batchSize: 1,
  });
  assert.ok(int8.weightMemoryGiB < fp16.weightMemoryGiB);
  assert.ok(int4.weightMemoryGiB < int8.weightMemoryGiB);
});

test("rejects non-positive, non-finite and non-integer architecture inputs", () => {
  assert.throws(
    () =>
      estimateVram({
        parametersB: 0,
        weightFormat: "fp16",
        layers: 1,
        kvHeads: 1,
        headDimension: 1,
        contextLength: 1,
        batchSize: 1,
      }),
    /parametersB/,
  );
  assert.throws(
    () =>
      estimateVram({
        parametersB: 7,
        weightFormat: "fp16",
        layers: 1.5,
        kvHeads: 1,
        headDimension: 1,
        contextLength: 1,
        batchSize: 1,
      }),
    /layers/,
  );
  assert.throws(
    () =>
      estimateVram({
        parametersB: 7,
        weightFormat: "unknown",
        layers: 1,
        kvHeads: 1,
        headDimension: 1,
        contextLength: 1,
        batchSize: 1,
      }),
    /weightFormat/,
  );
});

test("rejects excessive reserve percentages", () => {
  assert.throws(
    () =>
      estimateVram({
        parametersB: 7,
        weightFormat: "fp16",
        layers: 1,
        kvHeads: 1,
        headDimension: 1,
        contextLength: 1,
        batchSize: 1,
        runtimeReservePercent: 101,
      }),
    /runtimeReservePercent/,
  );
});
