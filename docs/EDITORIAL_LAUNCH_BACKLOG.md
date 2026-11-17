# HEZQEN Editorial Launch Package — Article Briefs

**Status:** Commissioning briefs only; none of these entries should be represented as published work.  
**Editorial standard:** HEOS / docs/EDITORIAL_STANDARDS.md  
**Research process:** assignment → primary sources → evidence preservation → claim verification → technical reproduction → draft → independent review → editor approval.

## 1. How Much VRAM Does a 70B LLM Actually Need?

- **Division:** AI & Technology
- **Reader:** AI engineers, ML platform teams, CTOs and infrastructure buyers.
- **Core question:** Why is “70B parameters” insufficient to determine the hardware required to serve a model?
- **Required analysis:** weight storage by precision/quantization, KV cache by layer/KV-head/head-dimension/context/batch, runtime reserve, tensor parallelism, per-GPU placement and serving framework overhead.
- **Research inputs:** exact model configuration files; NVIDIA GPU specifications; vLLM and llama.cpp memory/serving documentation; reproducible calculator vectors.
- **Required experiment:** run at least one reproducible inference workload or clearly label all results as arithmetic estimates. Record model revision, quantization, runtime, context, batch, GPU and memory telemetry.
- **Limitations:** do not extrapolate a single runtime's allocation to every runtime; distinguish capacity fit from throughput fit.
- **Related tool:** /labs/vram.

## 2. GPU Memory Explained: Weights, KV Cache, Context and Batch Size

- **Division:** AI & Technology
- **Reader:** engineers deploying open-weight models.
- **Core question:** Which model and serving parameters drive memory consumption, and which are commonly misunderstood?
- **Required analysis:** parameter storage, FP16/BF16/INT8/INT4 assumptions, GQA/MQA, KV cache, context length, concurrent sequences, runtime reserve, paged attention and fragmentation.
- **Research inputs:** model configs, architecture papers, framework documentation and vendor memory specifications.
- **Required artifact:** formula walkthrough with dimensional analysis and a set of worked examples cross-checked against public test vectors.
- **Limitations:** separate standard MHA/GQA/MQA from MLA, sliding-window and hybrid architectures.
- **Related tool:** /labs/vram.

## 3. Self-Hosted LLMs vs Cloud APIs: Where Is the Break-Even Point?

- **Division:** AI & Technology
- **Reader:** startup founders, CTOs, AI platform and finance leads.
- **Core question:** At what workload and cost assumptions can self-hosting become economically competitive?
- **Required analysis:** input/output token pricing, GPU rental or amortized purchase cost, utilisation, idle capacity, storage/networking, engineering labour, on-call, redundancy, model quality and capacity constraints.
- **Research inputs:** provider pricing pages captured with access date; cloud/GPU provider rate cards; workload assumptions; published serving benchmarks.
- **Required experiment:** sensitivity analysis across low/base/high utilisation and workload mixes. Keep provider pricing as dated source evidence, not hardcoded eternal facts.
- **Limitations:** avoid a universal winner; distinguish cost per token from cost per successful task and service-level requirements.
- **Related tool:** /labs/ai-cost.

## 4. The Real Cost of Running Production AI Agents

- **Division:** AI & Technology
- **Reader:** AI product founders, platform engineers and finance leaders.
- **Core question:** How do model calls, tool calls, retries, context growth and failure recovery change agent unit economics?
- **Required analysis:** tokens per task, tool invocation costs, retries, loops, caching, orchestration, retrieval, storage, observability, human review, safety controls and failed-task costs.
- **Research inputs:** provider pricing, documented framework execution semantics, controlled traces and representative workload distributions.
- **Required experiment:** replay a defined task set and publish median/p95 token use, tool calls, completion rate and cost per successful task.
- **Limitations:** never report only average token cost when retries and failed tasks materially change economics.
- **Related tool:** proposed /labs/agent-cost; verify route and implementation before publication.

## 5. Running Local AI Models: GPU, RAM and Storage Requirements

- **Division:** Cloud & Engineering
- **Reader:** developers, self-hosters, IT teams and small infrastructure operators.
- **Core question:** What does a realistic local inference host require beyond advertised GPU memory?
- **Required analysis:** GPU VRAM, system RAM, CPU, PCIe, storage throughput/capacity, cooling, power, drivers, container/runtime compatibility and model download footprint.
- **Research inputs:** manufacturer datasheets, operating-system and driver requirements, runtime documentation and reproducible hardware tests.
- **Required artifact:** clearly scoped workstation/server profiles with dated specifications and explicit compatibility notes.
- **Limitations:** separate minimum boot requirements from recommended production headroom; do not imply every GPU/runtime combination is supported.
- **Related tool:** /labs/vram and relevant hardware calculators.

## 6. How to Secure Self-Hosted LLM Infrastructure

- **Division:** Cybersecurity
- **Reader:** security engineers, platform teams and enterprise architects.
- **Core question:** What security controls are necessary when models, data and inference services are operated inside an organization's environment?
- **Required analysis:** identity and access, model supply-chain provenance, artifact scanning, sandboxing, network egress, secrets, prompt injection, tool authorization, data leakage, logging, patching, isolation and incident response.
- **Research inputs:** OWASP Top 10 for LLM Applications, NIST AI RMF, vendor hardening documentation, container/Kubernetes security standards and reproducible threat scenarios.
- **Required artifact:** threat model and control mapping with testable acceptance checks.
- **Limitations:** distinguish model safety controls from infrastructure security; do not imply local hosting alone guarantees privacy or security.
- **Related tool:** future AI data-risk and infrastructure security tools.

## 7. The Hidden Infrastructure Costs of Building an AI SaaS

- **Division:** Business & Startups
- **Reader:** startup founders, CTOs and operators.
- **Core question:** Which infrastructure costs are omitted when founders estimate the cost of an AI SaaS product?
- **Required analysis:** inference, database, storage, egress, observability, backups, redundancy, support/on-call, engineering, security, compliance and payment/transaction costs.
- **Research inputs:** current provider rate cards, public cloud calculators, benchmarked workload assumptions and transparent cost models.
- **Required artifact:** sample cost model with low/base/high scenarios and sensitivity to utilisation and retention.
- **Limitations:** mark every assumed input; distinguish fixed, variable and step-function costs.
- **Related tool:** /labs/saas-margin; verify route and calculation semantics before publication.

## 8. When Should a Startup Self-Host Its AI Models?

- **Division:** Business & Startups
- **Reader:** founders, CTOs, product and finance leaders.
- **Core question:** Which technical, economic, regulatory and operational conditions justify moving from API services to self-hosted models?
- **Required analysis:** demand predictability, scale, latency, data residency, model quality, engineering capacity, reliability, vendor concentration, switching costs and opportunity cost.
- **Research inputs:** current API/GPU pricing, infrastructure requirements, workload evidence, regulatory primary sources and interviews with practitioners.
- **Required artifact:** decision framework with explicit “stay on API”, “hybrid”, and “self-host” cases.
- **Limitations:** avoid one-size-fits-all recommendations; distinguish regulatory obligations from preference or marketing claims.
- **Related tool:** /labs/ai-cost.

## Publication controls for all eight

- The commissioning brief is not evidence and does not establish the article's conclusion.
- All changing prices, model configs, product specifications and regulations must be checked at publication time.
- Preserve primary-source copies or stable evidence references and record access dates.
- Verify all material numerical claims independently.
- Name the author and reviewer only after their consent and credentials are confirmed.
- Disclose Tinlance relationships, affiliate links, sponsorships, vendor access and other conflicts.
- Separate measured results, vendor claims, estimates and editorial analysis.
- Publish only after human editor approval.
- Add a correction path and monitor material source changes after publication.
