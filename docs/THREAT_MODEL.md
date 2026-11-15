# HEZQEN Security Threat Model

**Status:** Initial design baseline. This document is not a completed security assessment or an ASVS attestation.

## Scope and security objectives

HEZQEN is a public editorial publication with a privileged newsroom, research evidence pipeline, reader accounts, Labs tools and a future paid intelligence surface.

Security objectives:
1. Preserve confidentiality of accounts, unpublished work, source identities where confidential, secrets and private evidence.
2. Preserve integrity of editorial decisions, source records, evidence bytes, claims, corrections, entitlements and audit events.
3. Preserve availability of public reading and newsroom operations under abuse and provider failure.
4. Ensure publication authority is held by accountable human editors and cannot be acquired through prompts, agents, integrations or client-supplied fields.
5. Preserve evidence provenance and make unauthorized alteration detectable.

## System components and trust boundaries

| Component | Trust level | Security boundary |
|---|---|---|
| Public browser | Untrusted | All request data, URLs, uploads and browser state are attacker-controlled. |
| Public Next.js rendering | Server-controlled, public output | May expose only published and intentionally public data. |
| Editorial/admin UI | Authenticated but not inherently trusted | UI restrictions are not authorization; every mutation is checked server-side. |
| Next.js server handlers | Privileged application boundary | Derive identity from verified sessions; validate input; enforce access and rate limits. |
| Payload CMS (planned) | Privileged application service | Collection/field access, hooks and server-only commands; never trust client roles. |
| Neon PostgreSQL | Restricted data plane | Dedicated HEZQEN project; staging/production isolation; least-privilege roles and reviewed migrations. |
| Evidence object storage (planned) | Restricted data plane | Private by default; immutable/versioned retention and integrity verification. |
| Evidence acquisition worker | High-risk egress boundary | Isolated worker, no application secrets, strict DNS/IP validation, redirect revalidation and network egress restrictions. |
| Tinlyt/Searqon/TAS integrations (future) | Untrusted external systems | Authenticated, scoped APIs; signed webhooks; schemas; idempotency; replay protection; audit and kill switches. |
| CI and dependency supply chain | Build-time privileged boundary | Pinned actions, lockfile integrity, least-privilege tokens, dependency audit and protected release gates. |

## Threat scenarios and required controls

| Threat | Example | Required controls and verification |
|---|---|---|
| Broken access control | Author edits another author's draft; reader calls admin endpoint | Server-derived identity, collection/field access, object-level authorization, deny-by-default, IDOR tests for REST and Local API. |
| Editorial privilege escalation | Author changes approvedById or status in request body | Ignore client-controlled workflow fields; invoke domain transition on server; persist actor from authenticated session; separation-of-duties tests. |
| Security misconfiguration | Debug routes, permissive CORS, exposed secrets, public evidence bucket | Environment validation, restrictive headers/CSP, no debug in production, private buckets, secret scanning, config review. |
| Software supply-chain compromise | Compromised dependency or GitHub Action | Exact action SHAs, frozen lockfile, audit, dependency update review, provenance and least-privilege CI permissions. |
| Cryptographic failure | Weak or caller-supplied evidence digest | SHA-256 computed server-side over captured bytes; verify digest after storage; TLS; secret rotation; no custom cryptography. |
| Injection | Stored XSS in article content; SQL injection in filters; command injection in tools | Contextual output encoding, safe rich-text rendering, parameterized SQL, schema validation, no shell interpolation, CSP and regression tests. |
| Insecure design | Agent can publish; evidence worker can access DB secrets | Human approval boundary, capability separation, threat modeling, isolated worker, explicit command allowlists and approval gates. |
| Authentication failure | Credential stuffing or session theft | Secure HTTP-only cookies, CSRF protection where applicable, rate limits, MFA for privileged editors, session revocation, verification and lockout. |
| Integrity failure | Evidence replaced after fact-check; webhook replay | Immutable evidence storage/versioning, checksums, signed webhook verification, idempotency keys, audit log and revision history. |
| Logging/alerting failure | Privileged change or repeated auth failures go unnoticed | Structured security events, immutable audit trail, alert thresholds, retention, redaction and incident runbooks. |
| Exceptional-condition mishandling | Failed publish partially updates article and audit record | Transactional state + audit writes, safe error handling, retries with idempotency, concurrency/version checks and rollback tests. |
| SSRF | Research URL resolves to metadata endpoint or private host after redirect | HTTPS-only, DNS resolution and IP classification, pinned destination, revalidate redirects, network egress firewall, time/size/content limits. |
| Prompt injection / agent abuse | Retrieved article tells agent to expose secrets or publish content | Treat retrieved content as data, never instructions; tool capability allowlists; no publish tool for agents; output validation; human review. |

## OWASP Top 10:2025 coverage

The implementation backlog maps to all ten categories:
- **A01 Broken Access Control:** server-side RBAC/ABAC, ownership and assignment checks, direct API authorization tests.
- **A02 Security Misconfiguration:** secure headers, CSP, CORS, environment separation, storage ACLs, production debug settings.
- **A03 Software Supply Chain Failures:** pinned GitHub Actions, lockfile, dependency audit, update review, build provenance.
- **A04 Cryptographic Failures:** TLS, password/session controls, secrets management, evidence checksums, key rotation.
- **A05 Injection:** SQL parameterization, XSS-safe rich text, SSRF controls, safe parsing and command execution policy.
- **A06 Insecure Design:** threat model, least privilege, editorial separation of duties, safe evidence acquisition, abuse cases.
- **A07 Authentication Failures:** secure session lifecycle, rate limits, MFA for privileged roles, verification and recovery.
- **A08 Software or Data Integrity Failures:** signed webhooks, provenance, immutable revisions, checksums, idempotency.
- **A09 Security Logging & Alerting Failures:** append-only audit events, alerts, retention, sensitive-data redaction.
- **A10 Mishandling of Exceptional Conditions:** transaction boundaries, safe errors, bounded retries, concurrency control and rollback.

## ASVS 5.0 verification baseline

Use the stable OWASP ASVS 5.0.0 release as the verification framework. The project should target Level 2 for authenticated editorial, research and reader-account surfaces, with Level 3 controls selected for high-impact administration, evidence custody, secrets and publishing authorization. This target is a project requirement, not a claim of conformance.

For each requirement selected from the official ASVS 5.0.0 CSV:
- Record the requirement identifier and applicability.
- Define the implementation control.
- Link automated tests, manual test evidence or operational configuration.
- Record pass/fail/not-applicable and reviewer/date.
- Block production release on unresolved critical/high findings.

## Release gates

Production release is blocked until:
- Privileged routes and APIs have server-side authorization tests, including direct API and IDOR attempts.
- Publishing cannot be performed by authors, readers, service accounts or agents.
- Session, CSRF, rate-limit, upload and account recovery controls are tested.
- Evidence acquisition has network-level egress restrictions and security review.
- Evidence storage is private and integrity is verified after upload.
- Database migrations, least-privilege roles, backup and restore have been tested.
- Security logs, alerting, retention and incident response are operational.
- Accessibility and performance gates pass independently of security checks.

## Incident response outline

1. Detect and triage; preserve relevant logs and evidence.
2. Contain by disabling affected credentials, routes, integrations or acquisition workers.
3. Preserve forensic copies and chain of custody.
4. Assess affected content, accounts, evidence and data exposure.
5. Recover from known-good code/data and rotate exposed secrets.
6. Correct, notify affected parties where required, and publish editorial corrections when warranted.
7. Record root cause, remediation, verification and follow-up controls.

## References

- OWASP Top 10:2025: https://owasp.org/Top10/2025/
- OWASP ASVS 5.0.0: https://asvs.owasp.org/
- OWASP ASVS downloads: https://asvs.owasp.org/downloads/
