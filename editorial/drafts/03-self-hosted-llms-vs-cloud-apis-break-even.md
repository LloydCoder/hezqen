---
title: "Self-Hosted LLMs vs Cloud APIs: Where Is the Break-Even Point?"
division: "AI & Technology"
status: "research-draft"
author: "UNASSIGNED — requires consenting human author"
reviewer: "UNASSIGNED — independent AI infrastructure and finance reviewer required"
editor: "UNASSIGNED — authorized HEZQEN editor required"
publication: "NOT FOR PUBLICATION"
research_updated: "2026-11-17"
---

# Self-Hosted LLMs vs Cloud APIs: Where Is the Break-Even Point?

There is no universal token-volume threshold at which self-hosting becomes cheaper. The answer depends on the model, input/output mix, cache discounts, hardware rate, utilisation, redundancy, engineering cost and the value of operational control.

## Compare equivalent workloads

An API bill is not simply total tokens multiplied by one rate. Input and output tokens are priced differently; cached input, batch processing, tool calls, retrieval, search and regional processing may have separate prices. A fair comparison uses the same model capability, task mix, quality target, latency objective and success rate.

A useful monthly API model is:

`API cost = input tokens × input rate + output tokens × output rate + cache/tool/retrieval charges`

A self-hosted model has fixed and variable costs:

`Self-hosted cost = GPU hours + CPU/RAM + storage + network/egress + observability + redundancy + engineering + on-call + security`

For dedicated capacity, GPU cost is approximately hourly rate × provisioned GPU-hours. Utilisation matters because a paid GPU that is idle still costs money. If workloads are bursty, the capacity needed for peak demand can be much larger than average demand.

## A worked capacity example

Public provider rate cards illustrate why a quote must be dated and SKU-specific. On 17 November 2026, Lambda's published instance page lists H100 SXM capacity at $4.09 per GPU-hour, with pricing effective 16 November 2026. Runpod's published page lists different rates for H100 PCIe, H100 SXM and community versus secure capacity. These are provider listings, not guaranteed quotes or interchangeable hardware.

At $4.09 per GPU-hour, one continuously provisioned GPU would cost about $2,986 over a 730-hour month before storage, CPU, network, taxes, support or engineering. Four GPUs would be about $11,943. This arithmetic is not a deployment recommendation: model fit, interconnect, framework support and throughput still need to be tested.

## The break-even equation

Let:

- (F) be monthly fixed self-hosting cost, including reserved compute and operations.
- (v) be self-hosting variable cost per successful task.
- (a) be API cost per equivalent successful task.
- (Q) be successful tasks per month.

Self-hosting is cheaper on this simplified cost basis when:

`F + Qv < Qa`

If (a > v), the break-even volume is:

`Q > F / (a - v)`

If (a ≤ v), increasing volume does not create a cost break-even under these assumptions. This is why a cost model must include quality and failure: a cheap model that requires more retries or human correction may cost more per successful task.

## What changes the decision

Self-hosting becomes more attractive when demand is steady, utilisation is high, a suitable model can meet quality and latency requirements, and the team can operate the system. API usage is often preferable when demand is variable, the team is small, model quality changes quickly, or reliability and support are more valuable than infrastructure control. Hybrid routing can place stable, high-volume workloads on owned capacity and bursty or specialist tasks on APIs.

**Evidence and sources**

- [OpenAI API pricing](https://developers.openai.com/api/docs/pricing)
- [Anthropic Claude Platform pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Google Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Lambda GPU instance pricing](https://lambda.com/instances)
- [Runpod GPU pricing](https://www.runpod.io/pricing)
- [vLLM parallelism and scaling](https://docs.vllm.ai/en/stable/serving/parallelism_scaling/)

**Evidence status:** The monthly GPU example is arithmetic using a dated public rate card. No provider quote, workload benchmark, model-quality comparison or engineering-cost study has been performed for this draft. All prices must be recaptured at publication.

**Editorial gate:** Human author, finance/ML infrastructure reviewer and editor are unassigned. Not publication-ready.
