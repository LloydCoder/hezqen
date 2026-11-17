export interface VramModelPreset {
  id: string;
  name: string;
  provider: string;
  parametersB: number;
  layers: number;
  kvHeads: number;
  headDimension: number;
  maxContextLength: number;
  attentionType: "gqa";
  sourceUrl: string;
  configUrl: string;
  sourceVerifiedAt: string;
}

export const VRAM_MODEL_PRESETS = [
  {
    id: "mistral-7b-instruct-v0.3",
    name: "Mistral 7B Instruct v0.3",
    provider: "Mistral AI",
    parametersB: 7,
    layers: 32,
    kvHeads: 8,
    headDimension: 128,
    maxContextLength: 32768,
    attentionType: "gqa",
    sourceUrl: "https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3",
    configUrl: "https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3/blob/41ee164278abb69f607540425b8682669bec3ca6/config.json",
    sourceVerifiedAt: "2026-11-17",
  },
  {
    id: "qwen2.5-14b-instruct",
    name: "Qwen2.5 14B Instruct",
    provider: "Qwen",
    parametersB: 14.7,
    layers: 48,
    kvHeads: 8,
    headDimension: 128,
    maxContextLength: 32768,
    attentionType: "gqa",
    sourceUrl: "https://huggingface.co/Qwen/Qwen2.5-14B-Instruct",
    configUrl: "https://huggingface.co/Qwen/Qwen2.5-14B-Instruct/blob/76ca6ba/config.json",
    sourceVerifiedAt: "2026-11-17",
  },
] as const satisfies readonly VramModelPreset[];

export function getVramModelPreset(id: string): VramModelPreset | null {
  return VRAM_MODEL_PRESETS.find((preset) => preset.id === id) ?? null;
}
