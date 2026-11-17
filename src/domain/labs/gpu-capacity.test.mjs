import assert from "node:assert/strict";
import test from "node:test";
import { assessSingleGpuCapacity, GPU_CATALOG } from "./gpu-capacity.ts";

test("includes manufacturer-sourced GPU memory capacities", () => {
  assert.ok(GPU_CATALOG.some((gpu) => gpu.id === "rtx-4090" && gpu.memoryGiB === 24));
  assert.ok(GPU_CATALOG.some((gpu) => gpu.id === "rtx-5090" && gpu.memoryGiB === 32));
  assert.ok(GPU_CATALOG.some((gpu) => gpu.id === "rtx-6000-ada" && gpu.memoryGiB === 48));
  assert.ok(GPU_CATALOG.every((gpu) => gpu.sourceUrl.startsWith("https://")));
});

test("classifies capacity fit using explicit headroom, not raw VRAM alone", () => {
  const assessment = assessSingleGpuCapacity(20, 0.9);
  assert.equal(assessment.find((gpu) => gpu.id === "rtx-4090")?.status, "fit");
  assert.equal(assessment.find((gpu) => gpu.id === "rtx-5090")?.status, "fit");
  assert.equal(assessment.find((gpu) => gpu.id === "rtx-6000-ada")?.status, "fit");
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
