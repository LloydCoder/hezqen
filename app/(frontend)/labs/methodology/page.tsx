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
          Calculator version <strong>1.1.0</strong> · Formula version <strong>1.0.0</strong> ·
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
        </ul>
        <h2>GPU capacity sources</h2>
        <ul>
          <li>
            <a href="https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/">
              NVIDIA GeForce RTX 4090 — 24 GB
            </a>
          </li>
          <li>
            <a href="https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/">
              NVIDIA GeForce RTX 5090 — 32 GB
            </a>
          </li>
          <li>
            <a href="https://www.nvidia.com/en-us/products/workstations/rtx-6000/">
              NVIDIA RTX 6000 Ada Generation — 48 GB
            </a>
          </li>
          <li>
            <a href="https://www.nvidia.com/en-us/data-center/a100/">
              NVIDIA A100 80GB — 80 GB
            </a>
          </li>
          <li>
            <a href="https://resources.nvidia.com/en-us-gpu-resources/h100-datasheet-24306">
              NVIDIA H100 SXM — 80 GB
            </a>
          </li>
          <li>
            <a href="https://www.nvidia.com/en-us/data-center/h200/">
              NVIDIA H200 — 141 GB (preliminary specifications)
            </a>
          </li>
        </ul>
        <h2>Limitations</h2>
        <p>
          The presets cover conventional GQA architectures. MLA, hybrid layer layouts, sliding
          window cache behaviour, speculative decoding, prefix-cache sharing, training memory and
          multimodal components are not modelled. The GPU screen is single-card capacity matching;
          it does not sum multiple GPUs or validate interconnect, tensor parallelism, throughput or
          framework compatibility.
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
