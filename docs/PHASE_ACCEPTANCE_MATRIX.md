# HEZQEN G1–G12 Acceptance Matrix

**Last updated:** 17 November 2026  
**Current operating mode:** Staging only. G1 remains deliberately held.  
**Production safety:** No production deployment, DNS change, production database mutation, production credential change, scheduler activation or paid infrastructure provisioning has been performed in this execution.

| Gate | Current status | Evidence / remaining acceptance |
|---|---|---|
| G1 — Production | **HELD / NOT ACCEPTED** | Production remains untouched by the current work. Complete only after the separate production authorization gate and production-specific migration, credentials, security, backup/restore and smoke-test evidence. |
| G2 — Editorial governance | **IMPLEMENTED IN PREVIEW; OPERATIONAL ACCEPTANCE PENDING** | Public About, Editorial Standards, Corrections, Research Methodology, Authors & Contributors and Commercial Disclosure pages are present. New policy pages are linked in navigation and sitemap. Preview routes returned 200 and preview is noindex. Human author/reviewer/editor assignment and real editorial approval records remain outstanding. |
| G3 — Eight flagship articles | **RESEARCH DRAFTS PREPARED; NOT ACCEPTED** | Eight separate research drafts exist under `editorial/drafts/`; see the [review matrix](FLAGSHIP_ARTICLE_REVIEW_MATRIX.md). Each is explicitly not for publication. Every draft still requires a consenting named human author, independent specialist reviewer, fact-check and authorized editor. Numeric claims that need hardware measurements remain estimates. |
| G4 — VRAM Labs | **IMPLEMENTED IN PREVIEW; CI GREEN; HARDWARE ACCEPTANCE PENDING** | Multi-GPU tensor-parallel memory-placement estimator, per-GPU capacity checks, KV-head divisibility validation, GPU SKU/interconnect catalogue, shareable settings, Llama 3.3 70B source-linked preset, public regression vectors and v1.2.0 methodology are implemented; see the [methodology](LABS_VRAM_METHODOLOGY.md). PR-head CI, migration verification and Cloudflare compatibility passed on `c21c708eb20adfb59c201743b0318ff95f6cc943`; post-merge staging push workflows passed on `034d771fb84a4c7595163c0b8dc7c56e3fb43a68`. No physical GPU runtime benchmark has been conducted. |
| G5 — Conversion | **PARTIAL; NOT ACCEPTED** | Architecture-review lead capture, consent fields, audit events and newsletter double-opt-in code exist. Failed confirmation attempts consume the resend budget. Current preview branch has no dedicated Resend API key/sender verification; no email was sent. No durable IP/global public-form rate limit or complete lead notification workflow is verified. |
| G6 — API vs self-hosted calculator | **SPECIFIED; NOT IMPLEMENTED** | Full requirements and formulas are documented in [G6 calculator specification](G6_API_SELF_HOSTED_BREAK_EVEN_SPEC.md). Current `/labs/ai-cost` is a basic request-cost comparison, not the complete break-even model. The separate `hezqen-labs` repository was not found and repository creation is not exposed by the connected GitHub actions. Do not add the new engine to the publication repo as a workaround. |
| G7 — Discovery and SEO | **PREVIEW FOUNDATION VERIFIED; PRODUCTION ACCEPTANCE PENDING** | Dynamic sitemap includes public policy and Labs routes; robots.txt and RSS feed respond; canonical and social metadata exist; preview responses are noindex. Production crawlability, indexing and live headers remain part of G1. |
| G8 — Privacy and analytics | **SPECIFIED; NOT IMPLEMENTED** | Privacy/consent/analytics architecture is documented in the [G8 specification](G8_PRIVACY_ANALYTICS_SPEC.md). No analytics or marketing pixels are active. Keep the no-tracking posture until the CMP, event validation, retention/deletion controls, processor review and legal review are complete. |
| G9 — Monetization | **NOT IMPLEMENTED** | Affiliate eligibility/terms, disclosure, payment provider, checkout, verified webhooks, idempotency, refunds and secure digital delivery are not accepted; see the [G9 acceptance specification](G9_MONETIZATION_ACCEPTANCE.md). No payments or affiliate links are active. |
| G10 — Growth | **NOT LAUNCHED** | No verified distribution campaign, social account workflow, contributor pipeline or measured growth outcome has been accepted; see the [G10 distribution playbook](G10_DISTRIBUTION_PLAYBOOK.md). Do not claim reach or conversion without analytics evidence. |
| G11 — Original research | **METHODS/DRAFTS ONLY; NOT ACCEPTED** | No physical GPU experiment or measured serving benchmark has been performed; see the [G11 research protocols](G11_RESEARCH_PROTOCOLS.md). Article drafts distinguish calculations from measurements. Require hardware, exact model/runtime configuration, reproducible scripts, raw telemetry and independent review. |
| G12 — Ecosystem | **NOT IMPLEMENTED** | No production integration with TAS, Tinlyt, or a public read-only MCP has been accepted; see the [G12 integration specification](G12_ECOSYSTEM_INTEGRATION.md). AI assistance must remain subordinate to human editorial approval and governed tool authorization. |

## CI/CD evidence rule

A Vercel preview build proves that the selected source commit compiled and deployed. It does not replace the repository's test, formatter, security/audit, migration-verification or Cloudflare compatibility/Worker smoke workflows.

### Latest staging CI evidence

The latest staging branch push, `034d771fb84a4c7595163c0b8dc7c56e3fb43a68`, passed both push-triggered workflows:
- [HEZQEN CI — 44143161626](https://github.com/LloydCoder/hezqen/actions/runs/44143161626): install, lint, format, tests, pnpm audit, production build, ephemeral Payload migration/runtime smoke and TypeScript all passed.
- [Cloudflare Compatibility — 44143161386](https://github.com/LloydCoder/hezqen/actions/runs/44143161386): vinext compatibility, Worker build and isolated public-route/health smoke passed; both jobs succeeded.

The staging feature PR head, `c21c708eb20adfb59c201743b0318ff95f6cc943`, also passed all three PR workflows:
- [HEZQEN CI — 44142774653](https://github.com/LloydCoder/hezqen/actions/runs/44142774653)
- [Payload migration verification — 44142774787](https://github.com/LloydCoder/hezqen/actions/runs/44142774787)
- [Cloudflare Compatibility — 44142774886](https://github.com/LloydCoder/hezqen/actions/runs/44142774886)

The current `main` head, `9f176681e5fa5d8489813acad92c39f4bc2e4c37`, independently passed [HEZQEN CI — 44087684565](https://github.com/LloydCoder/hezqen/actions/runs/44087684565) and [Cloudflare Compatibility — 44087684826](https://github.com/LloydCoder/hezqen/actions/runs/44087684826). These are separate branch results; main does not contain the staging-only Picomatch mitigation.

### Branch integration and security boundary

The staging acceptance branch and `main` have diverged: staging is 130 commits ahead and 33 commits behind, with merge base `5b7280d519e9c76dca303e36631045a9a29c7c85`. A main-to-staging reconciliation PR was tested and closed without merge because GitHub reported a non-mergeable (`dirty`) comparison involving overlapping editorial pages, policy documents, workflow configuration and all eight research drafts. No branch was changed by that attempt. Do not resolve this by a blind merge or by overwriting either branch; reconcile the overlapping files deliberately in an isolated integration branch and rerun every required workflow.

The Picomatch 4.0.7 ReDoS mitigation, regression test and narrowly scoped audit waiver currently exist on the staging branch only. Main still contains Picomatch 4.0.7 without that mitigation. The waiver is not equivalent to a zero-vulnerability audit. Keep this finding visible and do not represent main as remediated. The staging branch's pnpm audit passes with the documented GHSA exception and local patch.

## Publication and production controls

- No article draft is published without a consenting human byline, independent review and editor approval.
- No scheduler is enabled before due-only publishing acceptance.
- No newsletter delivery is claimed until a dedicated preview sender is verified and the full confirmation/unsubscribe lifecycle is tested.
- No calculator is described as a benchmark unless physical measurements exist.
- No affiliate or payment functionality is enabled without provider eligibility, commercial terms and security acceptance.
- G1 remains held; merging a PR into `main` is prohibited while the Vercel production branch is `main` and production deployment is not authorized.
