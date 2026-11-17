export interface GpuCapacity {
  id: string;
  name: string;
  memoryGiB: number;
  sourceUrl: string;
}

export interface GpuCapacityAssessment extends GpuCapacity {
  usableMemoryGiB: number;
  status: "fit" | "insufficient";
}

export const GPU_CATALOG = [
  {
    id: "rtx-4090",
    name: "GeForce RTX 4090",
    memoryGiB: 24,
    sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/",
  },
  {
    id: "rtx-5090",
    name: "GeForce RTX 5090",
    memoryGiB: 32,
    sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/",
  },
  {
    id: "rtx-6000-ada",
    name: "NVIDIA RTX 6000 Ada Generation",
    memoryGiB: 48,
    sourceUrl: "https://www.nvidia.com/en-us/products/workstations/rtx-6000/",
  },
  {
    id: "a100-80gb",
    name: "NVIDIA A100 80GB",
    memoryGiB: 80,
    sourceUrl: "https://www.nvidia.com/en-us/data-center/a100/",
  },
  {
    id: "h100-sxm-80gb",
    name: "NVIDIA H100 SXM",
    memoryGiB: 80,
    sourceUrl: "https://resources.nvidia.com/en-us-gpu-resources/h100-datasheet-24306",
  },
  {
    id: "h200-141gb",
    name: "NVIDIA H200 (preliminary specifications)",
    memoryGiB: 141,
    sourceUrl: "https://www.nvidia.com/en-us/data-center/h200/",
  },
] as const satisfies readonly GpuCapacity[];

export function assessSingleGpuCapacity(
  requiredGiB: number,
  usableFraction = 0.9,
): GpuCapacityAssessment[] {
  if (!Number.isFinite(requiredGiB) || requiredGiB <= 0) {
    throw new RangeError("requiredGiB must be a positive finite number");
  }
  if (!Number.isFinite(usableFraction) || usableFraction <= 0 || usableFraction > 1) {
    throw new RangeError("usableFraction must be greater than 0 and at most 1");
  }

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
