# HEZQEN Labs VRAM Calculator Methodology

**Calculator version:** 1.1.0  
**Formula version:** 1.0.0  
**Last reviewed:** 2026-11-17  
**Public regression vectors:** [/labs/vram-test-vectors.json](/labs/vram-test-vectors.json)

## Purpose

The VRAM calculator is a deterministic first-pass memory-planning tool for conventional decoder-only transformer deployments. It estimates model-weight memory, KV-cache memory and a configurable runtime reserve. It is not a benchmark, vendor quote, capacity guarantee or deployment recommendation.

## Formula

Let:

- (P) = model parameter count in billions
- (B_w) = effective bytes per parameter for the selected weight format
- (L) = transformer layer count
- (H_{KV}) = number of key/value heads
- (D_H) = head dimension
- (T) = context tokens per sequence
- (N) = concurrent batch size
- (B_{KV}) = bytes per KV-cache element
- (r) = runtime reserve fraction

All memory results are expressed in binary gibibytes (GiB), where (1\text{ GiB}=2^{30}\) bytes.

### Model weights

[
M_{weights}=\frac{P\times10^9\times B_w}{2^{30}}
]

The current effective storage assumptions are:

| Weight format | Effective bytes per parameter | Notes |
|---|---:|---|
| FP16 | 2.0 | Nominal 16-bit storage |
| BF16 | 2.0 | Nominal 16-bit storage |
| INT8 | 1.0625 | Payload plus a conservative metadata allowance |
| INT4 | 0.5625 | Payload plus a conservative metadata allowance |

Quantization implementations vary. Group size, scales, zero points, packing, mixed-precision layers, embeddings and runtime-specific formats can change actual memory consumption. The INT8/INT4 values are planning assumptions, not universal format specifications.

### KV cache

For a standard attention layout with a conventional key and value tensor:

[
M_{KV}=\frac{2\times L\times N\times T\times H_{KV}\times D_H\times B_{KV}}{2^{30}}
]

The leading factor of two represents keys and values. Grouped-query attention (GQA) uses the actual number of KV heads, not the number of query heads. Multi-query attention (MQA) is represented by one KV head.

Supported cache element assumptions:

| KV-cache format | Bytes per element |
|---|---:|
| FP16 | 2 |
| BF16 | 2 |
| FP8 | 1 |
| INT8 | 1 |

### Runtime reserve and total

[
M_{reserve}=(M_{weights}+M_{KV})\times r
]

[
M_{total}=M_{weights}+M_{KV}+M_{reserve}
]

The displayed minimum planning figure rounds the total up to the next whole GiB. It is not the same as a guaranteed hardware allocation.

## Model presets and provenance

Presets prefill architecture fields from the linked model card and configuration. They do not choose the user's quantization implementation or guarantee compatibility with a serving runtime.

| Preset | Parameters | Layers | KV heads | Head dimension | Source |
|---|---:|---:|---:|---:|---|
| Mistral 7B Instruct v0.3 | 7.3B | 32 | 8 | 128 | [Model card](https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3) · [config.json](https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3/blob/main/config.json) |
| Qwen2.5 14B Instruct | 14.7B | 48 | 8 | 128 | [Model card](https://huggingface.co/Qwen/Qwen2.5-14B-Instruct) · [config.json](https://huggingface.co/Qwen/Qwen2.5-14B-Instruct/blob/main/config.json) |

The Qwen2.5 14B model card describes 40 query heads and 8 KV heads, 48 layers, and 14.7B total parameters. The head dimension is derived as hidden size 5,120 divided by 40 query heads, or 128. Its advertised context support is up to 131,072 tokens; the preset starts at 4,096 tokens so users can adjust the serving workload explicitly.

Preset metadata was checked on 2026-11-17. Model repositories can change; verify the exact model revision before using the estimate for procurement.

## Single-GPU capacity screen

The GPU list currently includes these manufacturer-published memory capacities:

| GPU | Published memory | Manufacturer source |
|---|---:|---|
| GeForce RTX 4090 | 24 GB | [NVIDIA specifications](https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/) |
| GeForce RTX 5090 | 32 GB | [NVIDIA specifications](https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/) |
| NVIDIA RTX 6000 Ada Generation | 48 GB | [NVIDIA specifications](https://www.nvidia.com/en-us/products/workstations/rtx-6000/) |

The capacity screen treats 90% of the published capacity as usable planning capacity, leaving a nominal 10% headroom. This is a conservative comparison aid, not a guarantee that the model will load or meet latency/throughput targets.

The current matcher is intentionally single-GPU only. It does not sum VRAM across multiple cards. Multi-GPU feasibility depends on tensor-parallel support, layer placement, interconnect bandwidth/topology, PCIe/NVLink, framework/runtime behaviour and per-device allocation.

## Supported and unsupported architecture assumptions

The formula is appropriate as a first-order estimate when the selected layer count, KV-head count and head dimension describe the deployed model's active KV-cache layout.

Do not treat the current presets/formula as architecture-complete for:

- Multi-head latent attention (MLA), including latent/compressed KV representations.
- Hybrid attention models with different cache behaviour across layer types.
- Sliding-window attention when the effective cache length is shorter than the requested context.
- Architectures with non-uniform layer dimensions or per-layer KV-head layouts.
- Speculative decoding, prefix-cache sharing, paged-cache fragmentation, CUDA graphs or runtime-specific memory pools.
- Training, fine-tuning, optimizer state, gradients, activations or multimodal components.

For these cases, derive the actual cache allocation from the model implementation and serving framework before making hardware decisions.

## Public test vectors

The JSON file at [/labs/vram-test-vectors.json](/labs/vram-test-vectors.json) contains versioned, deterministic input/output examples. The repository test suite reads the same file and checks each published result against the implementation with a numeric tolerance.

These vectors validate arithmetic and regression behaviour only. They are not measured GPU experiments.

## Version history

### 1.1.0 — 2026-11-17

- Added source-linked Mistral 7B Instruct v0.3 and Qwen2.5 14B Instruct architecture presets.
- Added a single-GPU capacity screen for RTX 4090, RTX 5090 and RTX 6000 Ada.
- Added versioned shareable input URLs and copyable result summaries.
- Published deterministic test vectors and added a test that reads the public JSON.
- Preserved the existing weight/KV/reserve formula as formula version 1.0.0.

### Formula 1.0.0

- Model weights use parameter count multiplied by effective bytes per parameter.
- KV cache uses the conventional two-tensor formula with layer count, batch, context, KV heads, head dimension and cache bytes.
- Runtime reserve is applied to the combined weight and KV-cache estimate.

## Changelog policy

Any change to the weight-byte assumptions, KV-cache equation, reserve semantics, supported architecture family or rounding behaviour must:

1. Increment the formula version.
2. Update the public methodology and test vectors.
3. Add or revise deterministic regression tests.
4. Record the reason and expected impact in this changelog.
5. Receive independent technical review before release.

UI, preset metadata or GPU catalogue changes that do not alter the formula increment the calculator version but do not require a formula-version change.
