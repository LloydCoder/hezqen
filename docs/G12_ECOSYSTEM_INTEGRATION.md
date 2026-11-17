# G12 — Tinlance Ecosystem Integration

**Status:** Architecture constraints documented; integrations not implemented.

## Governing principles

- HEZQEN is a publication, not an execution authority for the wider Tinlance agent ecosystem.
- AI may assist source discovery, summarization, drafting, classification and monitoring.
- Only authorized human editors approve and publish editorial material.
- Model output, prompt text, memory, source content, tool output and connector responses never grant execution authority.
- External actions require deterministic authorization, least privilege, auditability and explicit policy checks.

## Integration sequence

### 1. Tinlyt — evidence and source discovery

Consume read-only, provenance-bearing source records through a versioned API. Preserve source URL, title, publisher, publication/access dates, content hash, extraction method, retrieval time and limitations. A source update should create a review task, not silently rewrite a published article.

### 2. TAS — governed research assistance

Use TAS for controlled task orchestration, assignment, evidence gathering and workflow telemetry. HEZQEN's editorial system remains the authority for authorship, review, corrections and publication. TAS cannot approve an article or bypass the CMS approval state.

### 3. Public read-only MCP

Expose only allowlisted read operations such as:

- Search published HEZQEN articles.
- Retrieve article metadata and canonical URL.
- Read public research methodology and editorial policies.
- Retrieve public calculator metadata and versioned outputs.
- Search public source/evidence summaries where licensing permits.

Do not expose private evidence, unpublished drafts, subscriber records, lead details, CMS administration, credentials, scheduler controls or write/publish actions.

### 4. Research monitoring

Monitoring may detect source changes, new advisories, standards updates and price changes. Each detection must include source identity, previous/current version, timestamp and a human-review queue. No automatic publication or silent claim mutation.

## Security controls

- Read-only service identity and database role.
- Explicit endpoint and field allowlists.
- Schema validation and bounded pagination.
- Authentication, rate limits and audit logs.
- No arbitrary SQL, code execution, URL fetching or CMS writes.
- SSRF protection and strict egress allowlists for source retrieval.
- Prompt-injection isolation for retrieved pages and documents.
- Data minimization and no subscriber/lead PII exposure.
- Versioned API contract, integration tests and revocation procedure.

## Acceptance gates

- Documented data-flow and threat model.
- Read-only identity tested against attempted writes.
- Public/private data boundary tests.
- SSRF, prompt-injection, pagination, rate-limit and authorization tests.
- Provenance and evidence-byte preservation tests.
- Human editorial approval workflow remains unchanged.
- No production integration until G1 and the relevant system's own acceptance gates are complete.
