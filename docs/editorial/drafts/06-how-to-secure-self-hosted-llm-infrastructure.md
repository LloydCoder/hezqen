---
title: "How to Secure Self-Hosted LLM Infrastructure"
division: "Cybersecurity"
format: "Security architecture guide"
status: "Research draft — not for publication"
author: "Pending human assignment"
independent_reviewer: "Pending assignment"
editor: "Pending assignment"
last_researched: "2026-11-17"
---

> **Editorial hold:** This draft is a security architecture baseline, not a certification or compliance assessment. It requires independent security review and a named human editor before publication.

# How to Secure Self-Hosted LLM Infrastructure

Self-hosting an LLM changes where the model runs. It does not remove the security problems around identity, data, supply chains, APIs, retrieval, tools, containers or operations.

A model endpoint is an application boundary. It accepts untrusted input, processes sensitive data, retrieves context, emits content and may invoke tools. If that endpoint is exposed without a threat model, access controls and monitoring, the organization has simply moved the attack surface into its own infrastructure.

## 1. Threat-model the whole system

Map the components and trust boundaries:

- User-facing application and authentication.
- Model server, model files and tokenizer.
- GPU host, operating system, drivers and container runtime.
- Prompt templates, system instructions and orchestration.
- Retrieval service, vector database and document stores.
- Tool gateway and external APIs.
- Logs, traces, backups and evaluation data.
- Administrative interfaces and deployment pipeline.

Identify the data each component can read, the actions it can perform, the identities that can invoke it and the consequences of compromise.

The OWASP GenAI LLM Top 10 (2026) covers risks including prompt injection, sensitive information disclosure, excessive agency, supply chain, data/model poisoning, unbounded consumption, misinformation, hidden context exposure, vector/embedding weaknesses and improper output handling. Map those risks to actual controls in the application; a checklist alone is not a threat model.

## 2. Protect the model supply chain

Model files and inference dependencies are production artifacts.

- Pull from trusted repositories and verify provenance.
- Pin immutable model revisions and dependency versions.
- Verify checksums or signatures where publishers provide them.
- Restrict model downloads and conversion jobs to controlled build environments.
- Scan container images and dependencies.
- Maintain a software/model bill of materials where practical.
- Separate training, conversion, evaluation and production artifacts.
- Review model licenses and acceptable-use terms before deployment.
- Test new model versions in isolation before promotion.

A model card is useful documentation, not a cryptographic integrity guarantee. A repository name is not proof that an artifact is authentic.

## 3. Keep model endpoints private and authenticated

Do not expose an inference port to the public internet without a deliberate security design.

Use private networking or a gateway, TLS, strong service authentication, authorization by tenant and workload, rate limits, request-size limits and explicit allowed origins. Administrative model-management endpoints should not share the public inference authorization policy.

Avoid long-lived shared API keys. Use short-lived credentials where possible, rotate them and keep them out of images, source control, prompts, logs and client-side bundles.

Apply least privilege to the model server's database, object storage, registry and orchestration identities. The model process should not receive administrative permissions merely because it needs to load a model.

## 4. Treat prompts and retrieved documents as untrusted data

Prompt injection can arrive directly from a user or indirectly through a web page, PDF, email, code repository or retrieved document. Retrieval does not make content trusted.

- Separate system instructions from user and retrieved content in the application design.
- Label and preserve source provenance.
- Enforce tenant boundaries in retrieval and caching.
- Filter sensitive documents before indexing.
- Validate access rights at retrieval time, not only at ingestion.
- Treat retrieved instructions as data, not authority.
- Test direct and indirect prompt-injection scenarios.
- Do not let retrieved text override application authorization.

No prompt wording can replace deterministic access control.

## 5. Put tools behind an authorization gateway

A model should not receive unrestricted shell, database, cloud or administrative credentials.

Use a tool gateway that independently checks:

- Caller identity and tenant.
- Allowed tool and operation.
- Resource scope and target.
- Argument schema and size.
- User approval requirements.
- Rate and budget limits.
- Idempotency and replay protection.
- Audit requirements.

Separate read-only operations from mutations. Require explicit human approval for consequential external actions. The model may propose an action; the gateway decides whether the action is authorized. A model response, retrieved document or tool output must never grant itself new privileges.

## 6. Harden containers and hosts

Use trusted, minimal images; scan them continuously; run non-root where possible; drop unnecessary Linux capabilities; use read-only root filesystems; restrict mounts; and isolate workloads.

For Kubernetes:

- Apply the most restrictive Pod Security Standard that the workload supports.
- Use dedicated service accounts and disable automatic token mounting when not needed.
- Restrict ingress and egress with NetworkPolicies enforced by the cluster's network plugin.
- Restrict access to the Kubernetes API and node metadata services.
- Encrypt secrets and backups.
- Keep nodes and drivers patched.
- Monitor process and network activity.
- Verify the actual enforcement behaviour of the network plugin.

A NetworkPolicy resource does not provide protection if the cluster's network plugin does not enforce it.

## 7. Protect data and logs

Classify prompts, retrieved documents, model outputs and traces. They may contain credentials, personal data, source code, confidential business information or regulated data.

- Minimize what is sent to the model.
- Redact secrets and personal data when possible.
- Encrypt data in transit and at rest.
- Restrict access to logs and traces.
- Define retention and deletion periods.
- Avoid logging full prompts by default.
- Ensure backups follow the same access and retention controls.
- Prevent cross-tenant cache and retrieval leakage.
- Document any third-party telemetry or model downloads.

A self-hosted model does not automatically make data processing private. Logs, remote telemetry, support access, backups and external tools can still move data outside the intended boundary.

## 8. Prevent denial of service and runaway cost

Large prompts, long outputs, repeated retries and high concurrency can exhaust GPU memory and compute.

Set maximum context length, output tokens, concurrency, queue depth, request rate, per-tenant budget and execution time. Apply circuit breakers, backpressure and cancellation. Monitor GPU utilization, memory, queue wait, tokens per second, errors and spend.

Unbounded consumption is both a security and financial risk. A system that can be made to perform unlimited expensive inference is not production-ready.

## 9. Evaluate, monitor and respond

Before release, test authentication, authorization, tenant isolation, prompt injection, retrieval leakage, output handling, tool abuse, model artifact integrity, resource exhaustion and recovery.

In production, monitor:

- Authentication and authorization failures.
- Unexpected model or tool calls.
- Data access and export anomalies.
- Model/driver/runtime changes.
- GPU memory exhaustion and queue saturation.
- Unusual token volume, retries and per-tenant spend.
- Vulnerability and dependency alerts.
- Backup and restore status.

Maintain an incident process for model artifact compromise, credential exposure, data leakage, prompt injection, unsafe tool actions and service abuse. Preserve relevant evidence without retaining unnecessary sensitive content.

## 10. Use a risk-management framework

NIST's Generative AI Profile (AI 600-1) extends the AI Risk Management Framework with generative-AI-specific considerations. It can help structure governance and risk work across design, development, deployment and operation. It is not a substitute for technical testing or legal advice.

## Deployment acceptance checklist

- [ ] Model provenance, revision and license recorded.
- [ ] Model endpoint private or protected by a tested gateway.
- [ ] Authentication, authorization and tenant isolation tested.
- [ ] Secrets stored and rotated securely.
- [ ] Tool gateway enforces authorization outside the model.
- [ ] Retrieved content treated as untrusted.
- [ ] Container and host hardening verified.
- [ ] Egress and network segmentation tested.
- [ ] Logs, traces and backups have retention/access controls.
- [ ] Context, token, concurrency and spending limits enforced.
- [ ] Security tests and incident runbooks reviewed.
- [ ] Backup restoration and rollback tested.

**Conclusion:** secure self-hosted LLM infrastructure is a system-security problem, not a model-download problem. Protect the artifact, endpoint, data, retrieval path, tools, host and operational lifecycle as one connected system.

## Sources and research record

Reviewed 2026-11-17:

1. [OWASP GenAI LLM Top 10 — 2026 source repository](https://github.com/GenAI-Security-Project/GenAI-LLM-Top10) — current release and canonical risk list.
2. [NIST Generative AI Profile, AI 600-1](https://doi.org/10.6028/NIST.AI.600-1) — AI lifecycle risk management.
3. [OWASP Kubernetes Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Kubernetes_Security_Cheat_Sheet.html) — container, RBAC, network, secrets and runtime controls.
4. [NVIDIA CUDA driver and architecture matrix](https://docs.nvidia.com/datacenter/tesla/drivers/latest/cuda-toolkit-driver-and-architecture-matrix.html) — GPU software compatibility.
5. [Ollama GPU support documentation](https://github.com/ollama/ollama/blob/main/docs/gpu.mdx) — hardware and driver support information.

## Required pre-publication work

- Perform an independent security architecture review against the intended deployment stack.
- Test the controls in a reproducible lab and publish configurations without exposing secrets.
- Verify the current OWASP 2026 canonical list and NIST document revisions.
- Assign a named human author, independent security reviewer and editor.
