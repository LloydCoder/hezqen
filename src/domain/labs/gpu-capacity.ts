const BYTES_PER_GB = 1_000_000_000;
const BYTES_PER_GIB = 1_073_741_824;

export type GpuInterconnectClass = "pcie" | "nvlink" | "sku-dependent";

export interface GpuCapacity {
  id: string;
  name: string;
  memoryGB: number;
  memoryGiB: number;
  interconnectClass: GpuInterconnectClass;
  interconnectLabel: string;
  sourceUrl: string;
}

export interface GpuCapacityAssessment extends GpuCapacity {
  usableMemoryGiB: number;
  status: "fit" | "insufficient";
}

export interface TensorParallelCapacityInput {
  gpuId: string;
  weightMemoryGiB: number;
  kvCacheMemoryGiB: number;
  attentionHeads: number;
  kvHeads: number;
  tensorParallelSize: number;
  runtimeReservePercent?: number;
  usableFraction?: number;
}

export interface TensorParallelCapacityAssessment {
  gpuId: string;
  gpuName: string;
  gpuMemoryGB: number;
  gpuMemoryGiB: number;
  tensorParallelSize: number;
  weightPerGpuGiB: number;
  kvHeadsPerGpu: number;
  kvCachePerGpuGiB: number;
  kvPlacement: "local" | "sharded" | "replicated";
  runtimeReserveGiB: number;
  requiredMemoryPerGpuGiB: number;
  availableMemoryPerGpuGiB: number;
  interconnectClass: GpuInterconnectClass;
  interconnectLabel: string;
  status: "fit" | "insufficient";
  warnings: string[];
}

function createGpu(
  gpu: Omit<GpuCapacity, "memoryGiB">,
): GpuCapacity {
  return {
    ...gpu,
    memoryGiB: (gpu.memoryGB * BYTES_PER_GB) / BYTES_PER_GIB,
  };
}

export const GPU_CATALOG = [
  createGpu({
    id: "rtx-4090",
    name: "GeForce RTX 4090",
    memoryGB: 24,
    interconnectClass: "pcie",
    interconnectLabel: "PCIe Gen 4; NVIDIA lists no NVLink support",
    sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/",
  }),
  createGpu({
    id: "rtx-5090",
    name: "GeForce RTX 5090",
    memoryGB: 32,
    interconnectClass: "pcie",
    interconnectLabel: "PCIe Gen 5; NVLink is not listed in the cited product specification",
    sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/",
  }),
  createGpu({
    id: "rtx-6000-ada",
    name: "NVIDIA RTX 6000 Ada Generation",
    memoryGB: 48,
    interconnectClass: "pcie",
    interconnectLabel: "PCIe Gen 4; NVIDIA datasheet lists no NVLink",
    sourceUrl: "https://www.nvidia.com/en-us/products/workstations/rtx-6000/",
  }),
  createGpu({
    id: "a100-80gb",
    name: "NVIDIA A100 80GB (PCIe/SXM variants)",
    memoryGB: 80,
    interconnectClass: "sku-dependent",
    interconnectLabel:
      "SKU dependent: PCIe supports an NVLink bridge for two GPUs; SXM uses NVLink up to 600 GB/s",
    sourceUrl: "https://www.nvidia.com/en-us/data-center/a100/",
  }),
  createGpu({
    id: "h100-sxm-80gb",
    name: "NVIDIA H100 SXM",
    memoryGB: 80,
    interconnectClass: "nvlink",
    interconnectLabel: "SXM with NVLink up to 900 GB/s per GPU",
    sourceUrl: "https://resources.nvidia.com/en-us-gpu-resources/h100-datasheet-24306",
  }),
  createGpu({
    id: "h200-141gb",
    name: "NVIDIA H200 (SXM/NVL variants; preliminary specifications)",
    memoryGB: 141,
    interconnectClass: "sku-dependent",
    interconnectLabel:
      "SXM NVLink or NVL bridge configurations up to 900 GB/s per GPU; verify exact server SKU",
    sourceUrl: "https://www.nvidia.com/en-us/data-center/h200/",
  }),
] as const satisfies readonly GpuCapacity[];

function assertPositiveFinite(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive finite number`);
  }
}

function assertNonNegativeFinite(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a finite non-negative number`);
  }
}

function assertPositiveInteger(name: string, value: number, max = Number.MAX_SAFE_INTEGER): void {
  assertPositiveFinite(name, value);
  if (!Number.isInteger(value) || value > max) {
    throw new RangeError(`${name} must be a positive integer no greater than ${max}`);
  }
}

function assertUsableFraction(usableFraction: number): void {
  if (!Number.isFinite(usableFraction) || usableFraction <= 0 || usableFraction > 1) {
    throw new RangeError("usableFraction must be greater than 0 and at most 1");
  }
}

export function assessSingleGpuCapacity(
  requiredGiB: number,
  usableFraction = 0.9,
): GpuCapacityAssessment[] {
  assertPositiveFinite("requiredGiB", requiredGiB);
  assertUsableFraction(usableFraction);

  return GPU_CATALOG.map((gpu) => {
    const usableMemoryGiB = gpu.memoryGiB * usableFraction;
    const status: GpuCapacityAssessment["status"] =
      requiredGiB <= usableMemoryGiB ? "fit" : "insufficient";
    return {
      ...gpu,
      usableMemoryGiB,
      status,
    };
  });
}

/**
 * Estimates idealized per-GPU memory for a vLLM-style tensor-parallel layout.
 * It models even weight sharding and KV-head sharding/replication only.
 * It does not model actual runtime buffers, uneven layers, communication or throughput.
 */
export function assessTensorParallelCapacity(
  input: TensorParallelCapacityInput,
): TensorParallelCapacityAssessment {
  assertNonNegativeFinite("weightMemoryGiB", input.weightMemoryGiB);
  assertNonNegativeFinite("kvCacheMemoryGiB", input.kvCacheMemoryGiB);
  assertPositiveInteger("attentionHeads", input.attentionHeads);
  assertPositiveInteger("kvHeads", input.kvHeads);
  assertPositiveInteger("tensorParallelSize", input.tensorParallelSize, 64);

  const runtimeReservePercent = input.runtimeReservePercent ?? 15;
  if (
    !Number.isFinite(runtimeReservePercent) ||
    runtimeReservePercent < 0 ||
    runtimeReservePercent > 100
  ) {
    throw new RangeError("runtimeReservePercent must be between 0 and 100");
  }
  const usableFraction = input.usableFraction ?? 0.9;
  assertUsableFraction(usableFraction);

  if (input.attentionHeads % input.tensorParallelSize !== 0) {
    throw new RangeError("attentionHeads must be divisible by tensorParallelSize");
  }

  let kvHeadsPerGpu: number;
  let kvPlacement: TensorParallelCapacityAssessment["kvPlacement"];
  if (input.kvHeads % input.tensorParallelSize === 0) {
    kvHeadsPerGpu = input.kvHeads / input.tensorParallelSize;
    kvPlacement = input.tensorParallelSize === 1 ? "local" : "sharded";
  } else if (input.tensorParallelSize % input.kvHeads === 0) {
    kvHeadsPerGpu = 1;
    kvPlacement = "replicated";
  } else {
    throw new RangeError(
      "tensorParallelSize must divide kvHeads or be divisible by kvHeads for this estimator",
    );
  }

  const gpu = GPU_CATALOG.find((candidate) => candidate.id === input.gpuId);
  if (!gpu) {
    throw new RangeError("gpuId must identify a supported GPU in the catalogue");
  }

  const weightPerGpuGiB = input.weightMemoryGiB / input.tensorParallelSize;
  const kvCachePerGpuGiB = input.kvCacheMemoryGiB * (kvHeadsPerGpu / input.kvHeads);
  const memoryBeforeReserveGiB = weightPerGpuGiB + kvCachePerGpuGiB;
  const runtimeReserveGiB = memoryBeforeReserveGiB * (runtimeReservePercent / 100);
  const requiredMemoryPerGpuGiB = memoryBeforeReserveGiB + runtimeReserveGiB;
  const availableMemoryPerGpuGiB = gpu.memoryGiB * usableFraction;
  const status: TensorParallelCapacityAssessment["status"] =
    requiredMemoryPerGpuGiB <= availableMemoryPerGpuGiB ? "fit" : "insufficient";

  const warnings = [
    "Memory-only planning estimate: actual framework allocations, uneven layers, replicated tensors, workspaces and communication buffers may differ.",
    "A capacity fit does not verify model/runtime compatibility, interconnect performance, latency or throughput.",
  ];
  if (gpu.interconnectClass === "pcie") {
    warnings.push(
      "The listed topology is PCIe. Tensor-parallel communication may be a bottleneck; benchmark the actual motherboard, PCIe root complex and GPU arrangement.",
    );
  } else if (gpu.interconnectClass === "sku-dependent") {
    warnings.push(
      "This GPU family has multiple form factors or interconnect options. Verify the exact SKU, server board and bridge/NVSwitch topology.",
    );
  } else {
    warnings.push(
      "NVLink is listed for this SKU family; verify the actual baseboard/NVSwitch configuration and runtime topology.",
    );
  }

  return {
    gpuId: gpu.id,
    gpuName: gpu.name,
    gpuMemoryGB: gpu.memoryGB,
    gpuMemoryGiB: gpu.memoryGiB,
    tensorParallelSize: input.tensorParallelSize,
    weightPerGpuGiB,
    kvHeadsPerGpu,
    kvCachePerGpuGiB,
    kvPlacement,
    runtimeReserveGiB,
    requiredMemoryPerGpuGiB,
    availableMemoryPerGpuGiB,
    interconnectClass: gpu.interconnectClass,
    interconnectLabel: gpu.interconnectLabel,
    status,
    warnings,
  };
}
