# HEZQEN CMS Operations and Release Contract

**Status (2026-11-16):** PR #51 and PR #52 are merged. PR #52 merge commit is `c71e6b7d1bffcf677b73454f959b99a593c269f0`. A READY Vercel Preview exists for that commit, but it is not Production and the staging custom domain still maps to an older branch. Post-merge push-workflow completion and live authenticated, storage, email and scheduler acceptance remain outstanding. Production remains NOT READY.  
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
| POST /api/evidence/verify | Verify preserved evidence bytes and source metadata before it can support a claim | Active editor or fact-checker |
| POST /api/claims/verify | Verify a material claim against its verified evidence during fact-check | Assigned active editor or fact-checker on the linked article |

The workflow command uses a PostgreSQL transaction. The article mutation and immutable audit event are committed together; an audit failure rolls back the article update. Optimistic concurrency checks include article revision, workflow status and author/editor/fact-checker assignments. The endpoint does not accept caller-supplied actor identity. Protected Local API writes use a module-private request-context capability rather than caller-spoofable string flags; collection hooks reject direct privileged writes and deletion of immutable records.

Human editorial approval remains authoritative. The scheduler is deliberately narrower: it can only publish a scheduled article whose existing approval is by the assigned human editor and whose schedule time has arrived. It cannot approve, edit, schedule or otherwise transition articles.

Direct content edits to fact_check, editorial_review, approved, scheduled, published or correction_required articles are blocked. An editor must explicitly return eligible work to draft; editing draft content increments the revision and invalidates prior fact-check/disclosure/approval state. Published content must enter the correction workflow before edits.

## 2. Corrections

A published article can enter correction_required only through the assigned editor's workflow command and with a non-empty correction reason. The system stores the reason, optional public note, request time and resolution metadata. The assigned editor returns the article to draft, which increments its revision and clears approval and review flags. A corrected article must pass the normal review/approval process before publication. The correction remains open until that corrected article is republished. The public correction-notice and article-history presentation is not yet accepted.

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

The application-side evidence contract now includes a separate verification endpoint. Evidence remains `preserved` after upload; an editor or fact-checker must verify the private object's read-back bytes and source metadata before a claim can use it. A material claim can be verified only by the assigned editor/fact-checker while its article is in `fact_check`. Fact-check completion is blocked until every material claim and attached evidence item is verified.

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

The following variables are present in Vercel Preview environment metadata for fix/cms-final-reconciliation, in addition to the existing Payload/Neon configuration. Some entries are branch-scoped and others apply to Preview generally. Secret values were not decrypted. This confirms configuration records exist, not that live provider operations have succeeded:

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

- [x] Latest Payload migration verification run [43774399391](https://github.com/LloydCoder/hezqen/actions/runs/43774399391) passed on code head `bc80495` and verified both migrations against ephemeral PostgreSQL.
- [x] Cloudflare vinext compatibility, Worker build and public-route/health smoke pass on source head `f0b1ae4e4ca78b9d654630b1581e53880d4bb67a` (run 43775481035).
- [x] Both Payload migrations are applied and recorded on isolated Neon staging branch br-lucky-bird-bayxt3by; the scheduled/correction columns were verified read-only. This does not authorize or imply a production migration.
- [ ] Staging app deploy is made on a commercially permitted host; Vercel Hobby is not an option for production.
- [ ] Authenticated role matrix passes for administrator, editor, author, fact-checker, researcher and unauthenticated callers.
- [x] Collection-hook tests cover protected REST/Local API mutation paths, private write capabilities, and deletion guards for articles, topics, users, sources, claims, evidence and audit events.
- [ ] Full authenticated REST/Local API role-matrix acceptance is performed against the deployed staging runtime.
- [ ] Workflow transaction rollback is verified against real PostgreSQL, including audit-write failure.
- [ ] Scheduled publication publishes only due articles with prior human approval; no premature or unapproved publication is possible.
- [ ] Correction notice is visible to readers and corrected article history is preserved.
- [ ] Real evidence upload/read-back/download round-trip passes against the private staging bucket; SHA-256 and audit events match.
- [ ] Resend password-reset email is accepted and received by a controlled test mailbox.
- [ ] Scheduler Worker secret and five-minute Cron Trigger are configured only after the staging endpoint passes.
- [ ] Backup/restore, monitoring, alerting, incident response and rollback are accepted.
- [ ] Production database migration, production administrator bootstrap, production host and DNS cutover remain separate explicit release approvals.

**Current verdict:** all required PR CI/CD workflows are green on source head `f0b1ae4e4ca78b9d654630b1581e53880d4bb67a`; live staging acceptance and commercial production hosting are not complete.

## 9. Verified staging baseline — 2026-11-15

The following checks were performed against the Preview deployment for the code-bearing PR #51 head:

- Vercel deployment dpl_96t5ckCEdTevrih3Nf3HwSikg76Q is READY and points to commit dfa9a6808d7a45f096b5afb2b39d1fdbe6f16e40. It does not contain the latest claim/evidence verification controls, private capability guards, or current editorial policy changes.
- GET /api/health/ready, GET /admin/login, and GET /api/articles?limit=1 returned HTTP 200. The articles response was empty.
- Unauthenticated GET requests to /api/users, /api/audit-events, /api/evidence, /api/claims, and /api/sources returned HTTP 403. Public /api/topics returned HTTP 200.
- The staging Neon branch reports both 20261115_155359_initial and 20261116_000000_editorial_scheduling_corrections in payload_migrations. The new scheduling and correction columns are present.
- Staging contains one active administrator, zero articles, zero sources and zero audit events. The private hezqen-evidence bucket exists and currently contains zero objects.
- Vercel runtime-log inspection for the deployment's preceding 30 minutes returned no warning/error/fatal records.

These checks establish a deployed preview and unauthenticated route baseline only. They do not prove a successful administrator login, authenticated role matrix, REST/Local API write-bypass resistance, live evidence upload/download, real Resend delivery, scheduled execution, or public correction rendering.

### Remaining security and operational blockers

1. The hezqen_cms database role is non-superuser, cannot create databases/roles/the public schema, and does not bypass RLS. Read-only privilege inspection confirms no UPDATE/DELETE grants on audit_events, evidence, claims or sources, and no DELETE on articles, topics or users. Remaining DELETE grants are confined to Payload internals/version/relationship/session/preferences tables (`_articles_v`, `_articles_v_rels`, `articles_rels`, `payload_kv`, `payload_locked_documents*`, `payload_preferences*`, `users_sessions`). Review `_articles_v` retention and the necessity of those internal grants before production; do not revoke them blindly because Payload may need them for version/session/relationship housekeeping.
2. The Neon staging branch is unprotected on the current Free plan. Keep migrations isolated and explicitly approved; do not upgrade the plan without approval.
3. No live object-storage upload/read-back/download test has been completed; the bucket is empty.
4. No real Payload password-reset email has been accepted and received by a controlled mailbox.
5. The scheduler Worker has no Cron Trigger or configured secret binding; it must remain dormant.
6. The correction lifecycle has metadata and workflow commands, but the public correction-notice UI is not yet accepted.
7. The full authenticated role matrix, actual administrator login, real-Postgres transaction rollback on audit failure, and end-to-end authenticated Local API bypass acceptance remain open. Collection-hook unit tests now cover the protected write/delete boundaries.
8. The Vercel Hobby plan cannot host this commercial publication in production. Cloudflare Workers Free/vinext is not accepted until CMS/admin compatibility and CPU budgets are measured on a deployed candidate.

**Current verdict (superseded by the 2026-11-16 CI reconciliation at the top of this document):** the READY Vercel Preview remains an older source revision. CMS staging acceptance is PARTIAL; production remains NOT READY. No production database migration, production deployment, production administrator bootstrap, production DNS cutover, paid-plan upgrade or scheduler activation has been performed.


## Latest operational reconciliation — 2026-11-16

PR #51 is merged as `2df3a0c02e55c1edac878923569392687442b972`. PR #52 is a separate draft, head `b2ed65f0f594958e4b0aa3914a7e29b11abbda4e`, implementing public article pages, homepage/division discovery, public correction notices/history and dynamic article sitemap entries. Do not treat PR #52 as deployed or merged yet.

PR #52 validation on the exact head is green:
- [HEZQEN CI 43778471161](https://github.com/LloydCoder/hezqen/actions/runs/43778471161): lint, format, 175 tests, moderate dependency audit, production build, ephemeral PostgreSQL migrations, Node runtime route smoke including database readiness and missing-article 404, and TypeScript.
- [Cloudflare compatibility 43778471215](https://github.com/LloydCoder/hezqen/actions/runs/43778471215): vinext compatibility, Worker build and local public-route smoke.
- Post-merge main workflows for PR #51 passed on commit `2df3a0c02e55c1edac878923569392687442b972`: [HEZQEN CI 43776226082](https://github.com/LloydCoder/hezqen/actions/runs/43776226082) and [Cloudflare compatibility 43776226029](https://github.com/LloydCoder/hezqen/actions/runs/43776226029).

The Cloudflare Worker smoke uses an explicit empty-CMS fixture and validates route rendering/build compatibility only. It does not prove that Payload can connect to PostgreSQL from a deployed Worker; database-backed CMS integration is tested in Node CI against ephemeral PostgreSQL. Do not treat this as Hyperdrive or production hosting acceptance.

The public article and correction implementation in PR #52:
- Enforces both Payload publication status and editorial workflow status.
- Uses Local API access control for public article queries.
- Exposes only whitelisted article fields and editor-approved correction notes/timestamps.
- Builds correction history from article version snapshots while excluding internal correction reasons and audit internals.
- Publishes article canonical metadata, NewsArticle structured data and sitemap entries.

### Live staging status and safe operation

- Vercel staging is still protected by Vercel deployment authentication in this execution environment. Administrator login, authenticated role matrix, and deployed REST/Local API acceptance have not been performed.
- The private Neon evidence bucket remains empty; no application upload/read-back/download/checksum/audit round-trip has been accepted.
- Resend sender and Preview configuration exist, but no real Payload password-reset message has been accepted and received by a controlled mailbox.
- The Cloudflare scheduler Worker exists, but its Cron Trigger is disabled. Keep it disabled until the staging endpoint is reachable, the shared bearer secret is verified, and a manual invocation proves due-only publication.
- No production migration, production deployment, DNS cutover, paid-plan upgrade or production administrator bootstrap has been performed.
- Vercel Hobby is not a commercial production host. Cloudflare Worker database connectivity/performance remains unaccepted. Do not enable a paid host or plan without an explicit billing decision.

**Current operational verdict:** CI/CD is green; public reader changes are CI-accepted but still in draft PR #52. Live staging and production-readiness acceptance remain open.


## Authoritative reconciliation after PR #52 merge — 2026-11-16

This section supersedes the older "PR #52 is a draft" and "public article presentation not implemented" statements above. PR #52 is merged as `c71e6b7d1bffcf677b73454f959b99a593c269f0`. Its reader-facing article pages, published division discovery, reader-visible correction projection/history, canonical article metadata, NewsArticle structured data and article sitemap entries are now part of `main`.

### Latest deployment state

- READY Preview deployment: `dpl_26VkrhKLuH93iMBxpEEczkQZimVk`.
- Source branch: `fix/cms-final-reconciliation`.
- Source commit: `c71e6b7d1bffcf677b73454f959b99a593c269f0`.
- Generated deployment URL: `https://hezqen-2fdm8ap5h-lloydcoders-projects.vercel.app`.
- Target: Preview (`target=null`), not Production.
- The Vercel project-domain metadata still records `feat/mobile-navigation-responsive-system` as the staging domain's Git-branch association. A subsequent explicit Vercel alias assignment maps `staging.hezqen.tinlance.com` to this latest Preview deployment; alias lookup confirms the deployment ID. A live HTTP smoke test is still outstanding.
- Production deployment inventory's newest READY deployment points to older commit `1ab4076cbf76bd505f53ffd319711bf68d2e7b46`.
- Vercel project metadata reports `live=false`, Hobby plan, Node 24.x, and SSO protection enabled for deployments except custom domains.
- The custom domains are verified as attached to the project. That does not establish that the latest code is serving those hostnames.

### Post-merge CI evidence limitation

PR #52 head workflows passed before merge: HEZQEN CI [43778690707](https://github.com/LloydCoder/hezqen/actions/runs/43778690707) and Cloudflare compatibility [43778690641](https://github.com/LloydCoder/hezqen/actions/runs/43778690641). The GitHub connector's commit-workflow lookup filters to pull-request-triggered runs, so its empty result for merge commit `c71e6b7d1bffcf677b73454f959b99a593c269f0` does not establish whether push-triggered main workflows ran. Do not mark post-merge CI as verified until the push runs are inspected directly.

### Remaining operational release gates

1. Verify HEZQEN CI and Cloudflare compatibility workflows on the exact current `main` merge commit.
2. Route the staging hostname to a current deployment using a supported Vercel domain-management operation, or establish a separate staging hostname; preserve production domain routing.
3. Complete actual staging admin login, authenticated role matrix and REST/Local API acceptance.
4. Verify PostgreSQL transaction rollback when audit insertion fails.
5. Complete private evidence upload/read-back/download/checksum/audit round-trip.
6. Complete real Resend password-reset delivery and controlled mailbox receipt.
7. Complete scheduler endpoint authentication and due-only publication tests; keep Cron disabled until accepted.
8. Select a commercially permitted and cost-approved production host. Vercel Hobby is not suitable for the commercial publication; Cloudflare Workers/vinext remains unaccepted for full Payload CMS/database runtime.
9. Complete production runtime/performance, security, accessibility, legal/trademark, backup/restore, monitoring, incident response and rollback acceptance.
10. Only after all preceding gates and explicit release approval: migrate the production database, bootstrap the production administrator, deploy the production target, validate TLS/domain/routing and publish approved articles.

**Production boundary:** No production migration, production deployment, production DNS cutover, paid-plan upgrade, production admin bootstrap or scheduler activation was performed by this reconciliation.
