# G11 — Original Research Protocols

**Status:** Protocols prepared; no physical GPU benchmark or production workload study has been conducted.

## Research integrity

Separate vendor specifications, architecture-derived calculations, simulations and observed measurements. A calculator output is not a benchmark. Never invent hardware access, performance results, source observations or reviewer approval.

Every published experiment must include a named human author, independent competent reviewer, editor approval, reproducible configuration and limitations.

## Experiment families

### GPU memory and model loading

Record exact GPU SKU, board memory, driver, CUDA/runtime, framework, model revision, tokenizer, quantization artifact/hash, context, batch, tensor-parallel degree, KV-cache dtype and serving flags. Measure peak allocated and reserved memory per GPU, load success, warm-up and failures.

### Quantization and quality

Compare BF16/FP16, FP8/INT8 and supported INT4 artifacts under the same task set. Record quantizer, group size, calibration data, artifact hash, evaluation dataset, quality metric, output variance and speed. Do not generalize from one model or benchmark.

### Context and concurrency

Sweep context length and concurrent sequences. Record KV-cache growth, throughput, time-to-first-token, inter-token latency, p50/p95 latency, OOM rate and scheduler behavior. Include prefix-cache and speculative-decoding settings when used.

### API versus self-hosted economics

Use an equivalent task set and quality target. Capture input/output/cached tokens, retries, success rate, tool/retrieval cost, GPU billable hours, utilization, idle capacity, storage, egress, redundancy, engineering and on-call time. Preserve dated provider price snapshots and invoices where lawful.

### Agent economics

Instrument task traces with model calls, token usage, tool calls, retries, timeouts, human escalation, success/failure and cost. Report cost per successful task, not just cost per model request. Exclude prompts and user content from public telemetry.

### Self-hosted infrastructure security

Define the reference architecture and threat model. Test artifact provenance, access control, egress, prompt injection, retrieval authorization, sandbox isolation, secret exposure, tool authorization, resource exhaustion, patching, backup and incident response. Map controls to current OWASP/NIST guidance and publish test scope and limitations.

## Evidence package

Each experiment must preserve:

- Repository commit and script version.
- Machine-readable configuration and exact command line.
- Hardware inventory and topology.
- Model/runtime/container revisions and artifact hashes.
- Raw telemetry and derived result files.
- Dataset provenance, license and exclusions.
- Repetition count, uncertainty and failure cases.
- Reproduction instructions and independent review record.

## Publication gate

No measured-result language until a reproducible run exists. No external claims about a provider or product without source verification and a fair opportunity to respond where appropriate. Hardware experiments remain pending until suitable hardware and operator access are available.
