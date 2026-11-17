import assert from "node:assert/strict";
import test from "node:test";
import {
  assessSingleGpuCapacity,
  assessTensorParallelCapacity,
  GPU_CATALOG,
} from "./gpu-capacity.ts";

test("converts manufacturer-advertised decimal GB into binary GiB", () => {
  const expected = [
    ["rtx-4090", 24],
    ["rtx-5090", 32],
    ["rtx-6000-ada", 48],
    ["a100-80gb", 80],
    ["h100-sxm-80gb", 80],
    ["h200-141gb", 141],
  ];
  for (const [id, memoryGB] of expected) {
    const gpu = GPU_CATALOG.find((candidate) => candidate.id === id);
    assert.ok(gpu);
    assert.equal(gpu.memoryGB, memoryGB);
    assert.ok(Math.abs(gpu.memoryGiB - (memoryGB * 1_000_000_000) / 1_073_741_824) < 1e-9);
    assert.ok(gpu.sourceUrl.startsWith("https://"));
  }
});

test("classifies capacity fit using explicit headroom after GB-to-GiB conversion", () => {
  const assessment = assessSingleGpuCapacity(20, 0.9);
  assert.equal(assessment.find((gpu) => gpu.id === "rtx-4090")?.status, "fit");
  assert.equal(assessment.find((gpu) => gpu.id === "rtx-5090")?.status, "fit");
  assert.equal(assessment.find((gpu) => gpu.id === "rtx-6000-ada")?.status, "fit");
  assert.equal(assessment.find((gpu) => gpu.id === "a100-80gb")?.status, "fit");
  assert.equal(assessment.find((gpu) => gpu.id === "h100-sxm-80gb")?.status, "fit");
  assert.equal(assessment.find((gpu) => gpu.gpuId === "h200-141gb")?.status, "fit");
});

test("does not mark a GPU as fit when required memory exceeds usable capacity", () => {
  const assessment = assessSingleGpuCapacity(30, 0.9);
  assert.equal(assessment.find((gpu) => gpu.id === "rtx-4090")?.status, "insufficient");
  assert.equal(assessment.find((gpu) => gpu.id === "rtx-5090")?.status, "insufficient");
  assert.equal(assessment.find((gpu) => gpu.id === "rtx-6000-ada")?.status, "fit");
});

test("rejects invalid requirements and headroom fractions", () => {
  assert.throws(() => assessSingleGpuCapacity(-1), /requiredGiB/);
  assert.throws(() => assessSingleGpuCapacity(10, 0), /usableFraction/);
  assert.throws(() => assessSingleGpuCapacity(10, 1.1), /usableFraction/);
});

test("applies headroom to the corrected binary capacity", () => {
  const result = assessSingleGpuCapacity(20.2, 0.9);
  const rtx4090 = result.find((gpu) => gpu.id === "rtx-4090");
  assert.ok(rtx4090);
  assert.equal(rtx4090.status, "insufficient");
  assert.ok(Math.abs(rtx4090.usableMemoryGiB - 20.116567611694336) < 1e-9);
});

test("estimates vLLM-style tensor-parallel sharding and interconnect metadata", () => {
  const result = assessTensorParallelCapacity({
    gpuId: "h100-sxm-80gb",
    weightMemoryGiB: 130.385,
    kvCacheMemoryGiB: 10,
    attentionHeads: 64,
    kvHeads: 8,
    tensorParallelSize: 4,
    runtimeReservePercent: 15,
    usableFraction: 0.9,
  });
  assert.equal(result.status, "fit");
  assert.equal(result.kvPlacement, "sharded");
  assert.equal(result.kvHeadsPerGpu, 2);
  assert.equal(result.tensorParallelSize, 4);
  assert.equal(result.interconnectClass, "nvlink");
  assert.ok(result.requiredMemoryPerGpuGiB > 0);
  assert.ok(result.availableMemoryPerGpuGiB > result.requiredMemoryPerGpuGiB);
});

test("accounts for KV-head replication when tensor parallel size exceeds KV heads", () => {
  const result = assessTensorParallelCapacity({
    gpuId: "h100-sxm-80gb",
    weightMemoryGiB: 130.385,
    kvCacheMemoryGiB: 10,
    attentionHeads: 64,
    kvHeads: 8,
    tensorParallelSize: 16,
    runtimeReservePercent: 15,
    usableFraction: 0.9,
  });
  assert.equal(result.kvPlacement, "replicated");
  assert.equal(result.kvHeadsPerGpu, 1);
  assert.ok(result.kvCachePerGpuGiB > 0);
});

test("rejects tensor-parallel degrees incompatible with attention or KV head layout", () => {
  assert.throws(
    () =>
      assessTensorParallelCapacity({
        gpuId: "h100-sxm-80gb",
        weightMemoryGiB: 100,
        kvCacheMemoryGiB: 10,
        attentionHeads: 64,
        kvHeads: 8,
        tensorParallelSize: 3,
      }),
    RangeError,
  );
  assert.throws(
    () =>
      assessTensorParallelCapacity({
        gpuId: "h100-sxm-80gb",
        weightMemoryGiB: 100,
        kvCacheMemoryGiB: 10,
        attentionHeads: 64,
        kvHeads: 12,
        tensorParallelSize: 8,
      }),
    RangeError,
  );
});

test("reports insufficient per-GPU memory even when aggregate VRAM appears sufficient", () => {
  const result = assessTensorParallelCapacity({
    gpuId: "rtx-4090",
    weightMemoryGiB: 130,
    kvCacheMemoryGiB: 10,
    attentionHeads: 64,
    kvHeads: 8,
    tensorParallelSize: 2,
    runtimeReservePercent: 15,
    usableFraction: 0.9,
  });
  assert.equal(result.status, "insufficient");
  assert.equal(result.interconnectClass, "pcie");
  assert.ok(result.requiredMemoryPerGpuGiB > result.availableMemoryPerGpuGiB);
});
