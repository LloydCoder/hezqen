# HEZQEN Labs Calculator Suite — Methodology and Limitations

## Scope

The Labs portfolio contains sixteen tools: the original [LLM VRAM sizing](/labs/vram) and [API versus self-hosted AI cost](/labs/ai-cost) calculators, plus fourteen additional calculators listed below. This document describes the formulas implemented in `src/domain/labs/calculator-suite.ts`. It is a model specification, not a claim that illustrative defaults are market prices or measured performance.

## Fourteen additional calculators

| Route | Model |
|---|---|
| `/labs/rag-storage` | Vector payload = documents × chunks/document × (dimensions × bytes/dimension + 8 bytes/vector). The 8-byte tuple overhead follows pgvector’s documented vector storage representation. An explicit user-supplied index-overhead factor and metadata are added, then total capacity is multiplied by replica count. Monthly storage cost = replicated GB × supplied USD/GB-month. Decimal GB is used. Index overhead varies by index type, parameters and workload; it is a planning allowance, not a measured index size. |
| `/labs/ai-data-risk` | Scenario likelihood factor = min(1, sensitivity × exposure × (6 − control maturity) / 125). Expected loss = records × loss/record × factor. Scores are user-defined ordinal inputs, not empirically calibrated probabilities. |
| `/labs/hardware-roi` | Monthly electricity = wall kW × operating hours × tariff. Local run cost adds maintenance. Simple payback = purchase cost / (cloud baseline − local run cost), only when savings are positive. Excludes depreciation, financing, taxes, utilization mismatch and resale value. |
| `/labs/finetune-vs-rag` | Fine-tuning total = preparation + training hours × rate + monthly inference × horizon. RAG total = indexing + (generation + retrieval) × horizon. Latency is displayed as user input; no quality equivalence is assumed. |
| `/labs/cloud-migration` | One-time cost = discovery + refactor + transfer + training + dual-run. Simple payback = one-time cost / (current monthly run rate − target monthly run rate), only with positive savings. |
| `/labs/kubernetes-cost` | Nodes = count × hourly price × hours. Total adds control plane, persistent storage, load balancers and egress. Does not infer provider-specific discounts, requests/limits or ancillary services. |
| `/labs/database-capacity` | Current payload = rows × average row bytes. Projected storage = payload × (1 + index overhead) × (1 + monthly growth)^months × replica count. Decimal GB; indexes are an input factor. |
| `/labs/api-pricing` | Each option cost = (input tokens × input price + output tokens × output price) / 1,000,000. Prices must be entered by the user and normalized to the same currency, model tier and billing unit. |
| `/labs/inference-throughput` | Aggregate tokens/s = GPUs × supplied tokens/s/GPU × utilization. Requests/s = aggregate tokens/s / output tokens/request. This is a planning estimate, not a benchmark or capacity guarantee. |
| `/labs/incident-cost` | Direct cost = downtime hours × revenue impact/hour + response + legal + affected records × notification cost/record + other direct costs. Does not estimate fines, litigation outcomes, churn or reputational damage unless entered under other costs. |
| `/labs/saas-margin` | Payment cost = MRR × payment rate. Direct costs = infrastructure + AI + payment + direct support. Gross margin = (MRR − direct costs) / MRR. Excludes non-direct operating expenses and accounting policy differences. |
| `/labs/datacenter-energy` | Facility power = IT load × PUE. Monthly kWh = facility power × operating hours. Energy cost = kWh × tariff. PUE must be at least 1. |
| `/labs/storage-growth` | Retained capacity = initial GB × (1 + monthly growth rate)^months × replica count. Monthly run-rate cost = retained GB × supplied storage price. This is an end-of-horizon run rate, not cumulative spend over the retention period. |
| `/labs/agent-cost` | Model cost = runs × steps × (input tokens/step × input price + output tokens/step × output price) / 1,000,000. Total adds tool/API cost per run and platform overhead. Excludes retries unless included in average steps/tokens. |

## Research references

- [pgvector storage reference](https://github.com/pgvector/pgvector#vector-type): documents 4 × dimensions + 8 bytes for its float32 vector type. The calculator generalizes the element width using the user-selected bytes/dimension and retains the 8-byte tuple overhead as a first-order estimate. Other databases and encodings may differ.
- [OpenAI API pricing](https://developers.openai.com/api/docs/pricing): illustrates that input, cached input and output token categories can have different prices. The comparison tool intentionally accepts normalized input/output prices from the user; it does not scrape or auto-update provider prices.
- [U.S. Department of Energy data-centre design guide](https://www.energy.gov/sites/default/files/2024-07/best-practice-guide-data-center-design.pdf): defines PUE as total facility energy divided by IT equipment energy. The energy calculator applies the same ratio to supplied power and operating hours.
- [NVIDIA inference benchmarking concepts](https://developer.nvidia.com/blog/llm-benchmarking-fundamental-concepts/): describes throughput and latency measures such as tokens/s, requests/s, time to first token and inter-token latency. The throughput estimator does not claim to replace workload-specific benchmarking.

## Shared input and output rules

- All calculator inputs are supplied by the user; the starting values are illustrative examples only.
- Inputs are checked for finite numeric values and each field's documented range.
- Negative values are not accepted unless a future calculator explicitly documents them.
- Results are deterministic and calculated in the browser from the displayed inputs. No hidden provider pricing feed or external benchmark is queried.
- Values use decimal GB where a formula says GB; the original VRAM calculator separately uses binary GiB.
- A zero or invalid denominator is handled explicitly; payback is not fabricated when monthly savings are zero or negative.
- The risk estimator is not a probability forecast, compliance assessment, legal opinion or actuarial model.
- Throughput and latency inputs are not HEZQEN benchmark measurements.
- Calculators are decision-support aids, not purchasing, architecture, legal, security or investment advice.

## Verification

The Node test suite includes one or more deterministic tests for each of the fourteen models, checks the portfolio registration count, and exercises invalid inputs. The repository CI commands remain authoritative: `pnpm test`, `pnpm run typecheck`, `pnpm run lint`, `pnpm run format:check`, `pnpm audit --audit-level moderate` and `pnpm run build`. A source change is not considered accepted until these workflows pass and the deployed routes receive browser verification.
