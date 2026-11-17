# HEZQEN Master Execution Plan

**Plan owner:** Tinlance  
**Publication:** HEZQEN — Global Technology & Business Intelligence  
**Last reconciled:** 2026-11-17  
**Canonical domain:** https://hezqen.tinlance.com  
**Current execution branch:** `feat/hezqen-launch-foundation`  
**Current change set:** [PR #54](https://github.com/LloydCoder/hezqen/pull/54)  
**Release verdict:** NOT READY FOR PUBLIC PRODUCTION

## Operating rules

1. A source file, document or successful build is not proof of a deployed capability.
2. Track `implemented`, `tested`, `merged`, `deployed` and `accepted` as separate states.
3. Every code phase must pass HEZQEN CI and Cloudflare compatibility workflows, followed by a focused code/documentation audit.
4. A production phase additionally requires staging acceptance, security review, backup/restore, monitoring, rollback and explicit operational readiness.
5. Editorial content cannot be published without an accountable human author, independent review, evidence verification and editor approval.
6. Never claim corporate independence: HEZQEN is owned and operated by Tinlance. Disclose commercial relationships wherever they are relevant.
7. Do not activate social pixels or non-essential tracking before consent controls, data minimisation, provider configuration and privacy review are complete.
8. Do not introduce unapproved paid services, production migrations, credential changes or DNS cutovers.
9. Preserve the existing Payload CMS, public content projection, dynamic sitemap and separate Labs domain logic. Extend rather than rebuild.
10. Keep production deployment separate from a green PR pipeline. CI success does not authorize production release.

## Current repository facts

- HEZQEN uses Next.js 16, React 19, Payload CMS 3.93 and PostgreSQL.
- The CMS contains Articles, Users, Topics, Sources, Claims, Evidence and AuditEvents collections.
- Public article projections and dynamic sitemap generation already exist.
- The Labs suite contains sixteen additional calculators, plus dedicated VRAM and API-versus-self-hosted AI cost calculators. The second flagship cost calculator already exists; its scope is being expanded rather than duplicated.
- A dynamic `robots.txt`, XML sitemap, HTML sitemap, `llms.txt` and `llms-full.txt` already exist.
- The corrections page and editorial standards page already exist.
- The public homepage currently has no published articles in the staging inventory last audited on 2026-11-16.
- The latest authoritative production audit found the public host serving an older deployment; health, admin and correction routes were returning 404. The production Neon branch had no application tables.
- Vercel Hobby is not an approved commercial production host and its current content-training terms require a separate data-governance review. Its current terms also include a content-training provision for Hobby/trial Pro; see [Production Hosting Decision](PRODUCTION_HOSTING_DECISION.md). The prior decision was to defer paid upgrade; no paid host change is assumed by this plan.
- The latest branch changes are not merged or deployed until PR #54 is accepted.

## Phase register

| Gate | Workstream | Status at 2026-11-17 | Exit criteria |
|---|---|---|---|
| G1 | Production infrastructure and runtime | BLOCKED | Commercially permitted host; verified least-privilege runtime role; staging login/API/evidence/email/scheduler acceptance; production migrations and deployment; backups, alerts and rollback |
| G2 | Editorial governance and disclosures | IN PROGRESS | HEOS adopted; public ownership/commercial disclosure; author/reviewer accountability; source hierarchy; corrections/retractions; AI boundaries |
| G3 | Launch editorial content | NOT STARTED | Eight original, researched, sourced and human-reviewed articles published across four divisions |
| G4 | Labs reliability and flagship tools | IN PROGRESS — PR #54 | VRAM presets, formula versioning, shareable results, GPU capacity screen, public vectors; AI cost model includes labour; tests and UI accepted |
| G5 | Conversion and audience capture | PARTIAL | Architecture-review CTA exists in PR #54; replace/augment mailto path with secure lead form; newsletter double opt-in, unsubscribe and suppression workflow |
| G6 | SEO and machine discovery | IN PROGRESS — PR #54 | RSS feed, page-specific metadata, social image, WebApplication schema, methodology route, sitemap and runtime smoke tests |
| G7 | Privacy and measurement | NOT STARTED | First-party event schema, consent UI/CMP, consent evidence, withdrawal, provider-level controls, no PII or calculator inputs, pixel QA |
| G8 | Monetization | NOT STARTED | Verified affiliate eligibility, tracked redirect allowlist, sponsorship policy, digital products, payment webhook and fulfillment controls |
| G9 | Accessibility and UX | NOT STARTED | WCAG 2.2 AA audit, keyboard/screen-reader tests, contrast, responsive QA, Core Web Vitals and calculator usability |
| G10 | Distribution and audience growth | NOT STARTED | Newsletter cadence, editorial calendar, LinkedIn/X/YouTube plan, community participation policy, analytics and attribution |
| G11 | Original research and benchmarks | NOT STARTED | Reproducible GPU/inference experiments, public configurations, datasets, scripts, limitations and independent review |
| G12 | Ecosystem integration and final launch | NOT STARTED | Governed Tinlyt/Searqon/TAS integrations, read-only public MCP, full forensic audit and release approval |

## G1 — Production infrastructure

The production hosting decision is documented in [PRODUCTION_HOSTING_DECISION.md](PRODUCTION_HOSTING_DECISION.md). Do not treat the existing Hobby deployment or a green compatibility build as permission to launch the commercial publication.

### Required work

- Reconcile production Vercel deployment with accepted `main`.
- Select a commercially permitted hosting arrangement without silently introducing recurring spend.
- Verify Preview and Production environment-to-database branch mapping without exposing secrets.
- Prove the runtime connects as restricted `hezqen_cms`, not elevated `hezqen_app`.
- Keep database owner/migration credentials out of runtime configuration.
- Verify Payload admin, REST/Local API, health/readiness and public article routes.
- Complete authenticated administrator login and full role matrix.
- Test transactional rollback when audit-event insertion fails.
- Complete private evidence upload/read-back/download/checksum/audit round-trip.
- Complete real Resend password-reset delivery and mailbox receipt.
- Keep the scheduler disabled until authenticated due-only publication is accepted.
- Establish backup retention, restore drill, monitoring, alerting, incident response and rollback.

### Hard blockers

- The previously audited production branch had zero application tables and was not migrated.
- Staging SSO prevented external authenticated acceptance.
- Actual runtime database role was not independently proven.
- Vercel Hobby is not an approved commercial production host.
- No production deployment, production migration or DNS cutover is implied by PR CI.

## G2 — Editorial governance

Publish and maintain:

- About HEZQEN and explicit Tinlance ownership disclosure.
- Complete HEZQEN Editorial Operating Standard (HEOS).
- Editorial Standards and source hierarchy.
- Research Methodology.
- Corrections and Retractions policy.
- Author and contributor profiles when actual named contributors and approved biographies exist.
- Commercial disclosure and sponsored-content policy.
- Contributor, reviewer and fact-checker guidelines.

The editorial workflow remains:

Assignment → primary-source discovery → evidence preservation → claim extraction → verification → reproduction/technical investigation → draft → independent review → fact check → editor approval → publication → monitoring/correction.

AI may assist discovery, extraction, drafting, coding and analysis. Humans remain accountable for source credibility, newsworthiness, material-claim verification, conclusions and publication. AI must not autonomously approve or publish.

## G3 — Editorial launch package

Prepare eight flagship pieces:

1. How Much VRAM Does a 70B LLM Actually Need?
2. GPU Memory Explained: Weights, KV Cache, Context and Batch Size.
3. Self-Hosted LLMs vs Cloud APIs: Where Is the Break-Even Point?
4. The Real Cost of Running Production AI Agents.
5. Running Local AI Models: GPU, RAM and Storage Requirements.
6. How to Secure Self-Hosted LLM Infrastructure.
7. The Hidden Infrastructure Costs of Building an AI SaaS.
8. When Should a Startup Self-Host Its AI Models?

Every piece requires:
- Named human author and accountable editor.
- Research assignment and clear thesis.
- Primary sources and preserved evidence.
- Claim register for material factual statements.
- Reproducible calculations, code or experiment where applicable.
- Vendor and commercial conflict disclosures.
- Independent technical/fact review.
- Sources, methodology, limitations and correction path.
- Contextual internal links to relevant Labs tools without turning editorial content into disguised sales copy.

Do not fabricate author names, reviewer credentials, experiments or publication dates. The launch package remains draft-only until real people approve it.

## G4 — Labs

### VRAM calculator

- Architecture presets are sourced to model cards and model configuration files.
- Formula and calculator versions are explicit.
- Shared URLs contain validated, allowlisted calculator inputs only; no personal data.
- Copyable summaries include formula/calculator version.
- Single-GPU matcher compares estimate to published GPU capacity with explicit headroom; the current catalogue includes RTX 4090/5090, RTX 6000 Ada, A100 80GB, H100 SXM 80GB and H200 141GB (preliminary specifications).
- Multi-GPU VRAM is not naively summed.
- Public methodology, limitations, changelog and deterministic test vectors are published.
- MLA, hybrid attention, sliding-window cache and runtime-specific allocations remain explicit limitations until implemented and tested.

### API vs self-hosted AI cost calculator

The existing calculator is extended to include user-supplied monthly engineering and on-call/operations costs. Capacity, throughput, model quality, utilization inefficiency and other excluded costs remain disclosed. Zero labour inputs are assumptions, not evidence that labour is free.

### Additional Labs

- Production agent unit economics.
- SaaS infrastructure margin.
- PII exposure and AI data-risk assessment.
- Contextual article embeds and versioned presets.
- Calculator regression suite and public methodology.

Keep the Labs domain logic in its current separate module structure. CMS blocks may reference only allowlisted calculator IDs.

## G5 — Conversion and audience capture

### Architecture reviews

- Reusable CTA on every calculator page.
- Clear label: Tinlance engineering service, not editorial recommendation.
- Secure request form with validation, rate limits, abuse controls and privacy notice.
- Capture only qualification details needed to respond.
- Never transmit raw calculator inputs to analytics or marketing providers.
- Track the request only after consent where required.

### Newsletter

Launch **The HEZQEN Intelligence Brief** only after:
- Provider and data processor are selected and reviewed.
- Double opt-in confirmation is implemented.
- Consent text, timestamp, source and status are recorded.
- Unsubscribe, suppression and deletion workflows work.
- Subscriber export/access is restricted.
- Delivery, bounce and complaint handling is monitored.
- Privacy notice and retention are updated.

## G6 — SEO and discovery

- Preserve and verify the existing dynamic XML sitemap and robots.txt.
- Add and verify RSS.
- Verify canonical URLs and redirects, including the Vercel mirror.
- Add page-specific Open Graph and X/Twitter metadata and a real social image asset.
- Add Organization, Article, BreadcrumbList and relevant WebApplication structured data.
- Add calculator methodology and public test-vector discovery.
- Verify indexing, pagination, internal linking and noindex boundaries.
- Keep `llms.txt` optional; do not represent it as a Google ranking factor.
- Validate live responses after deployment, not only build output.

## G7 — Privacy and measurement

Three layers:

1. First-party product/content analytics.
2. Social advertising pixels.
3. Business conversion tracking.

Event taxonomy:
`article_view`, `article_engaged`, `calculator_used`, `calculator_result_generated`, `calculator_result_shared`, `newsletter_signup`, `affiliate_click`, `kit_checkout_started`, `purchase_completed`, `contact_submitted`.

Initial provider priority is LinkedIn and Meta, followed by X and Reddit if channel strategy justifies them. TikTok is deferred until a short-form distribution strategy exists.

Acceptance:
- Non-essential tracking does not run before valid consent.
- Consent is granular, reversible and documented.
- Provider tags load only after the appropriate category is granted.
- No calculator input values, secrets, private content or sensitive personal data enter events or URLs.
- No tags on admin, auth, password-reset, private evidence or sensitive transaction routes.
- Browser/server events deduplicate.
- Purchase events fire only after verified payment.
- Consent withdrawal stops future non-essential collection.
- Privacy and cookie notices match actual runtime behaviour.

## G8 — Monetization

### Affiliates and sponsorships

- Verify programme eligibility, geography, commission terms, payout thresholds and tax treatment.
- Distinguish affiliate, reseller, referral, channel and technology integration.
- Create partner/offer/redirect records only after verification.
- Enforce destination allowlists; never expose an open redirect.
- Add clear disclosure and `rel="sponsored"` where appropriate.
- Preserve editorial independence and separate sponsored research from editorial coverage.

### Digital products

Candidates:
- Multi-GPU Tensor Parallelism Bundle.
- Zero-Trust Docker Kit.
- PII-Redaction Middleware Kit.

Payment acceptance:
- Jurisdiction/provider eligibility reviewed.
- Signature-verified webhooks.
- Idempotent event handling.
- Paid-state verification.
- Secure, short-lived download fulfillment.
- Refund, dispute and retry handling.
- No secrets in frontend bundles.

No payment provider is assumed selected until its current terms and eligibility are verified.

## G9 — Accessibility and UX

- WCAG 2.2 AA target.
- Keyboard-only operation and visible focus.
- Accessible labels, help text, validation and status messages.
- Screen-reader checks.
- Contrast verification using actual palette combinations.
- Mobile/tablet/desktop review.
- Reduced-motion and zoom checks.
- Core Web Vitals and image/font performance.
- Calculator error states and copy/share interactions.

## G10 — Distribution

- Weekly HEZQEN Intelligence Brief after opt-in infrastructure is accepted.
- LinkedIn research summaries and executive insights.
- X technical threads and research snippets.
- YouTube technical explainers and benchmark walkthroughs.
- Reddit community contributions under each community's self-promotion rules.
- Hacker News submissions only when an original technical result or genuinely useful tool warrants discussion.
- Contributor recruitment across AI, cybersecurity, cloud, infrastructure and business analysis.
- Measure returning readers, qualified engagement and conversion rather than raw page views alone.

## G11 — Original research and benchmarks

- GPU memory experiments across models, quantization, context and batch sizes.
- Inference performance and throughput experiments.
- API versus self-hosted cost comparisons.
- Production AI agent unit economics.
- Infrastructure security investigations.
- Public scripts, configuration, environment, hardware, raw data, methodology and limitations.
- Separate measured results from estimates and theoretical calculations.
- Independent reviewer reproduces key results before publication.

## G12 — Ecosystem integration and final launch

- Tinlyt for evidence-first discovery and research preservation.
- Searqon for SEO/GEO/AEO measurement where it adds value.
- TAS for governed internal editorial assistance.
- Public read-only MCP for published content only; no drafts, private evidence or audit internals.
- No external agent or model receives publication authority.
- Final repository and asset audit.
- All CI workflows green on exact release commit.
- Staging acceptance and security sign-off.
- Legal/trademark clearance.
- Backup/restore and rollback drill.
- Commercial hosting and cost approval.
- Production deployment, canonical domain/TLS/health/article/RSS/sitemap verification.
- Launch communications and operational coverage.

## PR #54 implementation scope

PR #54 is the current implementation slice. It includes:
- RSS serializer and `/feed.xml` route using the existing public article projection.
- VRAM model presets, GPU capacity assessment and bounded versioned share payload.
- VRAM share/copy actions and calculator version display.
- Public methodology page and public JSON regression vectors.
- A test that reads the same public JSON vectors.
- AI cost calculator inputs for engineering and on-call costs.
- Tinlance architecture-review CTA on all calculator page types.
- Page-specific calculator metadata, social image and WebApplication structured data.
- Public disclosure improvements.
- CI smoke coverage for RSS, methodology and test vectors.

PR #54 is not a production release. Its HEZQEN CI and Cloudflare compatibility workflows must pass on the final head, then the code and docs must be audited before merge. It does not implement newsletter subscription, consent management, social pixels, paid checkout, production deployment or article publication.

## Final launch acceptance

HEZQEN may be declared publicly launched only when all of the following are true:

- [ ] Production host is commercially permitted and cost-approved.
- [ ] Production database has approved migrations and restricted runtime role.
- [ ] Admin, public API, health, article, corrections and scheduler acceptance pass.
- [ ] Backup restore and rollback are demonstrated.
- [ ] Eight reviewed articles are live, or an explicitly approved smaller launch package is documented.
- [ ] Public methodology, authorship and commercial disclosures are accurate.
- [ ] Labs calculations and test vectors pass.
- [ ] RSS, sitemap, robots, canonical and social metadata pass live checks.
- [ ] Privacy, consent and tracking behaviour match actual implementation.
- [ ] Accessibility, performance and security audits pass.
- [ ] Newsletter, lead and commercial workflows are operational or clearly withheld from launch.
- [ ] All required CI workflows are green on the exact release commit.
- [ ] No open critical/high security issue or undocumented operational blocker remains.
