# HEZQEN CMS Operations and Release Contract

**Status:** PR #51 implementation deployed to a protected Vercel Preview; baseline runtime and staging schema checks passed on 2026-11-15. Full staging acceptance remains PARTIAL; PR #51 remains draft.  
**Production:** not deployed. Do not run production migrations or attach production traffic.

This document is the operational companion to docs/PHASE_STATUS.md. A source implementation or green unit test does not by itself prove live service readiness.

## 1. Editorial authority and transactions

The CMS exposes server-side commands under the Payload API:

| Endpoint | Purpose | Authorization |
|---|---|---|
| POST /api/editorial/workflow | State transitions, approval, scheduling, publication, correction open/resolve | Authenticated active human; domain policy enforces the assigned author/editor and allowed transition |
| POST /api/editorial/review | Complete fact-check or disclosure review | Assigned fact_checker for fact-check completion; assigned editor for disclosure review |
| POST /api/editorial/publish-due | Publish due scheduled articles | Bearer secret only; service actor may publish only an already human-approved, due scheduled article |
| POST /api/evidence/upload | Preserve a private evidence object and metadata | Active administrator, editor, researcher or fact-checker |
| POST /api/evidence/download | Retrieve a private evidence object after integrity verification | Active administrator, editor, researcher or fact-checker |

The workflow command uses a PostgreSQL transaction. The article mutation and immutable audit event are committed together; an audit failure rolls back the article update. Optimistic concurrency checks include article revision, workflow status and author/editor/fact-checker assignments. The endpoint does not accept caller-supplied actor identity.

Human editorial approval remains authoritative. The scheduler is deliberately narrower: it can only publish a scheduled article whose existing approval is by the assigned human editor and whose schedule time has arrived. It cannot approve, edit, schedule or otherwise transition articles.

Direct content edits to fact_check, editorial_review, approved, scheduled, published or correction_required articles are blocked. An editor must explicitly return eligible work to draft; editing draft content increments the revision and invalidates prior fact-check/disclosure/approval state. Published content must enter the correction workflow before edits.

## 2. Corrections

A published article can enter correction_required only through the assigned editor's workflow command and with a non-empty correction reason. The system stores the reason, optional public note, request time and resolution metadata. The assigned editor returns the article to draft, which increments its revision and clears approval and review flags. A corrected article must pass the normal review/approval process before publication. The correction remains open until that corrected article is republished.

The public correction-notice presentation remains a separate frontend acceptance gate; the metadata and state lifecycle alone do not prove readers can see the correction notice.

## 3. Scheduled publication

scheduledFor is persisted on the Article collection and its version table. Schedules require an explicit timezone in the timestamp. The scheduler endpoint uses server time and rechecks the article inside a transaction before publishing.

A Cloudflare Worker named hezqen-scheduler has been uploaded as a cron-runner shell. It currently has **no Cron Trigger** and its secret binding is not configured. Do not activate it until:
1. The application endpoint is deployed to the accepted staging host.
2. The Worker's HEZQEN_SCHEDULER_URL points to that host.
3. A matching secret is securely configured in the Worker and the app runtime.
4. A manual authenticated staging invocation proves only due, previously approved articles publish.
5. The five-minute trigger is verified and monitored.

The scheduler is not operational until all five gates pass.

## 4. Private evidence custody

Staging object storage is enabled on Neon branch br-lucky-bird-bayxt3by in eu-central-1. A private bucket named hezqen-evidence exists. A branch-scoped credential named hezqen-staging-evidence-storage has storage:read and storage:write scope. Its S3-compatible access credentials are configured as branch-specific Preview environment variables; secret values are not recorded in this document.

The application-side evidence contract is:
- Private objects only; generated keys are confined to evidence/<UUID>.
- Maximum file size: 4 MiB.
- MIME allowlist: PDF, JSON, XML, plain text, CSV, PNG, JPEG and WebP. HTML/SVG and executable formats are rejected.
- SHA-256 is computed from the incoming bytes, the object is written, then read back and re-hashed before metadata is committed.
- Evidence metadata and the preservation audit event commit in one database transaction.
- Download requires an authorized research/editorial role, re-checks byte size and SHA-256, and writes a download audit event before returning the file as a private attachment.
- If object verification or metadata persistence fails, the object is deleted where possible.

The bucket is confirmed private on staging branch br-lucky-bird-bayxt3by; the current object listing is empty. Preview environment metadata contains branch-scoped storage endpoint/credential variables, but secret values were not decrypted. No evidence object has yet been uploaded through the application endpoint. Live SigV4, upload, read-back, deletion, download and audit acceptance therefore remain open. Neon documents 5 GB of Object Storage per Free project; enforce a usage budget and retention/legal-hold policy rather than assuming indefinite retention or unlimited free storage (https://neon.com/blog/neon-free-plan-1-gb-per-project).

## 5. Transactional email

Resend reports tinlance.com as verified with sending enabled in eu-west-1. A dedicated sending_access API key named HEZQEN staging transactional email is domain-restricted to tinlance.com. The key is stored as a sensitive branch-specific Preview variable and is not recorded here.

The custom Payload email adapter sends authentication/password-reset messages through Resend. Runtime configuration:
- RESEND_API_KEY — sensitive sending credential.
- PAYLOAD_EMAIL_FROM — HEZQEN <no-reply@tinlance.com>.

The domain is verified, but a real Payload password-reset email has not yet been delivered and received in staging. Do not mark email operational until both provider acceptance and mailbox receipt are verified.

## 6. Runtime environment variables

The following variables are present in branch-scoped Vercel Preview environment metadata for fix/cms-final-reconciliation, in addition to the existing Payload/Neon configuration. Secret values were not decrypted. This confirms configuration records exist, not that live provider operations have succeeded:

| Variable | Purpose | Classification |
|---|---|---|
| AWS_ENDPOINT_URL_S3 | Neon S3-compatible endpoint for the staging branch | Environment configuration |
| AWS_REGION | eu-central-1 signing region | Plain |
| AWS_ACCESS_KEY_ID | Branch-scoped Neon storage credential ID | Secret |
| AWS_SECRET_ACCESS_KEY | Branch-scoped Neon storage secret | Secret |
| HEZQEN_EVIDENCE_BUCKET | hezqen-evidence | Plain |
| RESEND_API_KEY | Domain-restricted Resend sender key | Secret |
| PAYLOAD_EMAIL_FROM | Verified sender identity | Plain |
| HEZQEN_SCHEDULER_SECRET | Bearer credential for the scheduler endpoint | Secret |

Cloudflare Worker compatibility CI declares matching environment bindings. The live application Worker still requires these bindings to be configured in its deployment environment.

## 7. Hosting and cost boundary

The connected Vercel project hezqen is on Hobby. Vercel's current terms restrict Hobby to personal/non-commercial use; HEZQEN is intended to be a commercial publication, so Hobby is not an acceptable production host (https://vercel.com/docs/plans/hobby, https://vercel.com/docs/limits/fair-use-guidelines). The current Vercel deployment is a protected Preview used for validation only. No Pro upgrade or other paid plan has been authorized.

Cloudflare Workers Free remains a candidate, not an accepted production host: current limits are 100,000 requests/day and 10 ms CPU per HTTP/Cron invocation, while heavier SSR/auth workloads commonly need 10–20 ms. Cloudflare currently recommends vinext for Next.js on Workers but documents vinext as beta; the repository workflow proves compatibility/build/local smoke only, not production CMS/admin performance (https://developers.cloudflare.com/workers/platform/limits/, https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/). The Cloudflare account's Workers Builds API reports that the account is not connected to GitHub; repo-connected builds still require dashboard authorization.

The separate hezqen-scheduler Worker is only a cron runner, not the HEZQEN web application. It has no Cron Trigger. No production DNS, production Worker or production deployment has been created.

## 8. Release acceptance checklist

- [x] PR #51 final head dfa9a6808d7a45f096b5afb2b39d1fdbe6f16e40 passed HEZQEN CI, Payload migration verification and Cloudflare compatibility on 2026-11-15. PR #51 remains draft and unmerged pending the remaining runtime/security gates.
- [ ] Cloudflare compatibility, Worker build and public/CMS smoke workflows pass on the same source revision.
- [x] Both Payload migrations are applied and recorded on isolated Neon staging branch br-lucky-bird-bayxt3by; the scheduled/correction columns were verified read-only. This does not authorize or imply a production migration.
- [ ] Staging app deploy is made on a commercially permitted host; Vercel Hobby is not an option for production.
- [ ] Authenticated role matrix passes for administrator, editor, author, fact-checker, researcher and unauthenticated callers.
- [ ] Direct REST and Local API attempts cannot write workflow, review, publication, correction, evidence or audit fields.
- [ ] Workflow transaction rollback is verified against real PostgreSQL, including audit-write failure.
- [ ] Scheduled publication publishes only due articles with prior human approval; no premature or unapproved publication is possible.
- [ ] Correction notice is visible to readers and corrected article history is preserved.
- [ ] Real evidence upload/read-back/download round-trip passes against the private staging bucket; SHA-256 and audit events match.
- [ ] Resend password-reset email is accepted and received by a controlled test mailbox.
- [ ] Scheduler Worker secret and five-minute Cron Trigger are configured only after the staging endpoint passes.
- [ ] Backup/restore, monitoring, alerting, incident response and rollback are accepted.
- [ ] Production database migration, production administrator bootstrap, production host and DNS cutover remain separate explicit release approvals.

**Current verdict:** implementation and ephemeral database migration coverage are in progress; live staging acceptance and commercial production hosting are not complete.

## 9. Verified staging baseline — 2026-11-15

The following checks were performed against the Preview deployment for the exact PR #51 head:

- Vercel deployment dpl_96t5ckCEdTevrih3Nf3HwSikg76Q is READY and points to commit dfa9a6808d7a45f096b5afb2b39d1fdbe6f16e40.
- GET /api/health/ready, GET /admin/login, and GET /api/articles?limit=1 returned HTTP 200. The articles response was empty.
- Unauthenticated GET requests to /api/users, /api/audit-events, /api/evidence, /api/claims, and /api/sources returned HTTP 403. Public /api/topics returned HTTP 200.
- The staging Neon branch reports both 20261115_155359_initial and 20261116_000000_editorial_scheduling_corrections in payload_migrations. The new scheduling and correction columns are present.
- Staging contains one active administrator, zero articles, zero sources and zero audit events. The private hezqen-evidence bucket exists and currently contains zero objects.
- Vercel runtime-log inspection for the deployment's preceding 30 minutes returned no warning/error/fatal records.

These checks establish a deployed preview and unauthenticated route baseline only. They do not prove a successful administrator login, authenticated role matrix, REST/Local API write-bypass resistance, live evidence upload/download, real Resend delivery, scheduled execution, or public correction rendering.

### Remaining security and operational blockers

1. The hezqen_cms database role is non-superuser and cannot create databases, roles or the public schema, and it does not bypass RLS. However, it still has table-level DELETE privileges across content, evidence and audit tables. Payload collection access denies these operations, but the database credential itself is not least-privilege for immutable records. Revoke unnecessary UPDATE/DELETE privileges at the database layer and verify the resulting runtime before production.
2. The Neon staging branch is unprotected on the current Free plan. Keep migrations isolated and explicitly approved; do not upgrade the plan without approval.
3. No live object-storage upload/read-back/download test has been completed; the bucket is empty.
4. No real Payload password-reset email has been accepted and received by a controlled mailbox.
5. The scheduler Worker has no Cron Trigger or configured secret binding; it must remain dormant.
6. The correction lifecycle has metadata and workflow commands, but the public correction-notice UI is not yet accepted.
7. The full authenticated role matrix, actual administrator login, real-Postgres transaction rollback on audit failure, and direct Local API bypass tests remain open.
8. The Vercel Hobby plan cannot host this commercial publication in production. Cloudflare Workers Free/vinext is not accepted until CMS/admin compatibility and CPU budgets are measured on a deployed candidate.

**Current verdict:** PR #51 has green CI and a READY Preview with a verified staging migration baseline. CMS staging acceptance is PARTIAL; production remains NOT READY. No production database migration, production deployment, production administrator bootstrap, production DNS cutover, paid-plan upgrade or scheduler activation has been performed.