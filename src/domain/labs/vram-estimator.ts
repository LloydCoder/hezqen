export const VRAM_FORMULA_VERSION = "1.0.0";
export const VRAM_CALCULATOR_VERSION = "1.1.0";

export type WeightFormat = "fp16" | "bf16" | "int8" | "int4";
export type CacheFormat = "fp16" | "bf16" | "fp8" | "int8";

export interface VramEstimateInput {
  parametersB: number;
  weightFormat: WeightFormat;
  layers: number;
  kvHeads: number;
  headDimension: number;
  contextLength: number;
  batchSize: number;
  kvCacheFormat?: CacheFormat;
  runtimeReservePercent?: number;
}

export interface VramEstimate {
  formulaVersion: typeof VRAM_FORMULA_VERSION;
  calculatorVersion: typeof VRAM_CALCULATOR_VERSION;
  weightMemoryGiB: number;
  kvCacheMemoryGiB: number;
  runtimeReserveGiB: number;
  totalMemoryGiB: number;
  recommendedVramGiB: number;
  assumptions: {
    weightBytesPerParameter: number;
    kvCacheBytesPerElement: number;
    gibibyteBytes: number;
    runtimeReservePercent: number;
  };
}

const GIB = 1024 ** 3;
const WEIGHT_BYTES: Record<WeightFormat, number> = {
  fp16: 2,
  bf16: 2,
  // Effective payload includes a conservative allowance for scales/metadata.
  int8: 1.0625,
  int4: 0.5625,
};
const CACHE_BYTES: Record<CacheFormat, number> = {
  fp16: 2,
  bf16: 2,
  fp8: 1,
  int8: 1,
};

function assertPositiveFinite(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive finite number`);
  }
}

function assertPositiveInteger(name: string, value: number): void {
  assertPositiveFinite(name, value);
  if (!Number.isInteger(value)) {
    throw new RangeError(`${name} must be a positive integer`);
  }
}

export function estimateVram(input: VramEstimateInput): VramEstimate {
  assertPositiveFinite("parametersB", input.parametersB);
  assertPositiveInteger("layers", input.layers);
  assertPositiveInteger("kvHeads", input.kvHeads);
  assertPositiveInteger("headDimension", input.headDimension);
  assertPositiveInteger("contextLength", input.contextLength);
  assertPositiveInteger("batchSize", input.batchSize);

  const weightBytes = WEIGHT_BYTES[input.weightFormat];
  if (weightBytes === undefined) {
    throw new RangeError("weightFormat must be fp16, bf16, int8 or int4");
  }
  const cacheFormat = input.kvCacheFormat ?? "fp16";
  const cacheBytes = CACHE_BYTES[cacheFormat];
  if (cacheBytes === undefined) {
    throw new RangeError("kvCacheFormat must be fp16, bf16, fp8 or int8");
  }
  const reservePercent = input.runtimeReservePercent ?? 15;
  if (!Number.isFinite(reservePercent) || reservePercent < 0 || reservePercent > 100) {
    throw new RangeError("runtimeReservePercent must be between 0 and 100");
  }

  const weightMemoryGiB = (input.parametersB * 1_000_000_000 * weightBytes) / GIB;
  // K/V tensors: 2 × layers × batch × context × KV heads × head dimension.
  const kvCacheBytesTotal =
    2 *
    input.layers *
    input.batchSize *
    input.contextLength *
    input.kvHeads *
    input.headDimension *
    cacheBytes;
  const kvCacheMemoryGiB = kvCacheBytesTotal / GIB;
  const runtimeReserveGiB = (weightMemoryGiB + kvCacheMemoryGiB) * (reservePercent / 100);
  const totalMemoryGiB = weightMemoryGiB + kvCacheMemoryGiB + runtimeReserveGiB;

  return {
    formulaVersion: VRAM_FORMULA_VERSION,
    calculatorVersion: VRAM_CALCULATOR_VERSION,
    weightMemoryGiB,
    kvCacheMemoryGiB,
    runtimeReserveGiB,
    totalMemoryGiB,
    recommendedVramGiB: Math.ceil(totalMemoryGiB),
    assumptions: {
      weightBytesPerParameter: weightBytes,
      kvCacheBytesPerElement: cacheBytes,
      gibibyteBytes: GIB,
      runtimeReservePercent: reservePercent,
    },
  };
}
