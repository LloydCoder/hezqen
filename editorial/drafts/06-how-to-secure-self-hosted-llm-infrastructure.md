---
title: "How to Secure Self-Hosted LLM Infrastructure"
division: "Cybersecurity"
status: "research-draft"
author: "UNASSIGNED — requires consenting human author"
reviewer: "UNASSIGNED — independent security practitioner required"
editor: "UNASSIGNED — authorized HEZQEN editor required"
publication: "NOT FOR PUBLICATION"
research_updated: "2026-11-17"
---

# How to Secure Self-Hosted LLM Infrastructure

Running an open-weight model inside your own environment changes where processing occurs; it does not make the deployment secure by default. The model server, artifacts, orchestration, data sources, tools, network paths and operators all become part of the attack surface.

## Protect the model supply chain

Treat model weights, tokenizer files, adapters, quantization artifacts, containers, Python packages and runtime images as production dependencies. Record source, revision, license, hashes and provenance. Prefer pinned revisions and reproducible builds. Scan containers and dependencies, restrict who can publish or replace artifacts, and separate test artifacts from production-approved artifacts. A model repository is not automatically trustworthy because it is popular.

## Enforce identity and network boundaries

Use workload identities and short-lived credentials where possible. Restrict access to inference endpoints, model registries, object storage, vector databases and admin consoles. Do not expose an unauthenticated model server to the public internet. Apply network segmentation and explicit egress policy so a compromised prompt, tool or runtime cannot freely reach metadata services, internal control planes or sensitive systems.

## Treat prompts, retrieved documents and outputs as untrusted

Prompt injection can arrive directly from a user or indirectly through documents, web pages, repositories and tool output. Retrieval-augmented generation does not remove this risk. Separate instructions from retrieved data, enforce access control before retrieval, and do not allow model text to become executable code or authorization.

Validate structured outputs against schemas. Use parameterized database access and safe rendering. Tool authorization must be deterministic and external to the model. A prompt or model response must never grant its own permissions.

## Isolate tools and secrets

Run code execution in an isolated sandbox with resource limits, no ambient credentials and narrowly scoped network access. Keep secrets in a dedicated secret manager; never inject broad credentials into prompts or model context. Give each tool only the permissions required for its task. Require human approval for sensitive operations such as data export, privilege changes, financial transactions and production deployment.

## Monitor and recover

Log security-relevant events without retaining unnecessary raw prompts or personal data. Track model and artifact versions, access decisions, tool calls, denials, unusual egress, resource consumption and administrative changes. Maintain patching, incident response, backup and restore procedures. Red-team prompt injection, data exfiltration, model replacement, tool abuse and denial-of-service paths.

**Evidence and sources**

- [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/llm-top-10/)
- [OWASP LLM06:2025 Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)
- [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework)
- [NIST Generative AI Profile, NIST AI 600-1](https://doi.org/10.6028/NIST.AI.600-1)
- [NVIDIA H100 Confidential Computing overview](https://resources.nvidia.com/en-us-gpu-resources/h100-datasheet-24306)

**Evidence status:** This is a control framework, not an audit or penetration-test result. A threat model and test evidence for a defined reference architecture are required before making claims about effectiveness.

**Editorial gate:** Human author, security reviewer and editor are unassigned. Not publication-ready.
