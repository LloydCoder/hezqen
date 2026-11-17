import assert from "node:assert/strict";
import test from "node:test";
import { VRAM_MODEL_PRESETS, getVramModelPreset } from "./vram-presets.ts";

test("ships model presets with traceable source metadata and architecture fields", () => {
  assert.ok(VRAM_MODEL_PRESETS.length >= 2);
  for (const preset of VRAM_MODEL_PRESETS) {
    assert.ok(preset.id);
    assert.ok(preset.name);
    assert.ok(preset.sourceUrl.startsWith("https://"));
    assert.ok(preset.parametersB > 0);
    assert.ok(preset.layers > 0);
    assert.ok(preset.kvHeads > 0);
    assert.ok(preset.attentionHeads >= preset.kvHeads);
    assert.equal(preset.attentionHeads % preset.kvHeads, 0);
    assert.ok(preset.headDimension > 0);
    assert.ok(preset.maxContextLength > 0);
  }
});

test("includes Llama 3.3 70B with its documented GQA architecture", () => {
  const llama = getVramModelPreset("llama-3.3-70b-instruct");
  assert.ok(llama);
  assert.equal(llama.parametersB, 70.6);
  assert.equal(llama.layers, 80);
  assert.equal(llama.attentionHeads, 64);
  assert.equal(llama.kvHeads, 8);
  assert.equal(llama.headDimension, 128);
  assert.equal(llama.maxContextLength, 131072);
  assert.match(llama.configUrl, /Llama-3\.3-70B-Instruct/);
});

test("resolves known presets and rejects unknown identifiers", () => {
  assert.equal(getVramModelPreset("qwen2.5-14b-instruct")?.layers, 48);
  assert.equal(getVramModelPreset("not-a-model"), null);
});

test("does not silently model unsupported attention architectures", () => {
  assert.ok(VRAM_MODEL_PRESETS.every((preset) => preset.attentionType === "gqa"));
});
