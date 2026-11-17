---
title: "How Much VRAM Does a 70B LLM Actually Need?"
division: "AI & Technology"
status: "research-draft"
author: "UNASSIGNED — requires consenting human author"
reviewer: "UNASSIGNED — independent ML infrastructure reviewer required"
editor: "UNASSIGNED — authorized HEZQEN editor required"
publication: "NOT FOR PUBLICATION"
research_updated: "2026-11-17"
---

# How Much VRAM Does a 70B LLM Actually Need?

**Working thesis:** “70B” tells us the approximate parameter count, not whether a model will fit on a GPU. Weight precision, KV-cache layout, context length, batch size, runtime allocations and tensor-parallel placement determine the practical memory requirement.

## The weight calculation

For a nominal 70-billion-parameter model, the uncompressed weight payload is approximately:

| Representation | Nominal bytes/parameter | Weight memory |
|---|---:|---:|
| FP16/BF16 | 2 | 130.4 GiB |
| FP8/INT8 payload floor | 1 | 65.2 GiB |
| 4-bit payload floor | 0.5 | 32.6 GiB |

These are arithmetic payload estimates, not exact allocations. Quantized implementations add scales, zero points, alignment and metadata; some layers remain at higher precision. The HEZQEN calculator uses 0.5625 bytes/parameter for its conservative INT4 planning assumption and 1.0625 for INT8. Actual formats must be checked against the selected quantizer and model artifact.

## The KV cache changes the answer

Meta's Llama 3.3 70B configuration lists 80 layers, 64 query heads, 8 KV heads and a head dimension of 128. For a conventional key/value cache:

`KV bytes = 2 × layers × batch × context × KV heads × head dimension × bytes per element`

At BF16/FP16 cache precision, one sequence at 32,768 tokens requires about 10 GiB of KV cache under this configuration. At 131,072 tokens, the same simplified calculation is about 40 GiB. Batch size multiplies the per-sequence cache requirement. Prefix sharing, paged allocation and runtime-specific cache formats can change actual allocations.

## Why a single 141 GB GPU is not automatically enough

A nominal 70B BF16 weight payload alone is about 130.4 GiB. NVIDIA's H200 publishes 141 GB of memory, approximately 131.3 GiB after decimal-GB to binary-GiB conversion. That leaves almost no room for KV cache, CUDA context, activations, workspaces or allocator headroom. The model may therefore fail to load or be unusable at meaningful context lengths even though the advertised GB figure appears larger than 130.

Multiple GPUs do not form one transparent memory pool. Tensor parallelism shards supported layers and cache state across ranks, subject to model/framework constraints and the actual interconnect. A 4×H100 estimate can look comfortable on memory arithmetic, but that is not proof of a compatible runtime or adequate throughput.

## Decision checklist

1. Identify the exact model revision and configuration.
2. Calculate weights using the actual quantization artifact, not a label such as “4-bit”.
3. Calculate KV cache from the actual KV heads, head dimension, layers, context and concurrent sequences.
4. Reserve memory for runtime, kernels, activations and fragmentation.
5. Check per-GPU placement, supported tensor-parallel degree and topology.
6. Benchmark the target serving stack before procurement.

**Evidence and sources**

- [Meta Llama 3.3 70B Instruct model repository and configuration](https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct)
- [NVIDIA H100 datasheet](https://resources.nvidia.com/en-us-gpu-resources/h100-datasheet-24306)
- [NVIDIA H200 specifications](https://www.nvidia.com/en-us/data-center/h200/)
- [vLLM parallelism and scaling](https://docs.vllm.ai/en/stable/serving/parallelism_scaling/)
- [HEZQEN Labs VRAM methodology](https://hezqen.tinlance.com/labs/methodology)

**Evidence status:** Weight and KV figures above are calculations from public architecture parameters, not measured GPU experiments. A reproducible runtime test with exact model revision, quantization, framework, context, batch and GPU telemetry is still required.

**Editorial gate:** Human author, independent reviewer, fact-check and editor are unassigned. Do not publish until the experiment decision and byline consent are resolved.
