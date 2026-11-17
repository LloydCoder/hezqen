---
title: "GPU Memory Explained: Weights, KV Cache, Context and Batch Size"
division: "AI & Technology"
status: "research-draft"
author: "UNASSIGNED — requires consenting human author"
reviewer: "UNASSIGNED — independent ML systems reviewer required"
editor: "UNASSIGNED — authorized HEZQEN editor required"
publication: "NOT FOR PUBLICATION"
research_updated: "2026-11-17"
---

# GPU Memory Explained: Weights, KV Cache, Context and Batch Size

GPU memory planning for inference is often reduced to a single multiplication: parameter count times bytes per parameter. That is a useful starting point, but it omits the memory that grows with requests and the memory reserved by the serving runtime.

## Four different memory budgets

**Weights** are the model parameters loaded for inference. Their size depends on parameter count and representation. BF16/FP16 typically use two bytes per parameter; quantized formats reduce payload size but add implementation-specific metadata and may leave some layers unquantized.

**KV cache** stores keys and values from prior tokens so autoregressive decoding does not need to recompute the entire attention history for every generated token. For conventional attention, the cache grows with layer count, KV-head count, head dimension, context length and active sequences:

`2 × layers × batch × context × KV heads × head dimension × bytes per element`

The leading two represents keys and values. Grouped-query attention reduces cache relative to a model with the same query-head count but one KV head per query head.

**Runtime allocations** include CUDA context, kernels, temporary buffers, activation/workspace memory, graph capture pools and allocator overhead. Their size depends on framework, kernels, serving settings and workload.

**Operational headroom** is capacity deliberately left unused to absorb variability, fragmentation and concurrent work. It is not free capacity that can safely be allocated elsewhere.

## Context and concurrency are multipliers

Doubling context approximately doubles conventional KV-cache demand for a fixed architecture and batch. Doubling concurrent sequences also approximately doubles the cache requirement. Weight memory does not normally scale with batch in the same way, which is why a model that loads for one request can fail when concurrency increases.

The relationship is architecture-dependent. MLA, sliding-window attention, hybrid layers, cross-layer cache designs, prefix sharing and speculative decoding require more specific models than the conventional formula. The serving framework's actual allocation is the authority for a production deployment.

## Quantization is not a single number

“INT4” does not fully specify storage. Group size, scales, zero points, packing, mixed precision and outlier handling affect the bytes stored. A 4-bit payload floor is 0.5 bytes per parameter, but a planning estimate should include metadata and any layers that remain at higher precision. Quantization can also affect quality, speed and kernel availability.

## A practical planning sequence

- Obtain the exact model config and artifact revision.
- Calculate weights using the selected quantization format.
- Calculate KV cache for target context and concurrency.
- Add measured or documented runtime overhead and explicit headroom.
- Validate the framework's cache format and scheduling behaviour.
- Load-test with production-like prompts, output lengths and concurrency.

A memory calculator can reject obviously impossible configurations and expose assumptions. It cannot establish tokens per second, time to first token, p95 latency, or quality. Those require an experiment.

**Evidence and sources**

- [Meta Llama 3.3 70B configuration](https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct)
- [vLLM model configuration and KV-head placement](https://docs.vllm.ai/en/latest/api/vllm/config/model/)
- [vLLM parallelism and scaling](https://docs.vllm.ai/en/stable/serving/parallelism_scaling/)
- [vLLM KV-cache offloading constraints](https://docs.vllm.ai/en/latest/features/kv_offloading_usage/)
- [HEZQEN Labs methodology and test vectors](https://hezqen.tinlance.com/labs/methodology)

**Evidence status:** The formula is a first-order model. Actual runtime memory measurements and architecture-specific treatment remain necessary.

**Editorial gate:** Human author, specialist reviewer and editor are unassigned. Not publication-ready.
