# HEZQEN Labs — VRAM Estimator Methodology

## Purpose

The LLM VRAM Sizing Calculator provides a transparent first-pass estimate of memory required for model weights, the attention key-value (KV) cache, and a configurable runtime reserve. It is intended for infrastructure planning and scenario comparison, not as a hardware compatibility guarantee.

## Inputs

- Model parameter count, in billions (B)
- Model weight storage format: FP16, BF16, INT8 or INT4
- Transformer layer count
- Number of KV heads
- Head dimension
- Context length, in tokens
- Concurrent batch size
- KV-cache storage format: FP16, BF16, FP8 or INT8
- Runtime reserve percentage

## Calculation

All reported memory values use binary gibibytes (GiB), where 1 GiB = 1,073,741,824 bytes.

### Model weights

`weight_memory = parameters_B × 1,000,000,000 × effective_bytes_per_parameter`

Effective storage assumptions:

| Format | Effective bytes per parameter | Basis |
|---|---:|---|
| FP16 | 2.0 | 16-bit values |
| BF16 | 2.0 | 16-bit values |
| INT8 | 1.0625 | 8-bit payload plus conservative metadata allowance |
| INT4 | 0.5625 | 4-bit payload plus conservative metadata allowance |

These INT8/INT4 values are planning assumptions, not universal quantizer formats. Real storage varies by quantization scheme, group size, scales, zero-points, packing and runtime.

### KV cache

`kv_cache_bytes = 2 × layers × batch_size × context_length × kv_heads × head_dimension × cache_bytes_per_element`

The leading factor of 2 represents the key and value tensors. FP16/BF16 use 2 bytes per element; FP8/INT8 use 1 byte per element.

### Runtime reserve and total

`runtime_reserve = (weight_memory + kv_cache_memory) × reserve_percent / 100`

`estimated_total = weight_memory + kv_cache_memory + runtime_reserve`

The recommended integer GiB value is the estimated total rounded up to the next whole GiB. It is not a claim that a GPU with exactly that advertised capacity will fit the workload.

## Limitations

This estimator does not fully model:

- CUDA or other device runtime allocations
- Framework and allocator fragmentation
- CUDA graphs, temporary workspaces or kernel-specific buffers
- Tensor/pipeline parallelism and sharding overhead
- Architecture-specific attention implementations
- Quantizer-specific packing and metadata
- Speculative decoding, prefix caching or serving scheduler behavior
- Operating system, driver and display reservations
- Hardware memory reported in vendor-specific units

Actual memory use must be measured with the intended model artifact, quantizer, runtime, GPU and serving configuration before deployment.

## Editorial and engineering controls

- Formulas and assumptions are published alongside results.
- Inputs are validated; invalid values do not produce a numeric estimate.
- The calculation is a pure deterministic function with unit tests.
- The tool does not send inputs to a third-party service.
- HEZQEN must not present calculator output as an independently benchmarked result.
- Changes to formulas or assumptions require tests and a methodology revision.
