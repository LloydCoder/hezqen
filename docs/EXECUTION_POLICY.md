# HEZQEN Execution Policy and Gate Baseline

**Reconciled:** 2026-11-17  
**Owner:** Tinlance  
**Canonical publication:** HEZQEN — Global Technology & Business Intelligence  
**Execution environment:** Isolated staging and test fixtures  
**Production release:** G1 deliberately held pending

## 1. Binding execution policy

This document records the adopted execution decision:

- G1 (production infrastructure and launch) remains deliberately pending.
- Execute G2–G12 sequentially in staging, local environments, isolated databases and test fixtures.
- Do not promote a deployment to the canonical production hostname.
- Do not modify production DNS, production database schema/data/roles, production credentials or production integrations.
- Do not enable scheduled publishing.
- Do not introduce paid infrastructure, subscriptions, provider upgrades or new AWS expenditure without explicit approval.
- Preserve Payload CMS, the dynamic sitemap, the existing public-content projection and the separation between publication code and Labs domain logic.
- AI may assist research and drafting, but a named human author, independent reviewer and authorized human editor remain accountable for publication.
- Keep G1 as the final production acceptance exercise after G2–G12 have passed their applicable staging and non-production acceptance criteria.

A staging pass is not a production pass. Criteria requiring real production traffic, production credentials, production domain, actual settlement or legal sign-off remain explicitly marked **G1-dependent** rather than being falsely accepted in staging.

## 2. Gate order and acceptance

| Gate | Workstream | Staging completion requirement |
|---|---|---|
| G1 | Production readiness | **HELD PENDING by decision.** Commercially permitted host, production DB/runtime role, production integrations, backup/restore, monitoring, rollback, deployment and canonical-domain smoke tests. |
| G2 | Editorial governance | Complete HEOS, public editorial policies, ownership/disclosure, source hierarchy, evidence standards, contributor/reviewer rules, correction process and human approval controls. |
| G3 | Eight launch articles | Eight original, sourced, evidence-backed drafts, with claim registers, documented assumptions, reproducibility where applicable, real author/reviewer/editor assignments and human approval. Publication to production remains G1-dependent. |
| G4 | VRAM Labs | Validate formulas and source provenance; improve supported architecture coverage; document single- and multi-GPU boundaries; add only tested GPU/interconnect compatibility; publish vectors, version history and limitations. |
| G5 | Conversion and newsletter | Architecture-review lead workflow, secure validation/rate limits, attribution and disclosure; newsletter consent, double opt-in, unsubscribe, suppression, deletion and delivery monitoring in test/staging. |
| G6 | API-versus-self-hosted break-even tool | Audit and enhance the existing `/labs/ai-cost` calculator; model API pricing, rental/owned GPU, utilisation, idle capacity, engineering/on-call, networking, redundancy and sensitivity. Do not duplicate an existing calculator. |
| G7 | SEO and discovery | Validate canonical metadata, redirects, sitemap, robots, RSS, structured data, internal linking, indexing boundaries and social metadata in staging. Live production indexing remains G1-dependent. |
| G8 | Privacy and measurement | First-party event contract, consent UI/CMP, granular consent, withdrawal, provider-level controls, minimisation, exclusion zones, deduplication and automated consent tests. Pixels require actual provider configuration and privacy review. |
| G9 | Monetization | Verify affiliate eligibility/terms; safe allowlisted redirects; disclosure; digital product catalog; payment adapter; signed/idempotent webhooks; paid-state verification; secure fulfillment, refunds and order controls. Real provider settlement and commercial eligibility may remain G1-dependent. |
| G10 | Distribution and growth | Editorial distribution calendar, channel playbooks, contributor recruitment process, community rules and measurement plan. Actual audience growth is measured after publication and is not a code-only acceptance claim. |
| G11 | Original research | Reproducible experiment plans, scripts/configurations, raw results, methodology, limitations and independent reproduction for published benchmark claims. Hardware-dependent experiments must be labelled pending until run on real hardware. |
| G12 | Ecosystem integrations | Scoped, audited integrations with Tinlyt, Searqon and TAS; public read-only MCP only; no private drafts/evidence/audit exposure; no external agent receives publication authority. |

Accessibility (WCAG 2.2 AA), security (OWASP Top 10:2025 / ASVS 5.0), performance, responsive QA, dependency hygiene, tests and CI are cross-cutting acceptance requirements for every applicable gate, not a substitute for any gate.

## 3. Repository baseline as of 2026-11-17

- Repository: `LloydCoder/hezqen`; default branch: `main`.
- Current main commit: `5b7280d519e9c76dca303e36631045a9a29c7c85`.
- PR #54, **feat: complete HEZQEN launch foundation**, is merged into main.
- On that exact commit, GitHub Actions reported:
  - HEZQEN CI: **success** (run 44080825318).
  - HEZQEN Cloudflare Compatibility: **success** (run 44080825413; both jobs succeeded).
  - Scheduled HEZQEN uptime workflow: **skipped**, not failed; scheduled uptime remains dormant by design.
- The CI quality job covers frozen dependency installation, lint, format, tests, dependency audit, production build, Payload migrations against ephemeral PostgreSQL, public-route HTTP smoke tests and TypeScript typecheck.
- Cloudflare compatibility checks include a vinext compatibility check and a Worker build/smoke test against an isolated CMS fixture. This is not proof of full commercial production suitability or production database acceptance.
- The repository contains sixteen Labs calculators in total, including the VRAM and API-versus-self-hosted cost tools. The API cost tool already exists and must be extended, not duplicated.
- Dynamic sitemap, robots.txt, HTML sitemap, RSS, llms.txt and llms-full.txt are present in the repository.
- About, Editorial Standards and Corrections surfaces exist. The public Editorial Standards page describes itself as a summary; the full internal standard remains in documentation.
- Eight article commissioning briefs exist. They are briefs, not completed or published articles.
- The VRAM calculator currently provides sourced presets, formula versioning, bounded share parameters, single-GPU capacity assessment and deterministic public test vectors. It does not establish full MLA/hybrid/sliding-window architecture handling or validated tensor-parallel/interconnect compatibility.
- The architecture-review CTA exists. A complete secure lead-management workflow and accepted newsletter double-opt-in lifecycle are not established.
- Production remains on an older deployment and is not the execution target for G2–G12.
- The Vercel Hobby plan is not approved for commercial production. No paid host has been selected or approved.
- Production Neon database initialization, least-privilege runtime role verification, production secrets and production CMS runtime acceptance remain G1 blockers.

## 4. Evidence and status vocabulary

Use these states independently:

- **Planned:** scope is defined.
- **Implemented:** code/content exists in the repository.
- **Tested:** the relevant automated or manual test passed.
- **Merged:** change is on the authoritative branch.
- **Deployed:** the intended non-production or production environment runs that exact change.
- **Accepted:** all applicable functional, security, privacy, editorial and operational criteria have inspectable evidence and an accountable reviewer.

Do not promote a gate to accepted based on documentation, a green build, a passing unit test, a preview deployment, or an unreviewed article draft alone.

## 5. Non-negotiable boundaries

- No production promotion, DNS cutover, production migration, production role mutation or production secret mutation while G1 is pending.
- No disabling deployment protection to bypass staging access controls.
- No unreviewed database permission changes or use of elevated migration credentials by the application runtime.
- No private drafts, source evidence or subscriber records on a hosting plan whose commercial and data-processing terms are unacceptable.
- No non-essential analytics or advertising tags before valid consent.
- No arbitrary CMS-provided executable calculator code or open redirects.
- No fabricated authors, reviewers, benchmarks, testimonials, sources or publication dates.
- No autonomous AI editorial approval or publication.
- No activation of the scheduler before due-only authenticated publishing acceptance.

## 6. Execution rule

Work proceeds in gate order G2 → G3 → G4 → G5 → G6 → G7 → G8 → G9 → G10 → G11 → G12. Where a gate depends on a provider account, human contributor, real hardware, legal interpretation, commercial eligibility or explicit spend approval, complete all safe implementation and test work possible, record the precise external dependency, and do not fabricate acceptance. G1 remains pending throughout this sequence.
