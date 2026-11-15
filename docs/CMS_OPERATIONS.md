# HEZQEN CMS Operations and Release Contract

**Status:** implementation in PR #51; not yet merged or accepted in a live staging runtime.  
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

The bucket has been provisioned, but no evidence object has yet been uploaded and verified through the application endpoint. Live S3 signature, upload, read-back, deletion and download acceptance remain open. Neon currently lists 5 GB of Object Storage per Free project; keep an explicit usage budget and retention/legal-hold policy, and do not assume indefinite retention or unlimited free storage.

## 5. Transactional email

Resend reports tinlance.com as verified with sending enabled in eu-west-1. A dedicated sending_access API key named HEZQEN staging transactional email is domain-restricted to tinlance.com. The key is stored as a sensitive branch-specific Preview variable and is not recorded here.

The custom Payload email adapter sends authentication/password-reset messages through Resend. Runtime configuration:
- RESEND_API_KEY — sensitive sending credential.
- PAYLOAD_EMAIL_FROM — HEZQEN <no-reply@tinlance.com>.

The domain is verified, but a real Payload password-reset email has not yet been delivered and received in staging. Do not mark email operational until both provider acceptance and mailbox receipt are verified.

## 6. Runtime environment variables

Staging requires these variables in addition to the existing Payload/Neon configuration:

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

The connected Vercel project hezqen is on Hobby. Vercel documents Hobby as a personal, non-commercial plan. HEZQEN is intended to be a commercial publication; therefore Hobby must not be used for production or treated as an accepted commercial hosting solution. No Pro upgrade or other paid plan has been authorized.

Cloudflare Workers Free is a potential no-new-spend candidate, but its documented CPU limit is 10 ms per invocation. The HEZQEN Cloudflare compatibility workflow tests a vinext build and local Worker smoke routes; it does not prove that production CMS/admin requests fit the Free CPU limit. The Cloudflare account's Workers Builds API also reports that the account is not connected to GitHub. A one-time GitHub integration authorization in the Cloudflare dashboard is required before a repo-connected Worker build can be created.

The separate hezqen-scheduler Worker is only a cron runner, not the HEZQEN web application. It has no Cron Trigger. No production DNS, production Worker or production deployment has been created.

## 8. Release acceptance checklist

- [ ] PR #51 merged only after all required CI workflows pass on the final PR head.
- [ ] Cloudflare compatibility, Worker build and public/CMS smoke workflows pass on the same source revision.
- [ ] Migration is applied to the isolated staging Neon branch only after backup/restore evidence and explicit staging approval.
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
