"use client";

import { useMemo, useState } from "react";
import { estimateVram, type CacheFormat, type WeightFormat } from "@/domain/labs/vram-estimator";

const formats: WeightFormat[] = ["fp16", "bf16", "int8", "int4"];
const cacheFormats: CacheFormat[] = ["fp16", "bf16", "fp8", "int8"];

function NumberField({
  label,
  value,
  onChange,
  min = 1,
  step = 1,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  step?: number;
}) {
  return (
    <label className="vram-field">
      <span>{label}</span>
      <input type="number" min={min} step={step} value={value} onChange={(event) => onChange(event.target.value)} />
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
        {options.map((option) => <option key={option} value={option}>{option.toUpperCase()}</option>)}
      </select>
    </label>
  );
}

export default function VramCalculatorPage() {
  const [parametersB, setParametersB] = useState("7");
  const [weightFormat, setWeightFormat] = useState<WeightFormat>("int4");
  const [layers, setLayers] = useState("32");
  const [kvHeads, setKvHeads] = useState("8");
  const [headDimension, setHeadDimension] = useState("128");
  const [contextLength, setContextLength] = useState("4096");
  const [batchSize, setBatchSize] = useState("1");
  const [kvCacheFormat, setKvCacheFormat] = useState<CacheFormat>("fp16");
  const [runtimeReservePercent, setRuntimeReservePercent] = useState("15");

  const result = useMemo(() => {
    try {
      return {
        value: estimateVram({
          parametersB: Number(parametersB),
          weightFormat,
          layers: Number(layers),
          kvHeads: Number(kvHeads),
          headDimension: Number(headDimension),
          contextLength: Number(contextLength),
          batchSize: Number(batchSize),
          kvCacheFormat,
          runtimeReservePercent: Number(runtimeReservePercent),
        }),
        error: null,
      };
    } catch (error) {
      return { value: null, error: error instanceof Error ? error.message : "Invalid calculator input." };
    }
  }, [parametersB, weightFormat, layers, kvHeads, headDimension, contextLength, batchSize, kvCacheFormat, runtimeReservePercent]);

  const formatGiB = (value: number) => `${value.toFixed(2)} GiB`;

  return (
    <main className="vram-page">
      <div className="container">
        <a className="back-link" href="/">← HEZQEN home</a>
        <p className="eyebrow"><span className="eyebrow-line" /> HEZQEN LABS / MODEL INFRASTRUCTURE</p>
        <h1>LLM VRAM <em>sizing calculator</em></h1>
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
              <NumberField label="Model parameters (billions)" value={parametersB} onChange={setParametersB} min={0.01} step={0.1} />
              <SelectField label="Model weight format" value={weightFormat} options={formats} onChange={setWeightFormat} />
              <NumberField label="Transformer layers" value={layers} onChange={setLayers} />
              <NumberField label="KV heads (GQA/MQA)" value={kvHeads} onChange={setKvHeads} />
              <NumberField label="Head dimension" value={headDimension} onChange={setHeadDimension} />
              <NumberField label="Context length (tokens)" value={contextLength} onChange={setContextLength} />
              <NumberField label="Concurrent batch size" value={batchSize} onChange={setBatchSize} />
              <SelectField label="KV cache format" value={kvCacheFormat} options={cacheFormats} onChange={setKvCacheFormat} />
              <NumberField label="Runtime reserve (%)" value={runtimeReservePercent} onChange={setRuntimeReservePercent} min={0} />
            </div>
            <p className="vram-footnote">All numeric inputs must be positive whole numbers except model size and runtime reserve.</p>
          </section>

          <section className="vram-results" aria-live="polite" aria-labelledby="vram-results-heading">
            <p className="section-label">ESTIMATED MEMORY FOOTPRINT</p>
            <h2 id="vram-results-heading">GPU memory requirement</h2>
            {result.error ? (
              <p className="vram-error" role="alert">{result.error}</p>
            ) : result.value ? (
              <>
                <p className="vram-total">{formatGiB(result.value.totalMemoryGiB)}</p>
                <p className="vram-recommendation">Plan for at least <strong>{result.value.recommendedVramGiB} GiB</strong> of available VRAM.</p>
                <div className="vram-breakdown">
                  <div><span>Model weights</span><strong>{formatGiB(result.value.weightMemoryGiB)}</strong></div>
                  <div><span>KV cache</span><strong>{formatGiB(result.value.kvCacheMemoryGiB)}</strong></div>
                  <div><span>Runtime reserve</span><strong>{formatGiB(result.value.runtimeReserveGiB)}</strong></div>
                </div>
                <p className="vram-assumption">Weight storage uses {result.value.assumptions.weightBytesPerParameter} bytes per parameter. KV cache uses {result.value.assumptions.kvCacheBytesPerElement} bytes per element. Runtime reserve: {result.value.assumptions.runtimeReservePercent}%.</p>
              </>
            ) : null}
          </section>
        </div>

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
            It does not include every allocator or system-level overhead.
          </p>
        </section>
      </div>
    </main>
  );
}
