---
title: "GPU Memory Explained: Weights, KV Cache, Context and Batch Size"
division: "AI & Technology"
format: "Technical explainer"
status: "Research draft — not for publication"
author: "Pending human assignment"
independent_reviewer: "Pending assignment"
editor: "Pending assignment"
last_researched: "2026-11-17"
---

> **Editorial hold:** Working research draft only. No named author, independent reviewer or editor has been assigned. Do not publish until technical reproduction and human editorial approval are complete.

# GPU Memory Explained: Weights, KV Cache, Context and Batch Size

When an LLM runs out of GPU memory, the model's parameter count is only one part of the explanation. Inference memory is a moving budget: weights occupy memory for the lifetime of the model, KV cache grows with active sequences, and the runtime needs additional space for kernels, workspaces, graph capture, temporary tensors and allocator behaviour.

Understanding those categories is more useful than memorizing a rule such as "a 7B model needs 14 GB." That rule approximates one part of one configuration. It does not describe the memory needed to serve real traffic.

## The four main memory categories

### 1. Model weights

Weights are the learned parameters loaded from the model checkpoint. The simplest estimate is parameter count multiplied by effective bytes per parameter.

For a model with (P) parameters:

[
M_{weights} = P \times B_w
]

A nominal 7-billion-parameter model stored at two bytes per parameter has about 14 billion bytes of weight payload, or approximately 13.04 GiB. A nominal 70B model at the same precision has about 130.39 GiB.

The actual loaded footprint depends on the checkpoint and runtime. Quantized models store packed values plus scales, zero points and other metadata. Some layers may remain at higher precision. Embeddings, output projections, padding and alignment can also affect the total.

### 2. KV cache

Autoregressive generation reuses previously computed keys and values. The serving engine stores them in a KV cache so that each new token does not require recomputing the entire prompt history.

For a conventional attention architecture:

[
M_{KV} =
2 \times L \times N \times T \times H_{KV} \times D_H \times B_{KV}
]

Where (L) is the number of layers, (N) is the number of cached sequences, (T) is tokens per sequence, (H_{KV}) is KV heads, (D_H) is head dimension and (B_{KV}) is bytes per cache element.

The leading factor of two accounts for keys and values. The equation explains why a 70B model's KV cache cannot be estimated from parameter count alone: it needs the model's actual attention configuration.

### 3. Runtime and temporary allocations

A serving runtime needs memory beyond weights and KV cache. Depending on the engine and configuration, that can include:

- CUDA/HIP context and library allocations.
- Kernel workspaces and temporary tensors.
- Activation buffers and intermediate results.
- Graph-capture memory and communication buffers.
- Quantization metadata and dequantization workspaces.
- Memory allocator fragmentation and other GPU processes.

A fixed percentage reserve is useful for early planning, but it is not a universal runtime constant. The reserve should be calibrated against the selected framework, version, model, GPU and workload.

### 4. Operating headroom

A GPU should not be planned as though every advertised byte is available to the model. The driver, runtime, monitoring tools, display stack and other processes may consume memory. A deployment that barely fits at startup can fail when traffic or context grows.

Also keep units consistent. GPU vendors usually advertise decimal GB; model calculations often report binary GiB. One GiB is (2^{30}) bytes, while one GB is (10^9) bytes. Therefore, 48 GB is about 44.70 GiB.

## Why context length matters

Context length is the number of tokens the model can attend to in a request. For a conventional KV cache, memory grows approximately linearly with the number of cached tokens.

If one sequence requires 2.5 GiB of KV cache at 8K tokens under a given model/precision configuration, the same architecture would require approximately 10 GiB at 32K and 40 GiB at 128K, before other runtime behaviour is considered.

This is not a universal token-to-GiB conversion. It depends on layer count, KV-head count, head dimension, cache precision and architecture. Sliding-window attention, MLA, hybrid attention and runtime cache policies can change the result.

## Why batch size matters

Batch size is the number of sequences being served concurrently in a batch. In the simple formula, every independently cached sequence adds its own KV state. Four concurrent 32K requests can require about four times the KV cache of one 32K request.

Serving systems often use continuous batching, paged cache blocks, prefix caching and scheduling to improve utilization. These mechanisms affect how memory is allocated and reused. They do not mean that an application can ignore maximum sequence length or concurrency.

A production capacity plan should use the intended request-length distribution and concurrency target, not only the model's maximum context length. A service where most prompts are 2K tokens and a small number reach 64K has a different memory profile from one where every request uses 64K.

## GQA and MQA reduce cache size

Grouped-query attention shares key/value heads across groups of query heads. Multi-query attention uses one key/value head for multiple query heads.

For KV memory estimation, use the number of KV heads, not the query-head count. Confusing the two can substantially overestimate or underestimate cache requirements.

The model configuration is the source of truth. Common configuration fields include hidden size, number of attention heads, number of hidden layers and number of key/value heads. Derived dimensions must be checked against the architecture implementation.

## Quantization changes weights, not every memory category

Weight quantization reduces the bytes used to represent model parameters. It does not automatically quantize the KV cache, remove runtime workspaces or eliminate concurrency costs.

A deployment may use INT4 weights with an FP16 KV cache. It may also use FP8 or INT8 KV cache where the model, runtime and hardware support it. The effective footprint depends on quantization group size, metadata, mixed-precision layers and implementation.

For that reason, "4-bit model" is incomplete information. Record the exact quantization format, checkpoint, runtime and KV-cache precision.

## PagedAttention and cache management

PagedAttention-style systems manage KV cache in fixed-size blocks rather than requiring each request to occupy one contiguous memory region. This can reduce fragmentation and support more flexible batching and sharing. Prefix caching can reuse shared prompt state when the runtime and request conditions allow it.

These techniques improve memory management; they do not remove the underlying need to store attention state. Capacity still depends on the actual number of cache tokens, cache format, block allocation and runtime policy.

## Multi-GPU memory is not pooled memory

Tensor parallelism shards model parameters across GPUs within layers. Pipeline parallelism distributes layers across devices. Data parallelism creates separate model replicas to increase aggregate serving capacity.

These strategies solve different problems. The total VRAM printed on a list of GPUs is not automatically available as one allocation. A valid estimate must calculate per-device weight and KV placement, then consider replicated state, communication buffers, model divisibility and interconnect topology.

For example, vLLM's model configuration logic can partition KV heads across tensor-parallel ranks and replicate them when the KV-head count is smaller than the parallel degree. The exact behaviour is framework-specific. Do not assume every serving stack uses the same placement strategy.

## A repeatable memory-sizing checklist

1. Pin the model repository, revision and configuration.
2. Record parameter count, layer count, query heads, KV heads, head dimension and attention variants.
3. Record the weight quantization format and cache precision separately.
4. Estimate weights, KV cache and reserve as separate line items.
5. Model context length and concurrent sequences using a realistic workload distribution.
6. Record GPU memory in the same units as the calculation.
7. For multi-GPU systems, calculate per-GPU placement and verify the runtime's tensor/pipeline parallel constraints.
8. Run the exact model in the target runtime and inspect measured cache capacity, startup memory, throughput and latency.

## Conclusion

Weights establish the first memory floor. KV cache grows with context and concurrency. Runtime buffers and headroom determine whether the theoretical estimate survives contact with a real serving engine. Quantization helps, but it is only one variable.

The most reliable capacity plan starts with the model's real configuration, models the actual request workload, and finishes with measurements from the intended runtime and hardware.

## Sources and research record

Reviewed 2026-11-17:

1. [Hugging Face Transformers configuration reference](https://huggingface.co/docs/transformers/main/main_classes/configuration).
2. [Meta Llama model definitions](https://github.com/meta-llama/llama-models) — architecture fields and GQA configuration.
3. [vLLM optimization and parallelism strategies](https://docs.vllm.ai/en/latest/configuration/optimization/).
4. [vLLM engine arguments](https://docs.vllm.ai/en/stable/configuration/engine_args/) — GPU memory utilization and cache behaviour.
5. [vLLM conserving memory](https://docs.vllm.ai/en/latest/configuration/conserving_memory/) — tensor-parallel memory use.
6. [vLLM model configuration implementation](https://github.com/vllm-project/vllm/blob/main/vllm/config/model.py) — KV-head placement logic.
7. [HEZQEN VRAM methodology](../../LABS_VRAM_METHODOLOGY.md) — current formula, assumptions and known architecture exclusions.

## Required pre-publication work

- Recalculate all examples with a pinned model configuration and a versioned script.
- Verify the exact runtime documentation versions used in the article.
- Add diagrams or a reproducible worksheet only after technical review.
- Assign a named human author, independent reviewer and editor.
