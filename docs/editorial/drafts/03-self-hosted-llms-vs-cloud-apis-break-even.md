---
title: "Self-Hosted LLMs vs Cloud APIs: Where Is the Break-Even Point?"
division: "AI & Technology"
format: "Economics and decision analysis"
status: "Research draft — not for publication"
author: "Pending human assignment"
independent_reviewer: "Pending assignment"
editor: "Pending assignment"
last_researched: "2026-11-17"
---

> **Editorial hold:** This draft contains time-sensitive price snapshots and an illustrative scenario. It has not been independently reviewed or approved. Recheck all provider rates and model terms immediately before publication.

# Self-Hosted LLMs vs Cloud APIs: Where Is the Break-Even Point?

Self-hosting an LLM is not automatically cheaper than using an API. It replaces a variable, usage-based bill with a combination of compute commitments, idle capacity, infrastructure, engineering and operational responsibility.

The break-even point is therefore not a universal number of tokens. It depends on the model, workload shape, price tier, GPU utilization, availability target, team capability and the cost of keeping the service reliable.

The right comparison is not "API token price versus GPU hourly price." It is **total cost per successful unit of useful work**.

## 1. Calculate API cost from the workload

For a simple text workload:

[
C_{API,request} =
\frac{I \times P_i + O \times P_o}{1,000,000}
]

Where (I) and (O) are input and output tokens per request, and (P_i) and (P_o) are the corresponding prices per million tokens.

Monthly API spend is:

[
C_{API,month} = R \times C_{API,request}
]

Where (R) is monthly request volume.

This model should be expanded for the selected provider's actual billing rules: cached input, cache writes, batch processing, long-context tiers, tool charges, image/audio tokens, regional processing and other metered features can change the effective rate.

**Illustrative price pair:** OpenAI's API pricing page lists GPT-6.1 Sol standard input at $2 and output at $10 per million tokens. That is a dated price example, not a quality-equivalent comparison with any particular open-weight model. Always compare models that meet the same task-quality and latency requirements.

Assume 1,000 input tokens and 500 output tokens per request:

[
C_{API,request} =
\frac{1,000 \times 2 + 500 \times 10}{1,000,000}
= \$0.007
]

At 100,000 requests per month, the illustrative API spend is $700.

## 2. Calculate the full self-hosted cost

A basic rented-GPU calculation is:

[
C_{GPU} = G \times H \times R_h
]

Where (G) is GPU count, (H) is billable hours per GPU per month, and (R_h) is the hourly rate per GPU.

But GPU rent is only one line item. A more complete monthly model is:

[
C_{selfhost} =
C_{GPU} + C_{storage} + C_{network} + C_{platform}
+ C_{redundancy} + C_{engineering} + C_{oncall} + C_{amortization}
]

Include:

- **Provisioned compute:** every GPU-hour billed, including idle hours when the instance remains allocated.
- **Storage:** model checkpoints, container images, logs, datasets, snapshots and backups.
- **Networking:** ingress/egress, inter-zone or inter-region traffic, private connectivity and load balancing.
- **Platform overhead:** CPU, RAM, database, vector search, monitoring, orchestration and security services.
- **Redundancy:** warm replicas, failover capacity, multi-zone deployment and spare capacity.
- **Engineering:** model integration, inference optimization, upgrades, incident response and security maintenance.
- **On-call:** alert response, capacity management, patching and operational ownership.
- **Capital amortization:** the monthly cost of purchased GPUs, server, networking, power and cooling.

Do not enter both rental and purchase amortization for the same GPU capacity. They are alternative ownership models.

## 3. Idle capacity changes unit economics

A GPU rented for a full month is usually billed for the provisioned time, not only the seconds spent generating tokens. A low-utilization deployment can therefore have an attractive hourly rate and a poor cost per useful token.

A simple effective cost metric is:

[
C_{per million tokens} =
\frac{C_{selfhost,month}}{T_{useful,month}} \times 1,000,000
]

Where (T_{useful,month}) is the measured number of billable tokens actually served during the month.

This denominator must be defined carefully. Input and output tokens have different performance characteristics. A single combined token count is useful for a rough cost metric, but it is not a throughput guarantee. Track prefill and decode separately when capacity planning matters.

Utilization is also not a free control knob. Raising utilization may increase queueing, tail latency, memory pressure and failure risk. A deployment optimized for 95% GPU utilization may violate its latency SLO during a burst. The useful target is the highest utilization that still meets the service's availability and latency requirements.

## 4. A real provider price snapshot

Runpod's published pricing page, reviewed 12 November 2026, listed these Secure Cloud hourly examples:

| GPU | Listed hourly rate | 730-hour month, one GPU |
|---|---:|---:|
| RTX 6000 Ada 48 GB | $1.09 | $795.70 |
| H100 SXM 80 GB | $4.39 | $3,204.70 |
| H200 141 GB | $5.29 | $3,861.70 |

These are provider price snapshots, not universal market rates. Community Cloud and Secure Cloud rates differ. Availability, region, storage, deployment mode, discounts and provider terms can change the total. The rates do not tell us how many tokens a given model will serve per second.

Using the earlier illustrative API rate of $0.007 per request, a single H100's GPU rent alone would equal the API spend at roughly:

[
\frac{3,204.70}{0.007} \approx 457,815
]

requests per month.

That is only a **GPU-rent-only arithmetic threshold**. It excludes all other self-hosted costs and assumes the GPU can serve the workload. It is not a recommendation to run a particular model on one H100, and it is not a measured throughput comparison.

At 100,000 requests, the $700 illustrative API bill is lower than the $3,204.70 GPU rent alone. At higher volume, the fixed-cost side becomes more attractive—but only if the chosen model, quantization, serving stack and GPU fleet meet the same quality and service requirements.

## 5. Break-even is a workload-specific calculation

For a fixed monthly self-hosted cost and a constant API cost per request:

[
R_{break-even} =
\frac{C_{selfhost,month}}{C_{API,request}}
]

This is useful only if the fixed-cost assumption is credible. It becomes misleading when:

- API prices have multiple tiers or caching discounts.
- Request sizes vary widely.
- GPU demand has sharp peaks and long idle periods.
- The model requires several GPUs or multiple replicas.
- The self-hosted system cannot meet the same p95 latency or availability.
- The self-hosted model has different task quality and therefore needs more retries or human review.
- Networking, storage, observability, security or staff costs are omitted.

A sensitivity analysis should vary request volume, input/output ratio, GPU utilization, replica count, token prices and operational cost. Show monthly and annual costs, but do not imply that a single point estimate is certain.

## 6. When APIs usually make more sense

An API is often the rational starting point when traffic is uncertain, usage is low or bursty, the team lacks inference operations experience, or the business needs to ship quickly. It avoids owning GPU capacity and much of the serving stack.

APIs also make it easier to trial multiple model families, route between providers and scale without procurement. The trade-offs include provider dependence, variable spend, data-handling requirements, model availability and the need to understand provider-specific terms.

## 7. When self-hosting can make sense

Self-hosting becomes more compelling when workload volume is sustained and predictable, utilization can remain high without breaching latency objectives, the model can be served efficiently on available hardware, and the organization has the skills to operate it.

It may also be justified by data residency, offline operation, specialized fine-tuning, model control, predictable capacity or a need to integrate deeply with an internal platform. These are strategic reasons; they should not be disguised as cost savings.

A hybrid design is often more resilient: self-host predictable baseline traffic, burst to an API or serverless pool when demand spikes, and retain a tested fallback path. The additional routing and data-governance complexity must be included in the cost and risk model.

## 8. A decision sequence

1. Establish a real request distribution: input tokens, output tokens, concurrency, peak-to-average ratio and latency SLO.
2. Select models that meet the same task-quality threshold.
3. Price the API using current provider rates and the actual billing features used.
4. Benchmark the candidate self-hosted model on the target GPU and runtime.
5. Measure prefill, decode, concurrency, p50/p95 latency and successful tasks per hour.
6. Calculate the full monthly cost, including idle capacity, redundancy, networking, storage, engineering and on-call.
7. Run low/base/high demand scenarios and calculate cost per successful task.
8. Revisit the decision when prices, model quality, traffic or hardware economics change.

**Conclusion:** APIs are usually cheaper while demand is small or unpredictable because they avoid idle infrastructure and operational overhead. Self-hosting can win at sustained scale, but the crossover is determined by measured throughput and fully loaded operating cost—not by a GPU hourly rate alone.

## Sources and research record

Reviewed 2026-11-17:

1. [OpenAI API pricing](https://openai.com/api/) — published model input/output token rates; pricing is time-sensitive.
2. [Anthropic API pricing documentation](https://platform.claude.com/docs/en/about-claude/pricing) — model, caching and batch pricing structure.
3. [Runpod GPU pricing](https://www.runpod.io/pricing) — dated Secure Cloud and Community Cloud GPU pricing snapshot.
4. [AWS EC2 Capacity Blocks pricing](https://aws.amazon.com/ec2/capacityblocks/pricing/) — reservation-based accelerator pricing and region variation.
5. [HEZQEN API vs self-hosted cost methodology](../../AI_COST_CALCULATOR_METHODOLOGY.md) — current calculator formula and explicit exclusions.
6. [FinOps Foundation Framework](https://www.finops.org/framework/) — unit economics, allocation and cost accountability.

## Required pre-publication work

- Recheck provider prices, regions, taxes, billing units and GPU availability.
- Extend the calculator to model idle utilization, storage, networking, redundancy, annual totals and sensitivity.
- Validate all examples in the calculator's versioned test vectors.
- Add measured throughput only after running a documented benchmark.
- Obtain a named human author, independent reviewer and editor.
