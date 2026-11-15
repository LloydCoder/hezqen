# HEZQEN Logical Data Model

**Status:** Logical model for review and implementation planning. This is not an applied PostgreSQL schema or migration.

## Design principles

- One dedicated HEZQEN PostgreSQL database; no shared Tinlance product databases.
- Modular monolith with explicit collection/service boundaries.
- Preserve editorial authorship, assignment, approval, revisions and corrections.
- Link material claims to sources and preserved evidence.
- Prefer immutable audit and provenance records; use soft deletion where history matters.
- Public read paths return published content only.
- Keep reader identity, newsletter consent, premium entitlements and integrations separate from editorial authority.

## Core entities

| Domain | Entity | Important attributes and relationships |
|---|---|---|
| Identity | Users | Auth identity, verified email, account state, role assignments, session policy. |
| Identity | Roles | Reader, author, researcher, fact-checker, editor, administrator, service. Roles do not by themselves grant publishing authority. |
| Identity | Authors | Public profile, biography, credentials, avatar, links; optional one-to-one user association. |
| Editorial | Articles | Title, slug, dek, excerpt, rich-text body, division, topics, status, author, assigned editor, publication timestamps, current revision. |
| Editorial | ArticleRevisions | Immutable revision number, content snapshot, author/editor, created timestamp, change summary. |
| Editorial | EditorialAssignments | Article, assignee, assignment type, assigned by, timestamps and state. |
| Editorial | FactChecks | Article revision, fact-checker, status, findings, completion time and evidence links. |
| Editorial | Disclosures | Article, disclosure type, text, reviewer and review timestamp. |
| Editorial | Corrections | Published article, correction text, severity, reason, editor, public notice and timestamp. |
| Research | Investigations | Working title, scope, lead researcher, assigned editor, status, related articles and research projects. |
| Research | ResearchProjects | Research question, methodology, owner, state, dates and related outputs. |
| Research | Sources | Canonical URL, publisher, title, author, publication date, retrieval timestamp and source type. |
| Research | EvidenceArtifacts | Source, collection method, retrieved timestamp, content type, byte size, SHA-256, private storage key, object version and verification state. |
| Research | Claims | Claim text, related article/revision, verification state, materiality and reviewer. |
| Research | ClaimSources | Many-to-many relationship between claims and sources. |
| Research | ClaimEvidence | Many-to-many relationship between claims and preserved evidence artifacts. |
| Research | ResearchNotes | Private notes, author, project/article association and access classification. |
| Taxonomy | Divisions | AI & Technology, Cybersecurity, Cloud & Engineering, Business & Startups. |
| Taxonomy | Topics | Hierarchical topics, slug, description and related content. |
| Taxonomy | Companies | Normalized company identity, canonical domain and related articles/research. |
| Taxonomy | Products | Product identity, vendor, category and related research. |
| Labs | LabTools | Tool slug, version, methodology, public state and supported inputs. |
| Labs | ToolRuns | Tool, normalized input snapshot, output snapshot, formula version, created time and optional user. |
| Intelligence | ResearchReports | Report type, methodology, evidence set, editorial workflow, access tier and release state. |
| Intelligence | Entitlements | User/organization, product tier, valid period, source subscription and state. |
| Intelligence | Subscriptions | Billing provider reference, customer reference, plan, status and period; no raw card data. |
| Audience | NewsletterSubscriptions | Email identity, consent state, confirmed timestamp, locale, preferences and unsubscribe state. |
| Audience | ConsentEvents | Append-only consent, source, purpose, policy version, timestamp and withdrawal. |
| Operations | AuditEvents | Actor, action, resource, before/after digest, request correlation ID, timestamp and outcome. |
| Integrations | IntegrationConnections | Provider, encrypted credential reference, scopes, enabled state and owner. |
| Integrations | WebhookEvents | Provider, event ID, signature verification result, idempotency key, processing state and timestamps. |

## Relationship outline

- A user may have an author profile and may hold one or more operational roles.
- An article has one accountable author and one assigned editor for approval; the author and editor must be different people.
- An article has many revisions, fact-check records, disclosures, claims and corrections.
- A claim can cite multiple sources and multiple evidence artifacts.
- Each evidence artifact belongs to one source and points to a private, versioned object.
- An investigation may contain multiple research projects and produce multiple articles/reports.
- Divisions and topics classify articles, reports, companies and products.
- Lab tools have versioned methodology; tool runs record the exact calculation version and input assumptions.
- Premium reports have entitlements; entitlement checks happen server-side.
- Consent events and audit events are append-only and are not silently overwritten.

## Integrity and indexing requirements

1. Unique constraints on normalized slugs, source canonical identity where applicable, provider event IDs, idempotency keys and consent event IDs.
2. Foreign keys with explicit delete behavior. Prefer RESTRICT for sources/evidence referenced by claims and for published article history.
3. Composite uniqueness for article revision number and tool version.
4. Check constraints for allowed state values, positive revision numbers, non-negative byte sizes and valid timestamps.
5. Index published article queries by status, published timestamp, division and slug.
6. Index source/evidence references and claim verification state.
7. Index audit events by resource, actor and timestamp; partition only when measured volume justifies it.
8. Keep audit and consent tables append-only through server access policy and database privileges.
9. Store private object keys and checksums, not public presigned URLs, in evidence metadata.
10. Store billing provider identifiers and entitlement state, never payment card data.

## Access model

| Actor | Draft content | Fact-check | Approve/publish | Evidence | Public content |
|---|---|---|---|---|---|
| Reader | None | None | No | Public evidence summaries only | Published only |
| Author | Own assigned work | Submit for fact-check | No | Evidence linked to own work, subject to confidentiality | Published only |
| Researcher | Assigned research | Record findings | No | Assigned research evidence | Published only |
| Fact-checker | Assigned review material | Complete assigned checks | No | Assigned evidence | Published only |
| Editor | Assigned editorial scope | Review | Assigned editor only, after all gates | Assigned evidence | Published only |
| Administrator | Operational access | No implicit fact-check authority | No implicit approval authority | Restricted operational access | Published only |
| Service/agent | Explicitly scoped API operations | No human attestation | Never | Scoped, audited operations only | Published only |

Administrator status is not an automatic override of the human editor approval rule. Break-glass procedures, if later required, must be separately designed, dual-controlled and audited.

## Publication invariants

- Only published content is visible through public content APIs.
- Approval requires completed fact-check, disclosure review, source-backed material claims and an assigned human editor.
- Author/editor separation is mandatory.
- Publishing is a separate guarded transition; an agent cannot trigger it by changing a status field.
- Corrections preserve prior published revisions and expose a public correction notice.
- Scheduled publishing is idempotent and rechecks approval at execution time.
- All workflow state changes and their audit events commit atomically.

## Migration and release sequence

1. Finalize Payload package/toolchain compatibility and pin versions.
2. Implement Payload collections and access functions from this logical model.
3. Generate the initial PostgreSQL migration from Payload config.
4. Review generated SQL and constraints; do not use automatic schema push against shared branches.
5. Apply the migration to an isolated temporary/staging branch only after explicit migration approval.
6. Seed non-production test data and verify indexes, foreign keys and access controls.
7. Perform direct REST and Local API authorization tests.
8. Verify backup/restore before production schema rollout.
9. Apply the exact reviewed migration to production through the controlled release process.
