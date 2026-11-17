import type { Metadata } from "next";
import Link from "next/link";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "VRAM Calculator Methodology",
  description:
    "Review HEZQEN Labs' VRAM sizing formulas, model preset provenance, GPU capacity assumptions, test vectors and version history.",
  alternates: { canonical: "/labs/methodology" },
  openGraph: {
    title: "VRAM Calculator Methodology | HEZQEN Labs",
    description: "Transparent formulas, sources, limitations and reproducible test vectors.",
    type: "article",
    images: [
      {
        url: "/brand/hezqen-og.png",
        width: 1200,
        height: 630,
        alt: "HEZQEN Labs VRAM calculator methodology",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VRAM Calculator Methodology | HEZQEN Labs",
    description: "Transparent formulas, sources, limitations and reproducible test vectors.",
    images: ["/brand/hezqen-og.png"],
  },
};

export default function VramMethodologyPage() {
  return (
    <section className="prose-page">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "HEZQEN Labs VRAM Calculator Methodology",
          url: "https://hezqen.tinlance.com/labs/methodology",
          isPartOf: { "@id": "https://hezqen.tinlance.com/#website" },
          about: { "@id": "https://hezqen.tinlance.com/#organization" },
        }}
      />
      <div className="container prose-container">
        <p className="eyebrow">
          <span className="eyebrow-line" /> HEZQEN LABS / METHODOLOGY
        </p>
        <h1>
          VRAM estimates, <em>explained.</em>
        </h1>
        <p className="prose-lede">
          The calculator is a deterministic first-pass memory-planning tool. This page documents the
          formula, model sources, hardware assumptions, limitations and regression vectors.
        </p>
        <div className="prose-rule" />
        <h2>Current versions</h2>
        <p>
          Calculator version <strong>1.2.0</strong> · Formula version <strong>1.0.0</strong> ·
          Reviewed 17 November 2026.
        </p>
        <p>
          <Link href="/labs/vram">Open the VRAM calculator</Link> ·{" "}
          <a href="/labs/vram-test-vectors.json">Download public test vectors</a> ·{" "}
          <a href="https://github.com/LloydCoder/hezqen/blob/main/docs/LABS_VRAM_METHODOLOGY.md">
            Read the full methodology
          </a>
        </p>
        <h2>Model-weight memory</h2>
        <p>
          Weight memory is estimated as parameter count multiplied by effective bytes per parameter,
          divided by 2³⁰ to express the result in GiB. FP16 and BF16 use 2 bytes per parameter. INT8
          uses 1.0625 bytes and INT4 uses 0.5625 bytes as conservative planning assumptions that
          include metadata allowance.
        </p>
        <h2>Key-value cache</h2>
        <p>
          For conventional attention layouts, KV cache is estimated as 2 × layers × batch × context
          × KV heads × head dimension × cache bytes, divided by 2³⁰. The factor of two represents
          key and value tensors. GQA uses the actual number of KV heads; MQA uses one.
        </p>
        <h2>Runtime reserve</h2>
        <p>
          A configurable reserve is applied to the combined weight and KV-cache estimate. The
          displayed minimum planning figure rounds the total up to the next whole GiB. Actual
          allocation varies by quantization implementation, runtime, attention backend, memory
          fragmentation and deployment configuration.
        </p>

        <h2>Decimal GB and binary GiB</h2>
        <p>
          GPU manufacturers advertise memory in decimal gigabytes (GB), while the calculator reports
          binary gibibytes (GiB). Each catalogue value is converted using GB × 1,000,000,000 /
          1,073,741,824 before the 90% usable-capacity fraction is applied. For example, a 48 GB GPU
          contains approximately 44.70 GiB, not 48 GiB.
        </p>
        <ul>
          <li>24 GB → 22.35 GiB (RTX 4090)</li>
          <li>32 GB → 29.80 GiB (RTX 5090)</li>
          <li>48 GB → 44.70 GiB (RTX 6000 Ada)</li>
          <li>80 GB → 74.51 GiB (A100/H100)</li>
          <li>141 GB → 131.34 GiB (H200; preliminary)</li>
        </ul>
        <h2>Model preset provenance</h2>
        <ul>
          <li>
            <a href="https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3">
              Mistral 7B Instruct v0.3 model card
            </a>{" "}
            and{" "}
            <a href="https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3/blob/41ee164278abb69f607540425b8682669bec3ca6/config.json">
              model configuration
            </a>
            .
          </li>
          <li>
            <a href="https://huggingface.co/Qwen/Qwen2.5-14B-Instruct">
              Qwen2.5 14B Instruct model card
            </a>{" "}
            and{" "}
            <a href="https://huggingface.co/Qwen/Qwen2.5-14B-Instruct/blob/76ca6ba/config.json">
              model configuration
            </a>
            . The config defaults to 32,768 positions; the model card documents 131,072-token
            context only with YaRN scaling factor 4.
          </li>
          <li>
            <a href="https://github.com/meta-llama/llama-models/blob/main/models/llama3_3/MODEL_CARD.md">
              Meta Llama 3.3 70B model card
            </a>{" "}
            and{" "}
            <a href="https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct/blob/main/config.json">
              model configuration
            </a>
            . The model card labels it 70B; the preset uses a rounded 70.6B architecture-derived
            planning count from the configuration's 80 layers, 64 query heads, 8 KV heads and
            128-dimensional heads. This derived count is an estimate, not a figure published by
            Meta.
          </li>
        </ul>
        <h2>GPU capacity sources</h2>
        <ul>
          <li>
            <a href="https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/">
              NVIDIA GeForce RTX 4090 — 24 GB, PCIe Gen 4, no NVLink
            </a>
          </li>
          <li>
            <a href="https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/">
              NVIDIA GeForce RTX 5090 — 32 GB, PCIe Gen 5; NVLink not listed in the cited
              specification
            </a>
          </li>
          <li>
            <a href="https://www.nvidia.com/en-us/products/workstations/rtx-6000/">
              NVIDIA RTX 6000 Ada Generation — 48 GB, PCIe Gen 4, no NVLink
            </a>
          </li>
          <li>
            <a href="https://www.nvidia.com/en-us/data-center/a100/">
              NVIDIA A100 80GB — PCIe/SXM variants with different NVLink options
            </a>
          </li>
          <li>
            <a href="https://resources.nvidia.com/en-us-gpu-resources/h100-datasheet-24306">
              NVIDIA H100 SXM — 80 GB, NVLink up to 900 GB/s per GPU
            </a>
          </li>
          <li>
            <a href="https://www.nvidia.com/en-us/data-center/h200/">
              NVIDIA H200 — 141 GB, SXM/NVL variants (preliminary specifications; NVLink topology
              varies by SKU)
            </a>
          </li>
        </ul>
        <h2>Multi-GPU tensor-parallel estimate</h2>
        <p>
          The multi-GPU screen estimates idealized weight sharding and vLLM-style KV-head placement
          for a single tensor-parallel replica. It divides weight memory across the selected
          tensor-parallel degree. KV heads are divided when the count is divisible by that degree;
          when the degree is a multiple of the KV-head count, one KV head per GPU is modelled as
          replicated state. It reports required and available memory per GPU rather than summing
          VRAM as if devices formed one memory pool.
        </p>
        <p>
          The estimate requires query attention heads to be divisible by the tensor-parallel degree
          and supports only simple KV-head divisibility cases. It does not model pipeline or data
          parallelism, uneven layers, replicated embeddings/output layers, communication buffers,
          activation memory, CUDA graph pools or allocator fragmentation. The result is not proof
          that a framework accepts the configuration.
        </p>
        <p>
          The tensor-parallel placement formula is version 1.0.0. Its deterministic inputs and
          expected outputs are published in the
          <a href="/labs/tensor-parallel-test-vectors.json">tensor-parallel regression vectors</a>.
          These vectors validate arithmetic only; they are not measured GPU benchmark results.
        </p>
        <h2>Interconnect and hardware topology</h2>
        <p>
          The catalogue records manufacturer-listed PCIe, NVLink and SKU-dependent information. A
          PCIe-only card may be constrained by GPU-to-GPU communication; NVLink availability depends
          on the exact SKU, bridge, baseboard and NVSwitch configuration. A memory fit does not
          establish interconnect bandwidth, latency or throughput. Verify the actual server topology
          and benchmark the target model/runtime before procurement.
        </p>
        <h2>GPU memory units</h2>
        <p>
          Manufacturer capacities are stated in decimal GB. HEZQEN converts them to binary GiB using
          1 GB = 1,000,000,000 bytes and 1 GiB = 1,073,741,824 bytes before applying the default 90%
          usable-capacity assumption. The 10% planning margin is not a guarantee of successful model
          loading.
        </p>
        <h2>Multi-GPU tensor-parallel planning</h2>
        <p>
          The separate tensor-parallel screen models even weight sharding across the selected
          tensor-parallel degree. For conventional GQA/MQA placement, KV heads are divided across
          ranks when divisible; when the tensor-parallel degree is a multiple of the KV-head count,
          one KV head is represented per GPU and KV state is replicated. Unsupported divisibility
          layouts are rejected by the estimator.
        </p>
        <p>
          This is an idealized memory-placement approximation, not a complete vLLM runtime model. It
          does not include uneven layer allocation, replicated embeddings or output layers,
          activation/workspace buffers, allocator fragmentation, communication buffers, pipeline
          parallelism, MLA, hybrid or sliding-window cache layouts. A memory fit does not establish
          runtime support, interconnect bandwidth, latency or throughput. Confirm the exact GPU SKU,
          server baseboard, PCIe root complex, NVLink bridge or NVSwitch topology and serving
          framework before procurement.
        </p>
        <h2>Limitations</h2>
        <p>
          The presets cover conventional GQA architectures. MLA, hybrid layer layouts, sliding
          window cache behaviour, speculative decoding, prefix-cache sharing, training memory and
          multimodal components are not modelled. The multi-GPU estimate is an idealized memory
          placement screen, not a runtime allocation or performance benchmark. Validate actual
          allocations and supported topology in the target serving framework.
        </p>
        <h2>Reproducibility and change history</h2>
        <p>
          Public deterministic vectors are published at{" "}
          <a href="/labs/vram-test-vectors.json">/labs/vram-test-vectors.json</a>. The repository
          test suite reads the same file and checks the implementation's outputs. These tests
          validate the arithmetic, not measured hardware performance.
        </p>
        <p>
          Formula changes require a formula-version increment, updated public vectors, regression
          tests, a changelog entry and independent technical review. UI, source metadata and GPU
          catalogue changes that do not alter the equation increment the calculator version only.
        </p>
        <p className="prose-signoff">
          <Link href="/labs">Return to HEZQEN Labs</Link>
        </p>
      </div>
    </section>
  );
}
