---
title: "Running Local AI Models: GPU, RAM and Storage Requirements"
division: "Cloud & Engineering"
format: "Practical infrastructure guide"
status: "Research draft — not for publication"
author: "Pending human assignment"
independent_reviewer: "Pending assignment"
editor: "Pending assignment"
last_researched: "2026-11-17"
---

> **Editorial hold:** Working draft only. Hardware requirements depend on the exact model, quantization and runtime. No human author, independent reviewer or editor has approved this material.

# Running Local AI Models: GPU, RAM and Storage Requirements

Running a model locally is not as simple as downloading a file and checking whether the computer has enough RAM. The deployment needs memory for the model weights, runtime state and KV cache; a compatible software stack; enough CPU and system memory to keep the system stable; and storage for model artifacts, versions and logs.

The right hardware depends on the model and workload. A 7B model used for occasional personal assistance has very different requirements from a 70B model serving multiple concurrent users.

## Start with the exact model, not the marketing label

Before buying hardware, identify:

- Model repository and exact revision.
- Parameter count and architecture.
- Quantization format and group size.
- Weight and KV-cache precision.
- Maximum context and expected prompt lengths.
- Expected concurrent sequences.
- Serving framework and supported GPU backend.
- Required latency and throughput.

A "7B" or "14B" label is a rough size class. It does not specify the loaded memory footprint, context capacity or performance.

## GPU VRAM: the first hard constraint

GPU memory must hold the weights and enough runtime state for inference. For conventional transformer models, KV cache also grows with context length and concurrent sequences.

A first-pass estimate is:

[
M_{total} \approx M_{weights} + M_{KV} + M_{runtime}
]

For example, a nominal 7B model at two bytes per parameter has approximately 13.04 GiB of weight payload before KV cache and runtime allocations. A 4-bit checkpoint may use substantially less memory, but the exact file size and loaded footprint depend on the quantizer and runtime.

A 70B model at two bytes per parameter has approximately 130.39 GiB of nominal weight memory. It is not a single 24 GB or 48 GB GPU workload without substantial quantization or model parallelism.

Use the model's real architecture fields to estimate KV cache. Do not use parameter count alone to infer context capacity.

## System RAM: more than an afterthought

System RAM is used by the operating system, model loaders, tokenizer, data pipelines, runtime processes, caches and supporting services. Some runtimes can place some model layers or tensors in CPU memory when GPU memory is insufficient, but CPU offload can materially change latency and throughput.

A machine with enough RAM to load a model is not necessarily a machine that can serve it at an acceptable speed. CPU memory bandwidth, NUMA layout, PCIe transfers and CPU compute capacity all affect performance.

For a workstation, leave memory headroom for the OS, development tools, containers and other workloads. Do not plan to allocate all installed RAM to a model.

## CPU and platform compatibility

CPU requirements vary by runtime and model. The CPU handles request processing, tokenization, scheduling, networking, data loading and potentially offloaded model operations.

Check:

- Supported instruction sets and runtime build.
- NUMA topology and memory channels.
- PCIe lane count and slot wiring for multi-GPU systems.
- Power delivery, cooling and chassis clearance.
- Motherboard and firmware support.
- Driver, CUDA/ROCm and framework version compatibility.

The NVIDIA CUDA driver/toolkit matrix documents minimum driver and architecture support by CUDA generation. A GPU can be physically installed and still be unusable with an incompatible driver or framework build.

## Storage: model files are not the whole footprint

Storage needs include:

- Model checkpoint files and quantized variants.
- Temporary download and conversion space.
- Container images and runtime libraries.
- Multiple model versions for rollback.
- Logs, traces and evaluation datasets.
- Backups and persistent application data.

Prefer fast local NVMe for active model loading and hot artifacts where the workload justifies it. Shared or network storage can simplify multi-node operations but introduces throughput, latency and availability considerations. Keep model artifacts separate from logs and user data so lifecycle and retention policies can differ.

## GPU support is a software matrix

Hardware support changes over time. Ollama's published GPU support list identifies supported NVIDIA compute capabilities and driver versions, and documents AMD ROCm and Vulkan support. Other runtimes have different support matrices.

Do not assume that a GPU supported by one application is supported by every framework. Verify the exact GPU, operating system, driver, runtime release and model architecture. Record the tested versions in the deployment manifest.

## Multiple GPUs do not become one pooled card

Two 24 GB GPUs do not automatically provide one 48 GB allocation. Multi-GPU serving requires an explicit parallelism strategy supported by the model and runtime.

- Tensor parallelism shards parameters across devices.
- Pipeline parallelism distributes layers across devices.
- Data parallelism runs model replicas to increase aggregate capacity.
- Some architectures and runtimes shard or replicate KV heads differently.

The interconnect matters. PCIe, NVLink and multi-node networking have different bandwidth and latency characteristics. A multi-GPU configuration must be tested on the actual motherboard/server topology.

## A practical starting point

| Workload class | Hardware planning approach |
|---|---|
| Small models and experimentation | Start with a compatible GPU or CPU-only runtime; validate model file size and context. |
| Mid-sized quantized models | Check actual quantized weights, KV cache, runtime headroom and system RAM. |
| Large 30B–70B class models | Treat multi-GPU or high-memory accelerator requirements as a likely design constraint; validate the exact quantization and runtime. |
| Production multi-user serving | Size for concurrency, p95 latency, availability, monitoring, failover and security—not only successful model loading. |

This table is a planning guide, not a guarantee that a particular model fits a particular GPU.

## Validate before buying

1. Pin the model revision and quantization file.
2. Calculate weight memory from the actual artifact or format.
3. Calculate KV cache for the expected context and concurrency.
4. Check the runtime's official GPU and architecture support.
5. Build a small reproducible test environment.
6. Measure load time, peak memory, tokens per second, p50/p95 latency and error rate.
7. Test the maximum expected context and concurrent workload.
8. Repeat after driver, runtime or model upgrades.

**Conclusion:** local AI hardware planning is a model-and-runtime compatibility exercise. VRAM is important, but system RAM, CPU, storage, drivers, interconnect, power and cooling determine whether the deployment is usable and maintainable.

## Sources and research record

Reviewed 2026-11-17:

1. [Ollama GPU support documentation](https://github.com/ollama/ollama/blob/main/docs/gpu.mdx) — supported NVIDIA, AMD and Vulkan hardware/driver combinations.
2. [NVIDIA CUDA Toolkit, Driver and Architecture Matrix](https://docs.nvidia.com/datacenter/tesla/drivers/latest/cuda-toolkit-driver-and-architecture-matrix.html) — compatibility by GPU architecture and CUDA toolkit.
3. [vLLM conserving memory](https://docs.vllm.ai/en/latest/configuration/conserving_memory/) — tensor parallelism and memory constraints.
4. [vLLM parallelism and scaling](https://docs.vllm.ai/en/latest/serving/parallelism_scaling/) — multi-GPU and multi-node deployment strategies.
5. [HEZQEN VRAM methodology](../../LABS_VRAM_METHODOLOGY.md) — current estimator formula and architecture limitations.

## Required pre-publication work

- Add hardware test cases on at least one NVIDIA and one AMD configuration if the article claims both are operationally supported.
- Record exact model artifacts, OS, drivers, runtime versions and measured performance.
- Verify all memory examples using the published calculator and regression vectors.
- Assign a named human author, independent reviewer and editor.
