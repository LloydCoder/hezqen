# HEZQEN Labs — Calculator Portfolio Methodology

## Scope
HEZQEN Labs contains sixteen calculators. The original LLM VRAM sizing and API-vs-self-hosted AI cost break-even tools remain separate. This suite adds fourteen deterministic scenario calculators, each with explicit inputs, unit labels, validation, outputs and limitations.

## Added calculators and calculation boundaries

| Tool | Core model | Important exclusions |
|---|---|---|
| Local RAG storage | Chunk count from corpus token volume and overlap; vector payload = chunks × dimensions × bytes/dimension; add source and metadata storage, replicas and headroom | DB index/WAL/compaction, tokenizer variation, compression, provider-specific metadata |
| AI data-leakage risk | Relative heuristic score from sensitive-data share, external processor count and control gaps; separate illustrative exposure = sensitive records × assumed impact/record | Breach probability, legal compliance opinion, expected loss, regulator penalties |
| Local hardware ROI | Purchase less residual value + electricity + maintenance compared with cloud rental for useful workload hours | Performance parity, financing, tax, cooling, downtime and labor |
| Fine-tuning vs RAG | One-time setup + horizon-scaled query costs + recurring maintenance/storage | Quality, accuracy, freshness, latency, safety and evaluation outcomes |
| Cloud migration | Target recurring cost + migration/training/exit + dual-running + contingency compared with stay-put baseline | Stranded commitments, outage costs, tax and contract-specific charges |
| Kubernetes cost | Nodes × hourly rate × hours + cluster fees + storage + user-entered ingress/network/observability | Region/SKU pricing, discounts, idle/spot behavior and unentered provider meters |
| Database capacity | Current rows × average row size × index multiplier; compound growth, replicas, backups and headroom | Engine page layout, bloat, WAL, vacuum, compression and workload-specific indexes |
| API pricing comparison | Input/cached-input/output token volume × manually entered per-million-token rates for two providers | Tools, multimodal usage, retries, taxes, regional and batch pricing unless included |
| Inference throughput | Roofline-style minimum of memory-bandwidth bound and compute bound, adjusted by user efficiency | Not measured performance; ignores batching, KV cache, interconnect and runtime specifics |
| Incident cost | Downtime, response labor, forensics, recovery, notification, assumed per-record impact and other costs | Legal outcomes, fines, insurance and reputational valuation |
| SaaS margin | Revenue less hosting, DB, AI, support, payment and other service costs | Accounting classification and revenue recognition |
| Data-centre energy | IT load × PUE × hours; multiply by tariff and grid emissions factor | Scope 2 market-based accounting and detailed facility telemetry |
| Storage growth | Monthly compounding growth plus fixed monthly additions; replicas, backups, storage and egress rates | Tiering, compression, versioning, retrieval and request charges |
| AI-agent operating cost | Run count × token/tool costs + compute/observability, with retry overhead | Human review, failed-task remediation, evaluation and data licensing |

## Units and validation
- Currency outputs are USD unless a tool explicitly labels another unit.
- Storage quantities use decimal GB in the added suite unless the tool states otherwise.
- Percentage inputs are bounded to prevent nonsensical scenarios.
- Inputs must be finite and inside each field's declared bounds.
- Outputs are estimates. They must not be described as provider quotes, benchmarks, legal advice, security assessments or guaranteed savings.

## External technical references
- OpenAI API pricing: https://platform.openai.com/pricing/ — vendor rates change; enter the currently applicable model and tier manually.
- Google Kubernetes Engine pricing: https://cloud.google.com/kubernetes-engine/pricing — cluster and workload charges depend on mode, resources and region.
- vLLM throughput and KV cache configuration: https://docs.vllm.ai/en/latest/cli/bench/throughput/ — runtime memory utilization and benchmark setup affect actual results.
- OWASP Top 10:2025: https://top10.owasp.org/2025/ — security estimation must not substitute for control verification.
- GHG Protocol: https://ghgprotocol.org/ — emissions reporting requires an appropriate accounting boundary and factors.

## Verification
The Node test suite checks all fourteen calculators with default scenarios, unique route identifiers, finite labeled metrics, input-boundary rejection, and representative monotonic properties. The CI workflow must additionally build the application, type-check, lint, format-check, audit dependencies and smoke-test every public Labs route before merge.
