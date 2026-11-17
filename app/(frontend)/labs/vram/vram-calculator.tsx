"use client";

import { useEffect, useMemo, useState } from "react";
import { assessSingleGpuCapacity } from "@/domain/labs/gpu-capacity";
import MultiGpuCapacityPanel from "./multi-gpu-capacity-panel";
import {
  estimateVram,
  type CacheFormat,
  type VramEstimateInput,
  type WeightFormat,
} from "@/domain/labs/vram-estimator";
import { getVramModelPreset, VRAM_MODEL_PRESETS } from "@/domain/labs/vram-presets";
import { parseVramShareParams, serializeVramShareParams } from "@/domain/labs/vram-sharing";

const formats: WeightFormat[] = ["fp16", "bf16", "int8", "int4"];
const cacheFormats: CacheFormat[] = ["fp16", "bf16", "fp8", "int8"];

const defaults = {
  parametersB: "7",
  weightFormat: "int4" as WeightFormat,
  layers: "32",
  attentionHeads: "32",
  kvHeads: "8",
  headDimension: "128",
  contextLength: "4096",
  batchSize: "1",
  kvCacheFormat: "fp16" as CacheFormat,
  runtimeReservePercent: "15",
};

function NumberField({
  label,
  value,
  onChange,
  min = 1,
  max,
  step = 1,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="vram-field">
      <span>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="vram-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function VramCalculatorPage() {
  const [values, setValues] = useState(defaults);
  const [presetId, setPresetId] = useState("custom");
  const [shareFeedback, setShareFeedback] = useState("");

  useEffect(() => {
    const shared = parseVramShareParams(new URLSearchParams(window.location.search));
    if (!shared) return;
    setValues({
      parametersB: String(shared.parametersB),
      weightFormat: shared.weightFormat,
      layers: String(shared.layers),
      attentionHeads: String(shared.attentionHeads ?? 32),
      kvHeads: String(shared.kvHeads),
      headDimension: String(shared.headDimension),
      contextLength: String(shared.contextLength),
      batchSize: String(shared.batchSize),
      kvCacheFormat: shared.kvCacheFormat ?? "fp16",
      runtimeReservePercent: String(shared.runtimeReservePercent ?? 15),
    });
    setPresetId("custom");
  }, []);

  const update = (key: keyof typeof defaults) => (value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const input = useMemo<VramEstimateInput>(
    () => ({
      parametersB: Number(values.parametersB),
      weightFormat: values.weightFormat,
      layers: Number(values.layers),
      attentionHeads: Number(values.attentionHeads),
      kvHeads: Number(values.kvHeads),
      headDimension: Number(values.headDimension),
      contextLength: Number(values.contextLength),
      batchSize: Number(values.batchSize),
      kvCacheFormat: values.kvCacheFormat,
      runtimeReservePercent: Number(values.runtimeReservePercent),
    }),
    [values],
  );

  const result = useMemo(() => {
    try {
      return { value: estimateVram(input), error: null };
    } catch (error) {
      return {
        value: null,
        error: error instanceof Error ? error.message : "Invalid calculator input.",
      };
    }
  }, [input]);

  const gpuMatches = useMemo(
    () => (result.value ? assessSingleGpuCapacity(result.value.totalMemoryGiB) : []),
    [result.value],
  );
  const activePreset = getVramModelPreset(presetId);
  const formatGiB = (value: number) => `${value.toFixed(2)} GiB`;

  function applyPreset(id: string) {
    setPresetId(id);
    const preset = getVramModelPreset(id);
    if (!preset) return;
    setValues((current) => ({
      ...current,
      parametersB: String(preset.parametersB),
      layers: String(preset.layers),
      attentionHeads: String(preset.attentionHeads),
      kvHeads: String(preset.kvHeads),
      headDimension: String(preset.headDimension),
      contextLength: String(Math.min(4096, preset.maxContextLength)),
    }));
  }

  async function copyText(value: string, successMessage: string) {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard access is unavailable in this browser.");
      }
      await navigator.clipboard.writeText(value);
      setShareFeedback(successMessage);
    } catch {
      setShareFeedback("Copy was unavailable. You can copy the values from the address bar.");
    }
  }

  function buildShareUrl(): string | null {
    try {
      const url = new URL(window.location.origin + window.location.pathname);
      url.search = serializeVramShareParams(input);
      return url.toString();
    } catch {
      setShareFeedback(
        "This configuration is outside the supported share-link limits. Reduce the input values and try again.",
      );
      return null;
    }
  }

  function copyShareLink() {
    const shareUrl = buildShareUrl();
    if (shareUrl) void copyText(shareUrl, "Shareable calculator URL copied.");
  }

  function copySummary() {
    if (!result.value) return;
    const shareUrl = buildShareUrl();
    if (!shareUrl) return;
    const summary = [
      "HEZQEN Labs — LLM VRAM estimate",
      `Calculator version: ${result.value.calculatorVersion}`,
      `Formula version: ${result.value.formulaVersion}`,
      `Model parameters: ${input.parametersB}B`,
      `Weight format: ${input.weightFormat.toUpperCase()}`,
      `Architecture: ${input.layers} layers, ${input.attentionHeads} attention heads, ${input.kvHeads} KV heads, ${input.headDimension} head dimension`,
      `Context length: ${input.contextLength} tokens`,
      `Batch size: ${input.batchSize}`,
      `KV cache format: ${(input.kvCacheFormat ?? "fp16").toUpperCase()}`,
      `Estimated total: ${formatGiB(result.value.totalMemoryGiB)}`,
      `Recommended available VRAM: at least ${result.value.recommendedVramGiB} GiB`,
      "Planning estimate only; not a hardware benchmark or guaranteed fit.",
      shareUrl,
    ].join("\n");
    void copyText(summary, "Calculation summary copied.");
  }

  return (
    <section className="vram-page">
      <div className="container">
        <a className="back-link" href="/">
          ← HEZQEN home
        </a>
        <p className="eyebrow">
          <span className="eyebrow-line" /> HEZQEN LABS / MODEL INFRASTRUCTURE
        </p>
        <h1>
          LLM VRAM <em>sizing calculator</em>
        </h1>
        <p className="vram-lede">
          Estimate model-weight memory, key-value cache and runtime headroom before choosing a GPU.
          Adjust the architecture and serving assumptions to model your workload.
        </p>

        <div className="vram-layout">
          <section className="vram-panel" aria-labelledby="vram-input-heading">
            <div className="vram-panel-heading">
              <p className="section-label">CONFIGURATION</p>
              <h2 id="vram-input-heading">Model and serving parameters</h2>
            </div>
            <div className="vram-fields">
              <label className="vram-field">
                <span>Model preset</span>
                <select value={presetId} onChange={(event) => applyPreset(event.target.value)}>
                  <option value="custom">Custom architecture</option>
                  {VRAM_MODEL_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name}
                    </option>
                  ))}
                </select>
              </label>
              <NumberField
                label="Model parameters (billions)"
                value={values.parametersB}
                onChange={update("parametersB")}
                min={0.01}
                step={0.1}
              />
              <SelectField
                label="Model weight format"
                value={values.weightFormat}
                options={formats}
                onChange={(value) => setValues((current) => ({ ...current, weightFormat: value }))}
              />
              <NumberField
                label="Transformer layers"
                value={values.layers}
                onChange={update("layers")}
              />
              <NumberField
                label="Query attention heads"
                value={values.attentionHeads}
                onChange={update("attentionHeads")}
                max={256}
              />
              <NumberField
                label="KV heads (GQA/MQA)"
                value={values.kvHeads}
                onChange={update("kvHeads")}
              />
              <NumberField
                label="Head dimension"
                value={values.headDimension}
                onChange={update("headDimension")}
              />
              <NumberField
                label="Context length (tokens)"
                value={values.contextLength}
                onChange={update("contextLength")}
              />
              <NumberField
                label="Concurrent batch size"
                value={values.batchSize}
                onChange={update("batchSize")}
              />
              <SelectField
                label="KV cache format"
                value={values.kvCacheFormat}
                options={cacheFormats}
                onChange={(value) => setValues((current) => ({ ...current, kvCacheFormat: value }))}
              />
              <NumberField
                label="Runtime reserve (%)"
                value={values.runtimeReservePercent}
                onChange={update("runtimeReservePercent")}
                min={0}
              />
            </div>
            {activePreset ? (
              <p className="vram-footnote">
                Architecture values are based on the{" "}
                <a href={activePreset.sourceUrl} target="_blank" rel="noreferrer">
                  model card
                </a>{" "}
                and{" "}
                <a href={activePreset.configUrl} target="_blank" rel="noreferrer">
                  configuration
                </a>
                . Verified {activePreset.sourceVerifiedAt}. Quantization and serving context remain
                adjustable.
              </p>
            ) : (
              <p className="vram-footnote">
                Presets are starting points. Confirm the exact model revision and runtime
                configuration before procurement or deployment.
              </p>
            )}
            {activePreset && Number(values.contextLength) > activePreset.maxContextLength ? (
              <p className="vram-warning" role="status">
                This context length exceeds the preset's default configuration limit of{" "}
                {activePreset.maxContextLength.toLocaleString()} tokens. Extended context may
                require model-specific RoPE/YaRN scaling or runtime configuration that this
                calculator does not validate.
              </p>
            ) : null}
            <p className="vram-footnote">
              All numeric inputs must be positive whole numbers except model size and runtime
              reserve.
            </p>
            <div className="vram-share-actions">
              <button
                type="button"
                className="button-primary"
                onClick={copyShareLink}
                disabled={!result.value}
              >
                Copy share link
              </button>
              <button
                type="button"
                className="button-primary"
                onClick={copySummary}
                disabled={!result.value}
              >
                Copy result summary
              </button>
            </div>
            {shareFeedback ? (
              <p className="vram-share-feedback" role="status">
                {shareFeedback}
              </p>
            ) : null}
          </section>

          <section
            className="vram-results"
            aria-live="polite"
            aria-labelledby="vram-results-heading"
          >
            <p className="section-label">ESTIMATED MEMORY FOOTPRINT</p>
            <h2 id="vram-results-heading">GPU memory requirement</h2>
            {result.error ? (
              <p className="vram-error" role="alert">
                {result.error}
              </p>
            ) : result.value ? (
              <>
                <p className="vram-total">{formatGiB(result.value.totalMemoryGiB)}</p>
                <p className="vram-recommendation">
                  Plan for at least <strong>{result.value.recommendedVramGiB} GiB</strong> of
                  available VRAM.
                </p>
                <div className="vram-breakdown">
                  <div>
                    <span>Model weights</span>
                    <strong>{formatGiB(result.value.weightMemoryGiB)}</strong>
                  </div>
                  <div>
                    <span>KV cache</span>
                    <strong>{formatGiB(result.value.kvCacheMemoryGiB)}</strong>
                  </div>
                  <div>
                    <span>Runtime reserve</span>
                    <strong>{formatGiB(result.value.runtimeReserveGiB)}</strong>
                  </div>
                </div>
                <p className="vram-assumption">
                  Weight storage uses {result.value.assumptions.weightBytesPerParameter} bytes per
                  parameter. KV cache uses {result.value.assumptions.kvCacheBytesPerElement} bytes
                  per element. Runtime reserve: {result.value.assumptions.runtimeReservePercent}%.
                </p>
              </>
            ) : null}
          </section>
        </div>

        {result.value ? (
          <>
            <section className="vram-gpu-matches" aria-labelledby="vram-gpu-heading">
            <p className="section-label">HARDWARE CAPACITY CHECK</p>
            <h2 id="vram-gpu-heading">Single-GPU memory fit</h2>
            <p>
              This compares the estimate with 90% of each GPU's published memory capacity, leaving
              10% headroom. It is a capacity screen only—not a guarantee that a model will load or
              meet throughput targets. Multi-GPU memory is not summed because topology,
              interconnect and framework behaviour affect fit. The tensor-parallel screen below estimates per-GPU memory placement separately.
            </p>
            <ul className="vram-gpu-list">
              {gpuMatches.map((gpu) => (
                <li key={gpu.id}>
                  <span>
                    <strong>{gpu.name}</strong>
                    <small>
                      {gpu.memoryGB} GB advertised ({gpu.memoryGiB.toFixed(2)} GiB) · {gpu.usableMemoryGiB.toFixed(1)} GiB planning capacity
                    </small>
                  </span>
                  <span className={gpu.status === "fit" ? "vram-gpu-fit" : "vram-gpu-no-fit"}>
                    {gpu.status === "fit" ? "Capacity fit" : "Insufficient"}
                  </span>
                  <a href={gpu.sourceUrl} target="_blank" rel="noreferrer">
                    Specifications
                  </a>
                </li>
              ))}
            </ul>
          </section>
            <MultiGpuCapacityPanel
              weightMemoryGiB={result.value.weightMemoryGiB}
              kvCacheMemoryGiB={result.value.kvCacheMemoryGiB}
              attentionHeads={input.attentionHeads ?? 32}
              kvHeads={input.kvHeads}
              runtimeReservePercent={input.runtimeReservePercent ?? 15}
            />
          </>
        ) : null}

        <section className="vram-method">
          <p className="section-label">METHODOLOGY & LIMITATIONS</p>
          <h2>What this estimate includes</h2>
          <p>
            Weight memory is parameter count multiplied by effective bytes per parameter. KV-cache
            memory is estimated as 2 × layers × batch × context × KV heads × head dimension × cache
            bytes. A configurable reserve is then applied to the combined estimate.
          </p>
          <p>
            INT8 and INT4 use conservative effective storage assumptions that include a metadata
            allowance. This is a planning estimate, not a hardware benchmark or a guarantee of fit.
            Actual allocation varies with architecture, quantization implementation, attention
            backend, tensor parallelism, fragmentation, CUDA graphs, runtime and serving framework.
            GPU manufacturers advertise decimal GB; this calculator converts those values to binary
            GiB before applying headroom. The tensor-parallel screen estimates idealized weight/KV
            placement and lists SKU-level interconnect details, but does not validate server topology
            or performance. Architectures using MLA, heterogeneous layer layouts or sliding-window
            cache behaviour may require a different formula and are not represented by the presets.
          </p>
        </section>
      </div>
    </section>
  );
}
