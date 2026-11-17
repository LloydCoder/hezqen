"use client";

import { useEffect, useMemo, useState } from "react";
import { assessTensorParallelCapacity, GPU_CATALOG } from "@/domain/labs/gpu-capacity";

interface MultiGpuCapacityPanelProps {
  weightMemoryGiB: number;
  kvCacheMemoryGiB: number;
  attentionHeads: number;
  kvHeads: number;
  runtimeReservePercent: number;
}

const tensorParallelOptions = [2, 4, 8, 16] as const;

function formatGiB(value: number): string {
  return `${value.toFixed(2)} GiB`;
}

export default function MultiGpuCapacityPanel({
  weightMemoryGiB,
  kvCacheMemoryGiB,
  attentionHeads,
  kvHeads,
  runtimeReservePercent,
}: MultiGpuCapacityPanelProps) {
  const [gpuId, setGpuId] = useState("h100-sxm-80gb");
  const [tensorParallelSize, setTensorParallelSize] = useState("4");
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedGpu = params.get("tpGpu");
    const requestedSize = params.get("tpSize");

    if (requestedGpu && GPU_CATALOG.some((gpu) => gpu.id === requestedGpu)) {
      setGpuId(requestedGpu);
    }
    if (requestedSize && tensorParallelOptions.some((size) => String(size) === requestedSize)) {
      setTensorParallelSize(requestedSize);
    }
  }, []);

  async function copyConfigurationLink() {
    const url = new URL(window.location.href);
    url.searchParams.set("tpGpu", gpuId);
    url.searchParams.set("tpSize", tensorParallelSize);

    try {
      await navigator.clipboard.writeText(url.toString());
      setShareStatus("Configuration link copied.");
    } catch {
      setShareStatus("Clipboard access is unavailable in this browser.");
    }
  }

  const result = useMemo(() => {
    try {
      return {
        value: assessTensorParallelCapacity({
          gpuId,
          weightMemoryGiB,
          kvCacheMemoryGiB,
          attentionHeads,
          kvHeads,
          tensorParallelSize: Number(tensorParallelSize),
          runtimeReservePercent,
        }),
        error: null,
      };
    } catch (error) {
      return {
        value: null,
        error:
          error instanceof Error ? error.message : "Unsupported tensor-parallel configuration.",
      };
    }
  }, [
    attentionHeads,
    gpuId,
    kvCacheMemoryGiB,
    kvHeads,
    runtimeReservePercent,
    tensorParallelSize,
    weightMemoryGiB,
  ]);

  return (
    <section className="vram-gpu-matches" aria-labelledby="vram-multi-gpu-heading">
      <p className="section-label">MULTI-GPU CAPACITY SCREEN</p>
      <h2 id="vram-multi-gpu-heading">Tensor-parallel memory placement</h2>
      <p>
        Estimate per-GPU weight and KV-cache placement for a single tensor-parallel replica. This
        models vLLM-style KV-head sharding/replication; it does not pool VRAM or validate runtime
        support, throughput or topology performance.
      </p>
      <div className="vram-fields">
        <label className="vram-field">
          <span>GPU model / SKU family</span>
          <select value={gpuId} onChange={(event) => setGpuId(event.target.value)}>
            {GPU_CATALOG.map((gpu) => (
              <option key={gpu.id} value={gpu.id}>
                {gpu.name} — {gpu.memoryGB} GB ({gpu.memoryGiB.toFixed(1)} GiB)
              </option>
            ))}
          </select>
        </label>
        <label className="vram-field">
          <span>Tensor-parallel size (GPUs per replica)</span>
          <select
            value={tensorParallelSize}
            onChange={(event) => setTensorParallelSize(event.target.value)}
          >
            {tensorParallelOptions.map((size) => (
              <option key={size} value={size}>
                {size} GPUs
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="vram-share">
        <button className="button button-primary" type="button" onClick={copyConfigurationLink}>
          Copy multi-GPU configuration link
        </button>
        <p role="status" aria-live="polite">
          {shareStatus}
        </p>
      </div>
      {result.error ? (
        <p className="vram-warning" role="status">
          {result.error}. Check that query attention heads and KV heads are compatible with this
          tensor-parallel degree.
        </p>
      ) : result.value ? (
        <>
          <div className="vram-breakdown">
            <div>
              <span>Memory required per GPU</span>
              <strong>{formatGiB(result.value.requiredMemoryPerGpuGiB)}</strong>
            </div>
            <div>
              <span>Usable capacity per GPU (90%)</span>
              <strong>{formatGiB(result.value.availableMemoryPerGpuGiB)}</strong>
            </div>
            <div>
              <span>Weight shard per GPU</span>
              <strong>{formatGiB(result.value.weightPerGpuGiB)}</strong>
            </div>
            <div>
              <span>KV cache per GPU</span>
              <strong>{formatGiB(result.value.kvCachePerGpuGiB)}</strong>
            </div>
            <div>
              <span>KV-head placement</span>
              <strong>
                {result.value.kvPlacement} ({result.value.kvHeadsPerGpu} heads/GPU)
              </strong>
            </div>
          </div>
          <p className="vram-assumption">
            Tensor-parallel formula version {result.value.formulaVersion}. Interconnect:{" "}
            {result.value.interconnectLabel}.{" "}
            <a
              href={GPU_CATALOG.find((gpu) => gpu.id === gpuId)?.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              Manufacturer specifications
            </a>
          </p>
          <p
            className={result.value.status === "fit" ? "vram-gpu-fit" : "vram-gpu-no-fit"}
            role="status"
          >
            {result.value.status === "fit"
              ? "Per-GPU memory capacity fit under these assumptions"
              : "Insufficient per-GPU memory under these assumptions"}
          </p>
          <ul className="vram-footnote">
            {result.value.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
