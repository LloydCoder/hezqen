---
title: "The Hidden Infrastructure Costs of Building an AI SaaS"
division: "Business & Startups"
status: "research-draft"
author: "UNASSIGNED — requires consenting human author"
reviewer: "UNASSIGNED — independent SaaS finance and infrastructure reviewer required"
editor: "UNASSIGNED — authorized HEZQEN editor required"
publication: "NOT FOR PUBLICATION"
research_updated: "2026-11-17"
---

# The Hidden Infrastructure Costs of Building an AI SaaS

A model API quote is not an AI SaaS cost model. Gross margin depends on everything required to deliver a reliable, secure and supportable customer outcome: inference, storage, retrieval, networking, observability, reliability engineering, compliance, customer support and failed work.

## Build a complete cost stack

**Inference:** input/output tokens, cached tokens, model routing, retries, batch or priority processing, image/audio usage and provider-specific surcharges.

**Application infrastructure:** databases, queues, cache, object storage, vector search, embeddings, reranking, background workers and API gateways.

**Data movement:** network egress, cross-region traffic, file downloads, backups and third-party integrations. Egress can become material when the product stores large user files or returns generated artifacts.

**Reliability:** redundant capacity, backups, restore testing, monitoring, alerting, incident response and on-call engineering. A single small instance may be cheap but does not provide the same service level as a redundant production system.

**Security and compliance:** identity, audit logs, secrets management, vulnerability management, security reviews, data retention, privacy requests, legal advice and assurance work.

**People and operations:** engineering, prompt and evaluation maintenance, customer support, human review, sales engineering and abuse response.

## Measure unit economics at the right level

Track cost per active customer, cost per task, cost per successful task and cost per dollar of revenue. Segment customers by workload: token mix, context length, concurrency, files stored, retrieval volume, retries and support demand. Use p50 and p95 consumption, not only averages.

A product can show positive gross margin at average usage and still lose money on a small group of heavy users. Define fair-use limits, quotas and overage policies from observed workload distributions. Price expensive features separately when their cost drivers differ materially.

## Build low, base and high cases

Model at least three scenarios. Include customer count, active users, tasks per user, token mix, average and peak concurrency, storage retention, egress, support time and redundancy. Keep each input explicit and cite current provider rate cards. Separate fixed, variable and step-function costs. Add a sensitivity analysis for model price changes and utilization.

Do not confuse gross margin with contribution margin or net profit. Payment fees, refunds, customer acquisition, sales commissions and corporate overhead may sit outside infrastructure cost but still affect the business.

**Evidence and sources**

- [OpenAI API pricing](https://developers.openai.com/api/docs/pricing)
- [Anthropic Claude Platform pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Google Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [AWS Bedrock pricing](https://aws.amazon.com/bedrock/pricing/)
- [Runpod GPU pricing](https://www.runpod.io/pricing)
- [Lambda GPU instance pricing](https://lambda.com/instances)

**Evidence status:** This draft provides a cost taxonomy. It contains no audited customer data, provider invoices or measured cost per customer. A reproducible low/base/high model and source snapshots are required.

**Editorial gate:** Human author, SaaS finance reviewer and editor are unassigned. Not publication-ready.
