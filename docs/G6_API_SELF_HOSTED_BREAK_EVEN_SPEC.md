# G6 — API vs Self-Hosted AI Break-Even Calculator Specification

**Status:** Specification prepared; implementation pending the separate HEZQEN Labs codebase.  
**Owner:** HEZQEN Labs engineering.  
**Publication integration:** Allowlisted calculator ID and versioned result contract only.  
**Non-goal:** Do not execute arbitrary CMS-authored code or move the calculation engine into Payload content.

## 1. Decision contract

The calculator must answer a specific question:

> For an equivalent workload, at what monthly request or token volume does self-hosting become less expensive than using a managed model API, after accounting for idle capacity and the full operating burden?

The output is a scenario estimate, not a procurement quote or universal recommendation. It must make the model, quantization, workload, pricing date, region and operating assumptions visible.

## 2. Inputs

### API workload and pricing

- Provider, model ID, region and pricing snapshot date.
- Monthly requests and successful-task rate.
- Average input, cached-input and output tokens per request.
- Input, cached-input and output price per million tokens.
- Tool, retrieval, embedding, reranking and other per-request charges.
- Retry rate and failure/rework cost.

Prices must be source-linked and date-stamped. Manual overrides must be labeled as user-supplied assumptions. Never silently apply a price from a different model, region, tier or modality.

### Self-hosted capacity and operating cost

- Model and exact revision; parameter count; quantization and KV-cache format.
- GPU SKU, GPU count, region/provider and hourly rate.
- Provisioned/billable hours per month and target utilization.
- Measured sustained tokens/second per GPU for the selected model, quantization, context and batch.
- CPU/RAM, storage, backup, network/egress and observability cost.
- Redundancy/replica capacity and failover allowance.
- Engineering, model operations, on-call, security and support cost.
- Hardware purchase cost, useful life and residual value when owned.
- Capacity headroom and target availability.

Do not use vendor peak throughput as a measured serving rate. If the user has no benchmark, show capacity as unknown and keep the cost comparison explicitly conditional.

## 3. Core formulas

Let (R) be monthly requests, (I) input tokens/request, (C) cached input tokens/request, and (O) output tokens/request. Let (p_i), (p_c) and (p_o) be the corresponding price per million tokens.

`API token cost/request = (I × p_i + C × p_c + O × p_o) / 1,000,000`

`API monthly cost = R × (token cost/request + tool/retrieval cost/request) + fixed API charges`

For GPU capacity, let (G) be GPU count, (h) billable GPU hours/month, (u) utilization as a fraction, and (t) measured sustained aggregate tokens/second/GPU under the stated workload.

`GPU monthly compute cost = G × h × hourly GPU rate`

`productive GPU hours = G × h × u`

`idle GPU hours = G × h × (1 - u)`

`estimated token capacity = G × h × 3,600 × u × t`

The throughput input must be measured for the selected serving configuration. If only an estimate is supplied, label the capacity result accordingly.

`self-hosted monthly cost = compute + CPU/RAM + storage + network + redundancy + operations + engineering + on-call + amortization`

`self-hosted cost per million tokens = monthly self-hosted cost / monthly served tokens × 1,000,000`

For a simplified per-request comparison, let (F) be monthly fixed self-hosting cost, (v) self-hosted variable cost/request and (a) equivalent API cost/request.

`break-even requests/month = F / (a - v)`

This threshold exists only when (a > v). If not, the calculator must report that increasing volume does not create a break-even under the current assumptions.

`capital payback months = upfront hardware purchase cost / positive monthly savings`

Do not report payback when monthly savings are zero or negative.

## 4. Required outputs

- API monthly and annual cost.
- Self-hosted monthly and annual total cost.
- Cost per request and per million input/output/total tokens.
- GPU billable hours, productive hours and idle hours.
- Estimated capacity versus requested token volume, with an explicit unknown state if no benchmark exists.
- Break-even request and token volume, if mathematically valid.
- Hardware capital payback period, if applicable.
- Cost sensitivity to utilization, GPU hourly price, model pricing and request volume.
- Clear assumption ledger, source links, pricing snapshot date and model/quantization identifiers.
- Shareable scenario URL and copyable result summary.

## 5. Acceptance scenarios

1. API-only scenario with zero GPU capacity.
2. Self-hosted scenario with zero API usage.
3. Low utilization with substantial idle cost.
4. High utilization with measured throughput.
5. Redundant deployment with failover capacity.
6. Purchased GPU with amortization and residual value.
7. Hosted GPU rental with dated hourly pricing.
8. Cached-input workload and mixed input/output ratios.
9. Retry-heavy agent workload and successful-task denominator.
10. Insufficient self-hosted capacity; must not claim a valid cost comparison.
11. (a ≤ v); break-even must be unavailable rather than negative.
12. Zero/negative, non-finite and extreme inputs.
13. Model or quantization changes that invalidate the throughput benchmark.

## 6. Security and privacy

- Never request provider API keys or credentials.
- Never collect raw prompts, user content or personal data.
- Calculator inputs stay in the browser unless the user explicitly saves a scenario.
- Analytics may record only consented, allowlisted aggregate events; never record token inputs, prompts, customer identifiers or cost-sensitive scenario payloads.
- CMS may select only a known calculator ID and published version. It must not execute code supplied by a CMS field.

## 7. Architecture and release gate

The Labs calculation engine must live in the separate `hezqen-labs` repository. The publication app should contain only a controlled integration adapter that maps an allowlisted calculator ID to a known, versioned Labs artifact. The adapter must validate the request/response schema, version, origin and output type.

The current `/labs/ai-cost` page is a basic request-cost comparison and does not yet satisfy this full break-even specification. It must not be described as a complete API-versus-self-hosted break-even calculator.

The separate repository was not present in the connected GitHub repository search, and the available GitHub actions do not expose repository creation. Do not work around this by adding the new calculation engine to the publication repository. G6 remains pending until the separate repository can be created and the implementation can be tested there.
