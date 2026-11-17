import { estimateVram, type VramEstimateInput } from "./vram-estimator.ts";

const SHARE_VERSION = "1";

export function serializeVramShareParams(input: VramEstimateInput): string {
  estimateVram(input);
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
    return input;
  } catch {
    return null;
  }
}
