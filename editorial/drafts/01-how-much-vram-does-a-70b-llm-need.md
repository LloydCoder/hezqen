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

Meta's model card names Llama 3.3 70B as a 70-billion-parameter model. Its published configuration specifies 80 layers, 64 query heads, 8 KV heads, a head dimension of 128 and a 131,072-token maximum context. Reconstructing the parameter count from the configuration's untied token embeddings, attention projections, MLP dimensions and normalization weights gives an approximate 70.55B parameters; HEZQEN's preset rounds this configuration-derived planning count to 70.6B. The model-card name and the configuration-derived count are different levels of precision.

For a nominal 70-billion-parameter model, the uncompressed BF16 weight payload is approximately 130.4 GiB. At 70.6B, the same calculation is approximately 131.5 GiB. The uncompressed weight payload is therefore already larger than the H200's approximately 131.3 GiB binary capacity, before runtime memory or KV cache. The uncompressed weight payload for 70.6B parameters is approximately:

| Representation | Nominal bytes/parameter | Weight memory |
|---|---:|---:|
| FP16/BF16 | 2 | 130.4 GiB |
| FP8/INT8 payload floor | 1 | 65.2 GiB |
| 4-bit payload floor | 0.5 | 32.9 GiB |
| 4-bit planning assumption | 0.5625 | 37.0 GiB |

These are arithmetic payload estimates, not exact allocations. Quantized implementations add scales, zero points, alignment and metadata; some layers remain at higher precision. The HEZQEN calculator uses 0.5625 bytes/parameter for its conservative INT4 planning assumption and 1.0625 for INT8. Actual formats must be checked against the selected quantizer and model artifact.

## The KV cache changes the answer

Meta's Llama 3.3 70B configuration lists 80 layers, 64 query heads, 8 KV heads and a head dimension of 128. For a conventional key/value cache:

`KV bytes = 2 × layers × batch × context × KV heads × head dimension × bytes per element`

At BF16/FP16 cache precision, one sequence at 32,768 tokens requires about 10 GiB of KV cache under this configuration. At 131,072 tokens, the same simplified calculation is about 40 GiB. This cache is separate from model weights and grows with concurrent sequences. Batch size multiplies the per-sequence cache requirement. Prefix sharing, paged allocation and runtime-specific cache formats can change actual allocations.

## Why a single 141 GB GPU is not automatically enough

NVIDIA publishes 141 GB of memory for the H200 SXM and H200 NVL. That is approximately 131.3 GiB after decimal-GB to binary-GiB conversion. The 70.6B configuration-derived BF16 weight estimate is about 131.5 GiB, so it exceeds the H200's binary capacity before KV cache, CUDA context, activations, workspaces or allocator headroom. A 4-bit planning estimate is about 37.0 GiB for weights; at 32k context the combined estimate is about 54.0 GiB after a 15% reserve. That is a capacity calculation, not proof that a particular quantized artifact or runtime is supported.

Multiple GPUs do not form one transparent memory pool. Tensor parallelism shards supported layers and cache state across ranks, subject to model/framework constraints and the actual interconnect. Under the calculator's idealized placement model, four H100 80GB GPUs at tensor-parallel degree four can place the 70.6B BF16 weights, 32k-context KV cache and a 15% reserve at roughly 40.7 GiB per GPU. Two H100s at degree two require roughly 81.4 GiB per GPU under the same assumptions and exceed the 90%-usable planning capacity. These are arithmetic capacity checks, not benchmark results or proof of runtime compatibility.

## Decision checklist

1. Identify the exact model revision and configuration.
2. Calculate weights using the actual quantization artifact, not a label such as “4-bit”.
3. Calculate KV cache from the actual KV heads, head dimension, layers, context and concurrent sequences.
4. Reserve memory for runtime, kernels, activations and fragmentation.
5. Check per-GPU placement, supported tensor-parallel degree and topology.
6. Benchmark the target serving stack before procurement.

**Evidence and sources**

- [Meta Llama 3.3 model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_3/MODEL_CARD.md)
- [Meta Llama 3.3 70B Instruct configuration](https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct/blob/main/config.json)
- [NVIDIA H100 datasheet](https://resources.nvidia.com/en-us-gpu-resources/h100-datasheet-24306)
- [NVIDIA H200 specifications](https://www.nvidia.com/en-us/data-center/h200/)
- [vLLM parallelism and scaling](https://docs.vllm.ai/en/stable/serving/parallelism_scaling/)
- [HEZQEN Labs VRAM methodology](https://hezqen.tinlance.com/labs/methodology)

**Evidence status:** Weight and KV figures above are calculations from public architecture parameters, not measured GPU experiments. A reproducible runtime test with exact model revision, quantization, framework, context, batch and GPU telemetry is still required.

**Editorial gate:** Human author, independent reviewer, fact-check and editor are unassigned. Do not publish until the experiment decision and byline consent are resolved.
