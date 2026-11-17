---
title: "How Much VRAM Does a 70B LLM Actually Need?"
division: "AI & Technology"
format: "Technical explainer"
status: "Research draft — not for publication"
author: "Pending human assignment"
independent_reviewer: "Pending assignment"
editor: "Pending assignment"
last_researched: "2026-11-17"
---

> **Editorial hold:** This is a working research draft. It has not been independently reviewed, assigned to a consenting human author, or approved by an editor. Do not publish or attribute it to a person until those steps are complete.

# How Much VRAM Does a 70B LLM Actually Need?

The short answer is: more than the model's parameter count multiplied by two bytes—and sometimes much more. A 70-billion-parameter model in FP16 or BF16 requires roughly 130.4 GiB just for nominal weights. Add the key-value (KV) cache, runtime allocations and safety headroom, and a realistic deployment can require substantially more than the headline weight size.

Quantization changes the equation, but it does not make the other memory requirements disappear. Context length, concurrent requests, attention architecture, serving framework and GPU topology all matter.

This analysis uses Meta's Llama 3.3 70B Instruct architecture as a worked example. It is a planning calculation, not a GPU benchmark.

## Start with the model's actual architecture

A parameter count is not enough to estimate serving memory. The architecture determines how much KV cache each token requires.

Meta's model catalogue lists Llama 3.3 at 70B parameters and a 128K context length. The official model definitions identify 80 transformer layers, model dimension 8,192, 64 attention heads and 8 key/value heads. The head dimension is therefore 8,192 / 64 = 128. The model uses grouped-query attention (GQA), so the KV cache is based on eight KV heads—not all 64 query heads.

Those values are the inputs for the worked example:

| Parameter | Value |
|---|---:|
| Nominal parameter count | 70 billion |
| Transformer layers | 80 |
| Query attention heads | 64 |
| Key/value heads | 8 |
| Head dimension | 128 |
| Maximum context in model catalogue | 128K tokens (131,072-token binary context) |

Always inspect the exact model revision and serving configuration. A model label such as "70B" does not guarantee that every derivative has identical architecture fields.

## 1. Model weights: the first memory floor

A simple weight-memory estimate is:

[
M_{weights} = \frac{P \times B_w}{2^{30}}
]

Where:

- (P) is the number of parameters.
- (B_w) is the effective bytes stored per parameter.
- (2^{30}) converts bytes to binary gibibytes (GiB).

For a nominal 70-billion-parameter model:

| Weight representation | Planning assumption | Approximate weight memory |
|---|---:|---:|
| FP16 | 2 bytes/parameter | 130.39 GiB |
| BF16 | 2 bytes/parameter | 130.39 GiB |
| INT8 | 1.0625 effective bytes/parameter | 69.27 GiB |
| INT4 | 0.5625 effective bytes/parameter | 36.67 GiB |

The INT8 and INT4 values above are the explicit planning assumptions used by the current HEZQEN calculator. They include an allowance for quantization scales and metadata; they are not universal guarantees for every quantizer, group size, mixed-precision layer or checkpoint format. Real implementations can use more or less memory.

The first procurement mistake is to treat "70B in 4-bit" as a precise 35 GB requirement. It is only a rough payload estimate. The exact quantization format, metadata, embeddings, output head, alignment and runtime representation affect the loaded footprint.

## 2. KV cache: context and concurrency change the answer

During autoregressive generation, a serving engine retains keys and values from prior tokens so it does not need to recompute the entire attention history for every new token.

For a conventional transformer attention layout, the approximate KV-cache size is:

[
M_{KV} =
\frac{2 \times L \times N \times T \times H_{KV} \times D_H \times B_{KV}}{2^{30}}
]

Where:

- (2) accounts for keys and values.
- (L) is the number of layers.
- (N) is the number of concurrently cached sequences.
- (T) is the context length per sequence.
- (H_{KV}) is the number of key/value heads.
- (D_H) is the head dimension.
- (B_{KV}) is bytes per KV-cache element.

For Llama 3.3 70B using 80 layers, 8 KV heads, a 128-dimensional head and a 16-bit KV cache, one sequence requires approximately:

| Context per sequence | KV cache per sequence |
|---:|---:|
| 8,192 tokens | 2.5 GiB |
| 32,768 tokens | 10 GiB |
| 131,072 tokens | 40 GiB |

The memory scales linearly with concurrent sequences under this simple model. Four sequences at 32K context would require approximately 40 GiB of KV cache before runtime overhead.

This is why a model that loads successfully for one short prompt may fail when the service accepts longer prompts or more simultaneous users.

## 3. Put the components together

HEZQEN's current first-pass calculator applies a configurable runtime reserve to the sum of weights and KV cache. The following examples use a 15% reserve. That reserve is a planning assumption, not a measurement of a particular runtime.

| Configuration | Weights | KV cache | With 15% reserve |
|---|---:|---:|---:|
| BF16, 8K, batch 1 | 130.39 GiB | 2.50 GiB | 152.82 GiB |
| BF16, 32K, batch 1 | 130.39 GiB | 10.00 GiB | 161.44 GiB |
| BF16, 128K, batch 1 | 130.39 GiB | 40.00 GiB | 195.94 GiB |
| INT4, 8K, batch 1 | 36.67 GiB | 2.50 GiB | 45.05 GiB |
| INT4, 32K, batch 1 | 36.67 GiB | 10.00 GiB | 53.67 GiB |
| INT4, 128K, batch 1 | 36.67 GiB | 40.00 GiB | 88.17 GiB |

The result is not a promise that a GPU with that much advertised memory will run the model. Hardware vendors generally advertise memory in decimal GB, while this calculator reports binary GiB. For example, 48 GB is approximately 44.70 GiB, not 48 GiB. A capacity screen must compare like units and leave room for allocations outside the simple formula.

A 48 GB-class card is therefore not a safe assumption for the INT4 70B / 8K example: the planning total is already about 45.05 GiB before considering implementation-specific allocations. An 80 GB-class card has a larger memory budget, but the exact quantized checkpoint and serving runtime still need to be tested.

## 4. What changes with multiple GPUs?

Tensor parallelism can shard model weights across GPUs, reducing the per-GPU weight allocation. It does not mean that a group of cards behaves like one large, automatically pooled memory device.

The KV cache must also be placed across devices. With GQA, KV heads may be sharded when the head count and parallel degree permit it; when the number of KV heads is smaller than the tensor-parallel degree, some runtimes replicate KV heads. Pipeline parallelism distributes layers differently. The resulting per-device allocation is runtime- and architecture-dependent.

Interconnect topology matters too. Tensor-parallel communication can make a PCIe-only workstation behave very differently from an NVLink/NVSwitch server. A memory sum cannot prove that a topology is fast enough or supported by a specific software stack.

For a real deployment, validate the exact GPU SKU, server board, interconnect, framework version, parallelism configuration, model revision and measured KV-cache capacity. The vLLM documentation describes tensor and pipeline parallelism and reports the KV-cache capacity discovered by the running engine.

## 5. Why the estimate can still be wrong

This worked example covers conventional GQA/MQA-style KV-cache accounting. It is not architecture-complete for:

- Multi-head latent attention (MLA) and compressed latent KV representations.
- Hybrid models with different attention behaviour across layer types.
- Sliding-window attention where the effective cache length is shorter than the full context.
- Uneven layer dimensions or per-layer KV-head overrides.
- Prefix-cache sharing, speculative decoding, paged-cache fragmentation and runtime memory pools.
- Training, fine-tuning, gradients, optimizer states or multimodal encoder components.

PagedAttention and paged KV allocation can improve memory management and reduce fragmentation; they do not make model weights disappear or guarantee a particular context/batch capacity. Serving engines also reserve memory for execution workspaces, graph capture and other buffers.

## A practical sizing sequence

1. Pin the exact model repository and revision.
2. Read the model configuration: layers, hidden size, query heads, KV heads, head dimension, context limits and attention variants.
3. Identify the actual quantization format and its metadata/group-size overhead.
4. Estimate weights and KV cache for the target context and concurrency.
5. Add a documented runtime reserve rather than assuming every advertised byte is usable.
6. Check per-GPU memory placement and interconnect requirements for multi-GPU serving.
7. Load the exact model in the intended runtime and measure startup allocation, KV-cache capacity, throughput and latency under the target workload.

**Bottom line:** a 70B model is not a single VRAM number. FP16/BF16 weights alone are around 130 GiB in this example; quantization can lower that floor, while context and concurrency can add tens of GiB. Use the formula to narrow hardware options, then validate the real model and runtime.

## Sources and research record

Reviewed 2026-11-17. Primary technical references:

1. [Meta Llama model catalogue and official model definitions](https://github.com/meta-llama/llama-models) — model family, parameter class, architecture fields and GQA.
2. [Meta Llama 3.3 70B Instruct model card](https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct) — model identity, intended use, license and context description.
3. [Hugging Face Transformers configuration reference](https://huggingface.co/docs/transformers/main/main_classes/configuration) — common architecture configuration fields.
4. [vLLM optimization and parallelism strategies](https://docs.vllm.ai/en/latest/configuration/optimization/) — tensor, pipeline and other parallelism strategies.
5. [vLLM engine arguments](https://docs.vllm.ai/en/stable/configuration/engine_args/) — GPU memory utilization and cache allocation behaviour.
6. [NVIDIA H200 specifications](https://www.nvidia.com/en-us/data-center/h200/) — manufacturer-listed memory and interconnect information; preliminary specification caveat applies.
7. [NVIDIA RTX 4090 specifications](https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/) and [RTX 5090 specifications](https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/) — advertised memory capacities.
8. [HEZQEN VRAM methodology](../../LABS_VRAM_METHODOLOGY.md) — formula assumptions and limitations.

## Required pre-publication work

- Recompute every displayed value from the pinned model configuration and a versioned script.
- Independently verify decimal GB to binary GiB conversions and all table values.
- Add at least one multi-GPU runtime test with the exact framework/model configuration before making measured fit claims.
- Obtain a named human author, independent technical reviewer and editor.
- Review licensing, model access and all source revisions before publication.
