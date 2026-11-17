import { estimateVram, type VramEstimateInput } from "./vram-estimator.ts";

const SHARE_VERSION = "1";
const SHARE_LIMITS = {
  parametersB: 1000,
  layers: 512,
  kvHeads: 256,
  headDimension: 1024,
  contextLength: 1_048_576,
  batchSize: 1024,
} as const;

export function serializeVramShareParams(input: VramEstimateInput): string {
  estimateVram(input);
  if (
    input.parametersB > SHARE_LIMITS.parametersB ||
    input.layers > SHARE_LIMITS.layers ||
    input.kvHeads > SHARE_LIMITS.kvHeads ||
    input.headDimension > SHARE_LIMITS.headDimension ||
    input.contextLength > SHARE_LIMITS.contextLength ||
    input.batchSize > SHARE_LIMITS.batchSize
  ) {
    throw new RangeError("VRAM share input exceeds the supported URL limits.");
  }
  const params = new URLSearchParams();
  params.set("v", SHARE_VERSION);
  params.set("parametersB", String(input.parametersB));
  params.set("weightFormat", input.weightFormat);
  params.set("layers", String(input.layers));
  params.set("kvHeads", String(input.kvHeads));
  params.set("headDimension", String(input.headDimension));
  params.set("contextLength", String(input.contextLength));
  params.set("batchSize", String(input.batchSize));
  params.set("kvCacheFormat", input.kvCacheFormat ?? "fp16");
  params.set("runtimeReservePercent", String(input.runtimeReservePercent ?? 15));
  return params.toString();
}

export function parseVramShareParams(params: URLSearchParams): VramEstimateInput | null {
  if (params.get("v") !== SHARE_VERSION) return null;

  const requiredKeys = [
    "parametersB",
    "weightFormat",
    "layers",
    "kvHeads",
    "headDimension",
    "contextLength",
    "batchSize",
    "kvCacheFormat",
    "runtimeReservePercent",
  ] as const;
  if (requiredKeys.some((key) => params.get(key) === null)) return null;

  const input: VramEstimateInput = {
    parametersB: Number(params.get("parametersB")),
    weightFormat: params.get("weightFormat") as VramEstimateInput["weightFormat"],
    layers: Number(params.get("layers")),
    kvHeads: Number(params.get("kvHeads")),
    headDimension: Number(params.get("headDimension")),
    contextLength: Number(params.get("contextLength")),
    batchSize: Number(params.get("batchSize")),
    kvCacheFormat: params.get("kvCacheFormat") as VramEstimateInput["kvCacheFormat"],
    runtimeReservePercent: Number(params.get("runtimeReservePercent")),
  };

  try {
    estimateVram(input);
    if (
      input.parametersB > SHARE_LIMITS.parametersB ||
      input.layers > SHARE_LIMITS.layers ||
      input.kvHeads > SHARE_LIMITS.kvHeads ||
      input.headDimension > SHARE_LIMITS.headDimension ||
      input.contextLength > SHARE_LIMITS.contextLength ||
      input.batchSize > SHARE_LIMITS.batchSize
    ) {
      return null;
    }
    return input;
  } catch {
    return null;
  }
}
