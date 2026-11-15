# HEZQEN Implementation Phase Status

**Last reconciled:** 2026-11-15 (post-PR #35 origin hardening; documentation PR #38 validation pending)  
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
| 0 | Infrastructure discovery and isolation | PARTIAL | Dedicated HEZQEN Neon project `hezqen-core` (`old-bird-82399990`) is on the Free v3 plan in AWS eu-central-1 with `main`, `staging` and `production` branches. All three branches were observed unprotected; an attempt to protect them was rejected because the current plan has reached its protected-branch limit (no upgrade was made). Vercel project `hezqen` is linked to this repository, Node 24.x, and remains the approved Node.js hosting target; the latest main deployment is READY, but the project is not live and only `hezqen.vercel.app` is attached/verified. Cloudflare `tinlance.com` zone is active on the Free Website plan; no `hezqen.tinlance.com` DNS record or Worker script exists; R2 is not enabled (the API explicitly requires dashboard enablement). | Complete isolated Vercel staging acceptance; verify environment-to-Neon-branch mapping; dedicated object storage design/provisioning; backup/restore drill; monitoring/alerting; email sender; no cross-product resource reuse. No paid resource or DNS change without explicit release approval. |
| 1 | Application foundation | CI GREEN; PRODUCT PARTIAL | Mainline integration commit `5877dac0424fe5d25a4c36fd94140e4406d693ae` incorporates PR #32. The PR-head HEZQEN CI, Cloudflare compatibility (including Worker build and route/CMS smoke), and ephemeral PostgreSQL migration verification all passed before merge. The post-merge main-branch workflows are the final release evidence for the resulting main SHA. | Browser-based QA on real devices; accepted production runtime; error/latency telemetry; deployment and rollback exercise. |
| 2 | Brand and design system | PARTIAL | Supplied horizontal color/reversed SVGs and favicon SVG are integrated unchanged; brand tokens and usage rules are documented in `docs/BRAND_SYSTEM.md`. | Complete app-icon/social/OG asset integration; locally packaged Inter fonts; reusable component states; responsive and WCAG 2.2 AA verification; visual regression evidence. |
| 3 | Database and content architecture | MIGRATION VERIFIED; SHARED DATABASES NOT MIGRATED | Initial Payload migration and snapshot are checked in under `src/migrations/`. The migration-verification workflow has applied the migration to ephemeral PostgreSQL and checked migration status. Read-only inspection found zero public application tables on the shared HEZQEN staging and production branches. | Review schema/constraints/indexes against the data model; obtain explicit release approval; back up staging; apply to staging only; verify schema and restore; production migration remains a separate approved release operation. |
| 4 | CMS and editorial workflow | PARTIAL | Payload CMS 3.93.0, PostgreSQL adapter, admin/API integration, role-scoped collections, draft versions and bootstrap command exist. Pure workflow state machine has regression tests. | Persistent server-side workflow commands; transactionally coupled audit writes; direct REST/Local API bypass tests; role matrix tests; staging login/admin acceptance; first admin bootstrap under controlled procedure. |
| 5 | Evidence and research | PARTIAL | Source/evidence/claim domain validation and SSRF-aware HTTPS acquisition logic exist, including redirect revalidation, content limits and SHA-256 calculation. | Private object storage; durable evidence capture/retrieval; immutable/versioned retention; network egress enforcement; claim-to-evidence UI and transactional audit; independent fact-check operations. |
| 6 | Public publication website | PARTIAL | Homepage, About, Editorial Standards and four division routes exist. | CMS-backed article pages, author/editor profiles, investigations/research pages, correction notices, disclosure surfaces, pagination and verified empty/error states. |
| 7 | Search, SEO and structured discovery | PARTIAL | Canonical metadata, robots.txt, sitemap.xml, llms.txt and llms-full.txt exist. Sitemap now includes all sixteen Labs routes plus the Infrastructure catalog route. Default canonical host is `hezqen.tinlance.com`. | Structured data and validation; published-content sitemap integration; internal search; indexation/privacy checks; Search Console and live crawl QA after launch. |
| 8 | HEZQEN Labs and Infrastructure products | CALCULATORS IMPLEMENTED; KITS ENGINEERING PREVIEW | Sixteen deterministic calculators exist in this repository. PR #32 added the public `/infrastructure` catalog, navigation and homepage discovery for five reusable engineering-preview kits maintained in the HIES monorepo `LloydCoder/hezqen-infrastructure-standard`; its previously audited main commit is `639afb9867c69d025e3d637195cf4436e2711e31`. Sitemap and regression tests cover all sixteen Labs routes and the Infrastructure catalog. | Independent calculator formula review; browser/accessibility QA; physical GPU validation; PII performance validation; transitive SBOM and signed provenance; model/third-party license review; commercial documentation, support and release artifacts. |
| 9 | Newsletter and reader accounts | NOT STARTED | No accepted reader-account or newsletter workflow is evidenced. | Consent, double opt-in, preferences, unsubscribe, data export/deletion, secure authentication and deliverability controls. |
| 10 | HEZQEN Intelligence | NOT STARTED | No production premium research, billing or entitlement system is evidenced. | Product definition, secure billing integration, server-side entitlements, pricing/legal terms, support and refund operations. |
| 11 | Integrations | NOT STARTED | No production Tinlyt, Searqon or TAS integration is evidenced. | Scoped credentials, explicit authorization, auditability, rate limits, failure isolation and human approval boundaries. |
| 12 | Security, privacy, accessibility and performance | PARTIAL | Baseline security headers, dependency audit, access policies, SSRF-aware acquisition, editorial authority tests and OWASP Top 10:2025 / ASVS 5.0 threat-model documentation exist. | CSP strategy; complete ASVS control evidence; authorization and abuse testing; privacy/retention review; WCAG 2.2 AA; Core Web Vitals; independent security review and remediation. |
| 13 | Production operations | PARTIAL | Dedicated HEZQEN infrastructure inventory and migration/CI procedures are documented. No production deployment or DNS cutover has been made. | Host acceptance; secrets/environment validation; backup and restore drill; uptime/error/latency monitoring; incident response; rollback; domain/TLS verification; launch checklist. |
| 14 | Growth and continuous improvement | NOT STARTED | No production acquisition, newsletter growth or revenue measurement loop is evidenced. | Analytics with consent/privacy controls; editorial distribution; newsletter acquisition; attribution; conversion measurement; partnership/sponsorship governance. |

## CI evidence

Main commit `06d4f5ee889a02d0305ec0f6da9a2377d49d2d56` has successful runs for:

- [HEZQEN CI](https://github.com/LloydCoder/hezqen/actions/runs/43733175978)
- [HEZQEN Cloudflare Compatibility](https://github.com/LloydCoder/hezqen/actions/runs/43733175898)

The Payload migration verification workflow has also passed on the Cloudflare evaluation pull request using an ephemeral PostgreSQL service; it did not modify shared Neon branches. The Cloudflare Worker build/smoke-test evaluation is tracked separately and must not be considered accepted until its full route and CMS smoke suite is green and reviewed.

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

At main commit `639afb9867c69d025e3d637195cf4436e2711e31`, the following checks are green:

- [HIES CI](https://github.com/LloydCoder/hezqen-infrastructure-standard/actions/runs/43729698285)
- [HIES Security Hygiene](https://github.com/LloydCoder/hezqen-infrastructure-standard/actions/runs/43729698293)
- [IK-05 Offline Bundle Acceptance](https://github.com/LloydCoder/hezqen-infrastructure-standard/actions/runs/43729698296)

Product-specific runtime/acceptance workflows have also passed on the latest commits that touched each product: [IK-01 CPU Runtime](https://github.com/LloydCoder/hezqen-infrastructure-standard/actions/runs/43726371376), [IK-02 PII Runtime](https://github.com/LloydCoder/hezqen-infrastructure-standard/actions/runs/43724537149), [IK-03 Multi-GPU Planner](https://github.com/LloydCoder/hezqen-infrastructure-standard/actions/runs/43729614141), and [IK-04 Disconnected RAG Runtime](https://github.com/LloydCoder/hezqen-infrastructure-standard/actions/runs/43726371365). These are CI/runtime acceptance checks, not physical hardware certification or commercial release approval.

The kits remain engineering previews. Outstanding commercial-release gates include physical GPU testing on supported hardware, PII precision/recall and throughput validation, a transitive SBOM, signed build provenance, model and third-party license review, versioned release artifacts, customer documentation, support policy and pricing. Do not advertise the kits as fully production-certified or commercially released until those gates are complete.


## Infrastructure product catalog reconciliation

The public /infrastructure surface lists five HEZQEN Infrastructure Standard kits as **engineering previews** only. It is not a commercial release or production certification. Physical GPU acceptance, representative PII accuracy evaluation, complete dependency/SBOM and provenance review, independent security assessment, installation/rollback runbooks, support terms and versioned release artifacts remain separate acceptance gates. Product source: https://github.com/LloydCoder/hezqen-infrastructure-standard.


## Mainline integration audit — 2026-11-15

- PR #18 (pinned GitHub Actions checkout v4.4.0) merged as `87ef2c05777f0ec5f948c3b518c7c41ff5185c11`.
- PR #32 merged as `5877dac0424fe5d25a4c36fd94140e4406d693ae`. It integrates the Infrastructure engineering-preview catalog, site navigation/homepage discovery, all sixteen Labs routes in the sitemap, AI-readable catalog references, and regression coverage.
- PR #20 was closed as superseded: its older calculator schema conflicted with the current implementation; the fourteen additional calculators plus the two original calculators are already in mainline.
- PR #29 was closed as superseded by PR #32; its Infrastructure catalog changes were incorporated through the consolidated integration.
- That post-merge inventory was historical. In the 2026-11-15 Phase 2 remediation, PRs #35 and #36 were closed as superseded and consolidated PR #37 became the active remediation. The latest open-issue search found no non-PR issues.
- No production deployment, Vercel project-domain attachment, DNS change, shared Neon migration, or production administrator bootstrap was performed. Vercel remains an approved hosting option; Cloudflare remains complementary and its Worker build is an isolated compatibility/acceptance path, not an architectural decision to replace Vercel.

The PR-head validation evidence for commit `76d8fab78179dee80cef4aa657d4830be8b9bfb5` was green: [HEZQEN CI](https://github.com/LloydCoder/hezqen/actions/runs/43737731792), [Cloudflare compatibility and Worker smoke](https://github.com/LloydCoder/hezqen/actions/runs/43737731797), and [ephemeral PostgreSQL migration verification](https://github.com/LloydCoder/hezqen/actions/runs/43737731861). Post-merge HEZQEN CI on main commit `55f8e7125ccc22ede4ceafd02b609ef8ac7c802e` passed all steps, including frozen install, lint, formatting, tests, audit, production build, runtime smoke and typecheck: [HEZQEN CI](https://github.com/LloydCoder/hezqen/actions/runs/43738060423). Both Cloudflare compatibility jobs, including the local Worker build, ephemeral PostgreSQL migration and public/CMS route smoke, passed on parent main commit `5877dac0424fe5d25a4c36fd94140e4406d693ae`: [Cloudflare Compatibility](https://github.com/LloydCoder/hezqen/actions/runs/43737940403). This validates the optional Worker candidate, not a production cutover.


## Vercel and Cloudflare deployment evidence — 2026-11-15

- Vercel project `hezqen` is linked to `LloydCoder/hezqen` and remains an approved hosting target. The connected team is on the Hobby plan, whose published limit is 100 deployments per 24 hours. `vercel.json` currently disables Git-triggered deployments as a temporary rate-limit conservation measure; it does not remove Vercel from the architecture.
- A prior Vercel build failed before application compilation because `HEZQEN_ALLOWED_ORIGINS` was missing when Payload config was evaluated. The consolidated PR #37 adds strict origin resolution and regression tests, including a requirement that the canonical `NEXT_PUBLIC_SITE_URL` is present and explicitly allowlisted even for Preview. This follow-up was first verified red by two regression failures, then fixed; the final CI rerun is pending. A controlled Vercel Preview build remains required after merge and when the daily deployment allowance permits.
- Cloudflare read-only inventory confirms no HEZQEN DNS record or Worker script. R2 is not enabled. No Cloudflare or production DNS changes were made.


## Phase 2 forensic remediation — 2026-11-15

- Origin hardening merged in [PR #35](https://github.com/LloydCoder/hezqen/pull/35) as commit `3888d2ccb9d77c1398c39a53fd5f969f472025b1`, based on main commit `b517e7077e304a4c3e2faf30d0ab594ca1b064d8`. PR #37 was closed because PR #35 had already merged overlapping source changes; its remaining documentation updates were moved to PR #38.
- PR #36 was closed as superseded; PR #35 was merged. The docs-only reconciliation is in PR #38.
- The origin resolver now validates the canonical site origin independently of the Preview deployment origin. Production Preview cannot silently pass with only a `VERCEL_URL` origin while omitting `NEXT_PUBLIC_SITE_URL` or its explicit allowlist entry.
- Test-first evidence: the two new Preview canonical-origin regression tests failed against the previous implementation (96 passed, 2 failed). The resolver was then updated to require the canonical origin and to validate it against `HEZQEN_ALLOWED_ORIGINS`.
- The final PR #37 head passed HEZQEN CI (run `43739518375`), Payload migration verification on ephemeral PostgreSQL (run `43739518403`), and Cloudflare vinext compatibility plus local Worker build/route/CMS smoke (run `43739518388`). Those tests validate the origin-hardening implementation merged by PR #35. Post-merge main-branch CI on commit `3888d2ccb9d77c1398c39a53fd5f969f472025b1` remains required.
- No shared Neon branch was migrated, no branch protection was enabled (plan limit), no object storage was provisioned, no Cloudflare DNS or Worker resource was created, and no Vercel production domain was attached.
