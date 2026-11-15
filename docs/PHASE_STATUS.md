# HEZQEN Implementation Phase Status

**Last reconciled:** 2026-11-15 (HEZQEN/HIES operational and security changes merged; both CI systems migrated to Node 24 actions)  
**Canonical launch target:** `https://hezqen.tinlance.com`  
**Release state:** NOT READY FOR PUBLIC PRODUCTION

This register is evidence-based. A phase is not complete because documentation or source files exist. A green CI run proves only the checks that workflow actually executes; it does not prove live service operation, production security, editorial readiness, legal clearance or business readiness.

## Six-phase execution sequence

The detailed phase register below maps to the agreed launch sequence:

1. **Final product audit and foundation** — detailed phases 1, 2, 6, 7, 8 and 12; review the publication, Labs and infrastructure products before release.
2. **Production infrastructure** — detailed phases 0, 3 and 13; isolate hosting, databases, storage, secrets, backups, monitoring and rollback.
3. **Editorial operations** — detailed phases 4, 5, 6 and 7; operational CMS, human approval, research provenance, corrections and publication controls.
4. **Commercial products** — detailed phases 8 and 10 plus the separate HIES product repository; product documentation, release artifacts, licensing, pricing, support and entitlements.
5. **Audience acquisition** — detailed phases 7, 9 and 14; search discovery, newsletter, distribution, partnerships and measured conversion.
6. **Global launch** — a final cross-phase release gate; production deployment, domain/TLS verification, launch campaign, operational coverage and rollback readiness.

The six phases are sequential macro-gates. A later macro-phase cannot be called complete while any prerequisite detailed phase remains blocked.

## Phase register

| Phase | Scope | Status | Verified evidence | Remaining acceptance gates |
|---|---|---|---|---|
| 0 | Infrastructure discovery and isolation | PARTIAL | Neon project `hezqen-core` (`old-bird-82399990`) is Free v3 in AWS eu-central-1. Read-only inventory confirms `main`, `staging` and `production` branches are ready but unprotected; each `hezqen.public` schema is empty, with zero application tables. No snapshots or automatic schedules exist; history retention is 6 hours. Vercel metadata confirms separate Preview and Production `DATABASE_URL` and `PAYLOAD_SECRET` entries, canonical `NEXT_PUBLIC_SITE_URL` in both environments, and `HEZQEN_ALLOWED_ORIGINS` scoped to Preview/Production. Secret values were not decrypted; the Preview variable comment says staging and Production says pooled Postgres, but the actual endpoint-to-Neon-branch mapping remains unverified. Vercel project `hezqen` is Hobby, Node 24.x, `live=false`; the latest READY deployments are Preview (`target=null`), SSO protection is enabled for non-custom domains, and only `hezqen.vercel.app` is returned as a verified project domain. Cloudflare `tinlance.com` is active; no HEZQEN DNS record or Worker script exists; R2 is not enabled. | Complete isolated Vercel staging acceptance; verify environment-to-branch mapping without exposing credentials; dedicated object storage design/provisioning; production backup destination/retention and RPO/RTO; production-like restore into a fresh database and controlled cutover; monitoring/alerting; email sender; enforce migration PR review and explicit approval while Neon branch protection is unavailable; no cross-product resource reuse. |
| 1 | Application foundation | CI GREEN; PRODUCT PARTIAL | Main commit 3888d2ccb9d77c1398c39a53fd5f969f472025b1 passed HEZQEN CI and Cloudflare compatibility (including vinext check, Worker build, ephemeral PostgreSQL migration and public/CMS route smoke). The documentation reconciliation commit `bcba19ab261b6cf122faedfe42150ee776f852fa` also passed both workflows. PR #35 head preview `c56f59b16ae20f2625346c91de6239fc17b3f8da` reached READY under Node 24.x; it remains SSO-protected and has not received external browser QA. | Browser-based QA on real devices; accepted production runtime; error/latency telemetry; deployment and rollback exercise. |
| 2 | Brand and design system | PARTIAL | Supplied horizontal color/reversed SVGs and favicon SVG are integrated unchanged; brand tokens and usage rules are documented in `docs/BRAND_SYSTEM.md`. | Complete app-icon/social/OG asset integration; locally packaged Inter fonts; reusable component states; responsive and WCAG 2.2 AA verification; visual regression evidence. |
| 3 | Database and content architecture | MIGRATION VERIFIED; SHARED DATABASES NOT MIGRATED | Initial Payload migration is checked in under `src/migrations/`. The migration-verification workflow has applied the migration to ephemeral PostgreSQL and checked migration status. PR #42 also adds an ephemeral PostgreSQL backup/restore drill that validates schema-table counts, migration counts and a sentinel data row. Read-only inspection confirmed zero application tables on all three Neon branches (`main`, `staging`, `production`); no shared branch was migrated. Vercel Preview and Production `DATABASE_URL` secrets exist, but their values were not decrypted and branch-to-environment mapping is unverified. | Review schema/constraints/indexes against the data model; verify Preview maps to staging and Production maps to production without exposing secrets; obtain explicit release approval; create backup/restore point; apply to staging only; verify schema and restore; production migration remains a separate approved release operation. |
| 4 | CMS and editorial workflow | PARTIAL | Payload CMS 3.93.0, PostgreSQL adapter, admin/API integration, role-scoped collections, draft versions and bootstrap command exist. Exact-origin resolver tests cover canonical origins, Vercel Preview host handling, production allowlist minimization, malformed host rejection and the CI-only local Worker exception. | Persistent server-side workflow commands; transactionally coupled audit writes; direct REST/Local API bypass tests; role matrix tests; staging login/admin acceptance; first admin bootstrap under controlled procedure. |
| 5 | Evidence and research | PARTIAL | Source/evidence/claim domain validation and SSRF-aware HTTPS acquisition logic exist, including redirect revalidation, content limits and SHA-256 calculation. | Private object storage; durable evidence capture/retrieval; immutable/versioned retention; network egress enforcement; claim-to-evidence UI and transactional audit; independent fact-check operations. |
| 6 | Public publication website | PARTIAL | Homepage, About, Editorial Standards and four division routes exist. | CMS-backed article pages, author/editor profiles, investigations/research pages, correction notices, disclosure surfaces, pagination and verified empty/error states. |
| 7 | Search, SEO and structured discovery | PARTIAL | Canonical metadata, robots.txt, sitemap.xml, llms.txt and llms-full.txt exist. Sitemap now includes all sixteen Labs routes plus the Infrastructure catalog route. Default canonical host is `hezqen.tinlance.com`. | Structured data and validation; published-content sitemap integration; internal search; indexation/privacy checks; Search Console and live crawl QA after launch. |
| 8 | HEZQEN Labs and Infrastructure products | CALCULATORS IMPLEMENTED; KITS ENGINEERING PREVIEW | Sixteen deterministic calculators exist in this repository. PR #32 added the public `/infrastructure` catalog, navigation and homepage discovery for five reusable engineering-preview kits maintained in the HIES monorepo `LloydCoder/hezqen-infrastructure-standard`; its current main commit is `bcb71131fb63b0eedb4311e83d3d87a82ef5104c`. Sitemap and regression tests cover all sixteen Labs routes and the Infrastructure catalog. | Independent calculator formula review; browser/accessibility QA; physical GPU validation; PII performance validation; transitive SBOM and signed provenance; model/third-party license review; commercial documentation, support and release artifacts. |
| 9 | Newsletter and reader accounts | NOT STARTED | No accepted reader-account or newsletter workflow is evidenced. | Consent, double opt-in, preferences, unsubscribe, data export/deletion, secure authentication and deliverability controls. |
| 10 | HEZQEN Intelligence | NOT STARTED | No production premium research, billing or entitlement system is evidenced. | Product definition, secure billing integration, server-side entitlements, pricing/legal terms, support and refund operations. |
| 11 | Integrations | NOT STARTED | No production Tinlyt, Searqon or TAS integration is evidenced. | Scoped credentials, explicit authorization, auditability, rate limits, failure isolation and human approval boundaries. |
| 12 | Security, privacy, accessibility and performance | PARTIAL | Baseline security headers, dependency audit, access policies, SSRF-aware acquisition, editorial authority tests and OWASP Top 10:2025 / ASVS 5.0 threat-model documentation exist. | CSP strategy; complete ASVS control evidence; authorization and abuse testing; privacy/retention review; WCAG 2.2 AA; Core Web Vitals; independent security review and remediation. |
| 13 | Production operations | PARTIAL | PR #42 merged as `6ea295b1fb9a073c55d9564d0023b26e97526069`; it adds non-sensitive liveness/readiness endpoints, guarded PostgreSQL backup/restore, an ephemeral restore drill with sentinel-row validation, and a dormant uptime workflow. PR-head HEZQEN CI, Payload migration verification and Cloudflare public-route smoke all passed. Fresh Vercel inventory shows project `hezqen` still `live=false`, Hobby plan, latest deployments READY but Preview-targeted, SSO enabled for non-custom domains, and only `hezqen.vercel.app` verified. Preview/Production environment variables exist, but database branch mapping remains unverified because secret values were intentionally not decrypted. Neon branches remain unprotected and empty; Cloudflare has no HEZQEN DNS record and R2 is not enabled. No production deployment, shared migration, or DNS cutover has been made. | Host acceptance; verify environment-to-branch mapping; approved encrypted backup destination, retention, RPO/RTO and production restore/cutover; configure canonical uptime URL after launch approval; monitoring/alerting; incident response; rollback; domain/TLS verification; launch checklist. |
| 14 | Growth and continuous improvement | NOT STARTED | No production acquisition, newsletter growth or revenue measurement loop is evidenced. | Analytics with consent/privacy controls; editorial distribution; newsletter acquisition; attribution; conversion measurement; partnership/sponsorship governance. |

## CI and deployment evidence

PR #35 head commit `c56f59b16ae20f2625346c91de6239fc17b3f8da` passed all required checks before merge:
- [HEZQEN CI](https://github.com/LloydCoder/hezqen/actions/runs/43739429853)
- [Cloudflare compatibility, Worker build and public/CMS route smoke](https://github.com/LloydCoder/hezqen/actions/runs/43739429950)
- [Ephemeral PostgreSQL migration verification](https://github.com/LloydCoder/hezqen/actions/runs/43739429891)

PR #35 merged as `3888d2ccb9d77c1398c39a53fd5f969f472025b1`. Post-merge main workflows also passed on that exact commit:
- [HEZQEN CI](https://github.com/LloydCoder/hezqen/actions/runs/43739705611)
- [HEZQEN Cloudflare Compatibility](https://github.com/LloydCoder/hezqen/actions/runs/43739705626)

The Vercel Preview from PR #35 head reached READY at [hezqen-ix8xrxv5s-lloydcoders-projects.vercel.app](https://hezqen-ix8xrxv5s-lloydcoders-projects.vercel.app). The project has Preview SSO protection enabled; external unauthenticated browser QA is therefore not complete. This is a preview deployment only, not a production deployment or canonical custom-domain attachment.

The package engine is pinned to Node `24.x`, matching the Vercel project setting and CI runtime. The preview build completed successfully with this pin; the prior Node 26 selection mismatch is removed.

Vercel remains an approved hosting option; `vercel.json` continues to disable automatic Git-triggered deployments while controlled previews are used. Cloudflare remains complementary. The isolated Worker build/smoke workflow is compatibility evidence, not a decision to replace Vercel.

## Shared database safety

The Neon staging and production branches were inspected read-only. Both returned database `hezqen`, role `hezqen_app`, and zero tables in the `public` schema at inspection time. No migration was applied to either shared branch. The checked-in migration was validated only against ephemeral CI PostgreSQL.

The Neon connector explicitly requires user approval before shared-database migrations. Do not apply the migration to staging or production through an autonomous workflow.

## Release decision

HEZQEN is an engineering preview, not a production-ready publication service. Do not attach `hezqen.tinlance.com`, publish a production deployment, accept paid hosting upgrades, or bootstrap a production administrator until the relevant gates have passed and the required approvals have been obtained.


## Cross-repository HEZQEN Infrastructure products

The infrastructure product line is implemented in [LloydCoder/hezqen-infrastructure-standard](https://github.com/LloydCoder/hezqen-infrastructure-standard), not inside the publication application's runtime. The repository uses a shared HIES standard with four product directories and an aggregate offline bundle:

1. **IK-01 — Local AI Deployment Kit**
2. **IK-02 — PII Protection Middleware Kit**
3. **IK-03 — Multi-GPU Optimization Kit**
4. **IK-04 — Air-Gapped RAG Kit**
5. **IK-05 — Complete Infrastructure Lab Bundle**

At current main commit `e2aacfd4117f41c77cdc349961422d6358fd8c11`, PR #11 added a pinned Python dependency audit (`pip-audit==2.10.1`), and PR #12 remediated CVE-2025-47273 by upgrading the two product build backends from `setuptools==75.8.0` to `84.2.1`. The monorepo validator now requires product build-system pins to match the audited requirements inventory.

The final PR #12 head `c1db7b3c3b0b3cc2faea7ca47b0b28add37dcff7` passed:
- [HIES CI](https://github.com/LloydCoder/hezqen-infrastructure-standard/actions/runs/43743740739)
- [HIES Security Hygiene / pip-audit](https://github.com/LloydCoder/hezqen-infrastructure-standard/actions/runs/43743740650)
- [IK-01 CPU Runtime](https://github.com/LloydCoder/hezqen-infrastructure-standard/actions/runs/43743740723)
- [IK-02 PII Runtime](https://github.com/LloydCoder/hezqen-infrastructure-standard/actions/runs/43743740691)
- [IK-03 Multi-GPU Planner](https://github.com/LloydCoder/hezqen-infrastructure-standard/actions/runs/43743740794)
- [IK-04 Disconnected RAG Runtime](https://github.com/LloydCoder/hezqen-infrastructure-standard/actions/runs/43743742560)
- [IK-05 Offline Bundle Acceptance](https://github.com/LloydCoder/hezqen-infrastructure-standard/actions/runs/43743740795)

The previously recorded IK-04 acceptance was unchanged at the time of PR #12; a fresh IK-04 run passed on the later Node 24 action-migration PR, as recorded below. IK-01 now also validates that Open WebUI static assets are served from a bounded writable tmpfs while the container root remains read-only, and that the stack completes CPU inference, embeddings, backup/restore and egress-isolation checks. These are CI/runtime acceptance checks, not physical hardware certification or commercial release approval.


### HIES security-audit scope and remaining limits

The new Python dependency gate covers the pinned validation and build-backend dependencies represented in `requirements-dev.txt`. The validator prevents product build-system requirements from drifting outside that audited set. It does not yet scan container operating-system packages, Ollama/Open WebUI base-image CVEs, downloaded model artifacts, or provide signed build provenance. HIES products remain engineering previews. IK-01's CI validates CPU operation only; physical NVIDIA GPU acceptance remains open. IK-02 still requires representative precision/recall and throughput evaluation. IK-03 remains a CPU estimator without physical multi-GPU benchmark evidence. IK-04 still needs its stated production hardening and security acceptance. IK-05 still needs a complete transitive SBOM and verifiable signed provenance.

The kits remain engineering previews. Outstanding commercial-release gates include physical GPU testing on supported hardware, PII precision/recall and throughput validation, a transitive SBOM, signed build provenance, model and third-party license review, versioned release artifacts, customer documentation, support policy and pricing. Do not advertise the kits as fully production-certified or commercially released until those gates are complete.


## Infrastructure product catalog reconciliation

The public /infrastructure surface lists five HEZQEN Infrastructure Standard kits as **engineering previews** only. It is not a commercial release or production certification. Physical GPU acceptance, representative PII accuracy evaluation, complete dependency/SBOM and provenance review, independent security assessment, installation/rollback runbooks, support terms and versioned release artifacts remain separate acceptance gates. Product source: https://github.com/LloydCoder/hezqen-infrastructure-standard.


## Mainline integration audit — 2026-11-15

- PR #18 (pinned GitHub Actions checkout v4.4.0) merged as `87ef2c05777f0ec5f948c3b518c7c41ff5185c11`.
- PR #32 merged as `5877dac0424fe5d25a4c36fd94140e4406d693ae`. It integrates the Infrastructure engineering-preview catalog, site navigation/homepage discovery, all sixteen Labs routes in the sitemap, AI-readable catalog references, and regression coverage.
- PR #20 was closed as superseded: its older calculator schema conflicted with the current implementation; the fourteen additional calculators plus the two original calculators are already in mainline.
- PR #29 was closed as superseded by PR #32; its Infrastructure catalog changes were incorporated through the consolidated integration.
- No open pull requests or open GitHub issues remained at the post-merge inventory check.
- No production deployment, Vercel project-domain attachment, DNS change, shared Neon migration, or production administrator bootstrap was performed. Vercel remains an approved hosting option; Cloudflare remains complementary and its Worker build is an isolated compatibility/acceptance path, not an architectural decision to replace Vercel.

The PR-head validation evidence for commit `76d8fab78179dee80cef4aa657d4830be8b9bfb5` was green: [HEZQEN CI](https://github.com/LloydCoder/hezqen/actions/runs/43737731792), [Cloudflare compatibility and Worker smoke](https://github.com/LloydCoder/hezqen/actions/runs/43737731797), and [ephemeral PostgreSQL migration verification](https://github.com/LloydCoder/hezqen/actions/runs/43737731861). Post-merge main-branch workflows must also pass on the final main commit before this integration is declared fully verified.


## Vercel Payload origin hardening

PR #35 adds a pure, regression-tested origin resolver. It uses the exact `VERCEL_URL` hostname only when `VERCEL_ENV=preview`, keeps the canonical `NEXT_PUBLIC_SITE_URL` in Production, rejects insecure/non-local HTTP origins, rejects malformed deployment hostnames and does not trust forwarded host headers. The Cloudflare Worker CI harness may opt into its local HTTP origin only when both `CI=true` and `HEZQEN_LOCAL_RUNTIME_TEST=true` are present; neither flag is configured in Vercel or Production. The existing Vercel project has `HEZQEN_ALLOWED_ORIGINS=https://hezqen.tinlance.com` for Preview and Production, with no wildcard.

## Final PR and issue inventory — 2026-11-15

- PR #35 merged as `3888d2ccb9d77c1398c39a53fd5f969f472025b1` after CI, migration and Worker acceptance passed.
- PR #37 was closed as a duplicate/superseded implementation; its production-wide Vercel origin expansion was not accepted. PR #34 was also closed as superseded.
- PR #18 and PR #32 remain merged; stale PRs #20 and #29 were closed after their relevant changes were reconciled into main.
- The post-merge repository inventory reported zero open pull requests and zero open GitHub issues.
- No production deployment, DNS change, shared Neon migration, R2 enablement, production administrator bootstrap or paid-plan change was performed.
## Neon and hosting controls audit — 2026-11-15

- Neon read-only inventory confirmed project `hezqen-core` (`old-bird-82399990`), Free v3, AWS eu-central-1, PostgreSQL 18, 0.25 CU minimum/maximum, and a 10-branch plan limit. The three branches `main`, `staging` and `production` are all unprotected. The branch-protection attempt reported the plan's protected-branch limit; no upgrade or branch mutation was made.
- Read-only table inspection returned no application tables on any of the three branches. Snapshot inventory returned no snapshots; automatic snapshot schedules are empty on all three branches. Project history retention is 21,600 seconds (6 hours). Backup/restore acceptance is therefore still open.
- Vercel project `hezqen` is on Hobby, `live=false`, Node 24.x, and has only `hezqen.vercel.app` attached/verified. The Hobby deployment allowance is 100 deployments per 24 hours; `vercel.json` disables automatic Git deployments to conserve the allowance during iterative implementation. This is a temporary limit control, not removal of Vercel from the hosting plan.
- A controlled Preview from PR #35 head is READY at `https://hezqen-ix8xrxv5s-lloydcoders-projects.vercel.app`; SSO protection remains enabled. The canonical custom domain is not attached.
- Cloudflare read-only inspection confirmed the `tinlance.com` zone is active, no `hezqen.tinlance.com` record or Worker script exists, and R2 must be enabled from the dashboard before any bucket can be created. No DNS, SSL, Worker, R2, tunnel or paid-plan changes were made.

## Operational readiness integration — 2026-11-15

PR #42 (https://github.com/LloydCoder/hezqen/pull/42) merged as `6ea295b1fb9a073c55d9564d0023b26e97526069`. Its final PR head `76339fc955f240b5fcac1decfd94ebf83230db30` passed:
- [HEZQEN CI](https://github.com/LloydCoder/hezqen/actions/runs/43742710534)
- [Payload migration and backup/restore verification](https://github.com/LloydCoder/hezqen/actions/runs/43742710532)
- [Cloudflare Worker public-route compatibility](https://github.com/LloydCoder/hezqen/actions/runs/43742710533)

The restore contract now refuses every non-empty target, requires explicit environment confirmation and separate production approval, and restores only into a newly provisioned empty database. CI validates the restored schema/table counts, migration counts and a sentinel data row. This is tooling acceptance only: no shared Neon branch has been migrated, no production backup destination exists, and no production restore/cutover has been performed. The scheduled uptime workflow remains dormant until the canonical `HEZQEN_HEALTH_URL` repository variable is explicitly configured.

The Cloudflare Worker compatibility workflow is intentionally scoped to public routes and health endpoints. The earlier isolated runtime evaluation returned HTTP 500 from Payload `GET /api/articles`; CMS REST/admin compatibility remains unresolved. Workers/vinext remains a beta alternative, not an approved production host. Vercel remains the approved primary host; no DNS, production deployment, paid plan, R2 or shared database changes were made.

## Read-only hosting and database inventory — 2026-11-15

- Vercel project `hezqen` is still Node 24.x on Hobby with `live=false`. The latest deployment records are READY Preview deployments; none is a production-target deployment. SSO protection is enabled for non-custom domains. The project-domain inventory returned `hezqen.vercel.app` as the only verified project domain; the canonical `hezqen.tinlance.com` custom domain is not attached.
- Vercel environment metadata confirms Preview and Production entries for `DATABASE_URL` and `PAYLOAD_SECRET`, plus canonical `NEXT_PUBLIC_SITE_URL` and `HEZQEN_ALLOWED_ORIGINS`. Sensitive values were not decrypted. The environment-variable comments express intended staging/production targets, but they do not prove the underlying Neon branch IDs. Do not claim the mapping verified until a non-secret endpoint/branch check proves it.
- Neon project `hezqen-core` has ready `main`, `staging` and `production` branches; all remain unprotected on the current plan. The read-only branch descriptions show only the `public` schema and no application tables. No shared migration was applied. History retention remains six hours, with no snapshots or automatic schedules observed.
- No DNS, custom-domain attachment, shared database migration, R2 enablement, paid-plan change, production deployment or production admin bootstrap was performed.

## CI action-runtime modernization — 2026-11-15

The Node 20 action-runtime deprecation has been removed from both repositories' active workflows. HEZQEN PR #46 merged as `e8a8e4be2d7ee4d976a417db5d97fd87bac116c5`; its final head `f590fe54b0cd50612e973552d45470e5ddfdf808` passed [HEZQEN CI](https://github.com/LloydCoder/hezqen/actions/runs/43744409790) and [Cloudflare compatibility](https://github.com/LloydCoder/hezqen/actions/runs/43744409764). The run logs contained no Node 20 action-runtime deprecation warnings.

HIES PR #13 merged as `e2aacfd4117f41c77cdc349961422d6358fd8c11`; its final head `1da78e5b2f1309b5b01d0cd4f326452e65d023af` passed [HIES CI](https://github.com/LloydCoder/hezqen-infrastructure-standard/actions/runs/43744342470), [HIES Security Hygiene](https://github.com/LloydCoder/hezqen-infrastructure-standard/actions/runs/43744342534), [IK-01](https://github.com/LloydCoder/hezqen-infrastructure-standard/actions/runs/43744342440), [IK-02](https://github.com/LloydCoder/hezqen-infrastructure-standard/actions/runs/43744342473), [IK-03](https://github.com/LloydCoder/hezqen-infrastructure-standard/actions/runs/43744342501), [IK-04](https://github.com/LloydCoder/hezqen-infrastructure-standard/actions/runs/43744342560) and [IK-05](https://github.com/LloydCoder/hezqen-infrastructure-standard/actions/runs/43744342527). The updated workflows use immutable full-SHA pins for checkout v7.0.1, setup-node v7.1.0, setup-python v7.1.0 and upload-artifact v7.0.2. HIES CI and IK-01 logs also contained no Node 20 runtime deprecation warnings.

These changes modernize CI execution runtimes; they do not change the Node.js 24 application runtime or establish production launch readiness. The Cloudflare Worker CMS API compatibility limitation and the infrastructure/production acceptance gates above remain open.
