# HEZQEN Platform Acceptance Criteria

**Status:** Baseline release contract  
**Product:** HEZQEN — BY TINLANCE  
**Positioning:** Global Technology & Business Intelligence  
**Tagline:** Research. Intelligence. Perspective.

These criteria define what must be true before HEZQEN is considered ready for public production. A feature is not accepted because it looks complete; it must satisfy its functional, editorial, security, accessibility, and operational requirements with inspectable evidence.

## 1. Product experience

- [ ] The platform communicates HEZQEN's identity and global technology/business intelligence mission immediately.
- [ ] The four editorial divisions are discoverable: AI & Technology, Cybersecurity, Cloud & Engineering, Business & Startups.
- [ ] Navigation clearly separates editorial coverage, research, Labs/tools, and premium Intelligence experiences.
- [ ] The homepage is an editorial front page, not merely a reverse-chronological blog feed.
- [ ] Search supports discovery across published articles, investigations, research, topics, companies, technologies, and tools as those content types are introduced.
- [ ] Every page has a clear purpose, useful hierarchy, and meaningful empty/error/loading states.
- [ ] Responsive behavior is verified on mobile, tablet, and desktop.
- [ ] No placeholder links, fake metrics, fabricated testimonials, or nonfunctional controls ship to production.

## 2. Brand and design-system fidelity

- [ ] Use the supplied HEZQEN logo-kit assets; do not redraw or approximate the logo.
- [ ] Preserve logo proportions, clear space, approved variants, and intended backgrounds.
- [ ] Brand colors: Navy #0B1B33, Graphite #2A3441, Amber #F5A623, Amber Deep #A35F00, Slate #5B6678, Mist #F4F5F7, White #FFFFFF.
- [ ] Typography uses Inter / Inter Display or a documented compatible fallback.
- [ ] Amber is a restrained signal color. Use Amber Deep where readable text contrast is required on light backgrounds.
- [ ] The visual system is editorial, precise, research-led, and restrained; avoid generic AI-themed decoration.
- [ ] Color contrast, focus states, typography, spacing, and component states are documented and consistently implemented.

## 3. Editorial integrity and content governance

- [ ] Editorial workflow enforces Pitch → Research → Draft → Fact-check → Editorial review → Human approval → Publish.
- [ ] Only an authorized human editor can approve and publish.
- [ ] Every published item has an accountable human author and editor.
- [ ] Material factual claims can be traced to source/evidence records.
- [ ] Sources retain enough metadata to identify and evaluate them.
- [ ] AI-assisted work receives human verification; material AI use is disclosed when appropriate.
- [ ] No agent, model, prompt, memory, webpage, document, or tool output can grant publication authority or bypass approval.
- [ ] Opinion, analysis, sponsored content, explainers, and research are distinguishable.
- [ ] Commercial disclosures and conflicts of interest are recorded and displayed where relevant.
- [ ] Corrections, updates, and material revision history are supported and visible.
- [ ] There is a reader-facing corrections/contact mechanism.
- [ ] No fabricated sources, quotes, authors, benchmarks, metrics, or testimonials are permitted.
- [ ] No automated mass publishing or search-manipulation content pipeline is permitted.

## 4. Evidence and research infrastructure

- [ ] Articles can reference sources and specific claims, not just a generic bibliography.
- [ ] Evidence records preserve source identity, URL or locator, dates, provenance, and relevant notes.
- [ ] Material evidence can be versioned or snapshotted where lawful and technically feasible.
- [ ] Research records include methodology, scope, assumptions, limitations, and responsible author/editor.
- [ ] Benchmarks distinguish measured observations from estimates and theoretical calculations.
- [ ] Benchmark records capture environment, versions, workloads, baselines, repetitions, units, and uncertainty.
- [ ] Evidence and research data can be exported or audited by authorized staff.
- [ ] Source content is treated as untrusted input and cannot issue instructions to platform agents.

## 5. Search, discovery, and structured content

- [ ] Published content uses semantic HTML and descriptive metadata.
- [ ] Canonical URLs, sitemap, robots directives, Open Graph, and appropriate structured data are correct.
- [ ] Search results identify content type, date, division, and useful context.
- [ ] Search handles no-results and partial-match states usefully.
- [ ] Internal links connect related reporting, investigations, topics, sources, research, and tools.
- [ ] Indexing controls prevent drafts, private research, and restricted records from becoming public.
- [ ] Search and metadata do not expose unpublished or private information.

## 6. HEZQEN Labs and interactive tools

- [ ] Each calculator/tool documents its inputs, formulas, assumptions, units, version, and limitations.
- [ ] Deterministic tools produce reproducible results for the same inputs and formula version.
- [ ] Empirical performance claims are backed by actual measurements, not theoretical estimates.
- [ ] Validation prevents invalid, unsafe, or nonsensical inputs.
- [ ] Results explain uncertainty and avoid false precision.
- [ ] Shareable results do not leak private inputs or sensitive user data.
- [ ] Tool pages provide useful references and links to relevant editorial research.
- [ ] Tools remain modular and do not create unnecessary runtime coupling to the publication.

## 7. HEZQEN Infrastructure products

- [ ] Each infrastructure kit has a versioned product specification, supported-platform matrix, prerequisites, install/rollback instructions and operational runbook.
- [ ] Reproducible build artifacts include checksums, an SBOM and signed provenance.
- [ ] Third-party model, dataset, runtime and dependency licenses are reviewed for redistribution and commercial use.
- [ ] Runtime acceptance is distinct from physical hardware certification; GPU and privacy claims are backed by measurements on supported hardware.
- [ ] PII protection reports precision, recall, false-positive/false-negative rates and throughput on a documented test corpus.
- [ ] Offline bundles are installable without network access and include dependency closure, license notices and verification instructions.
- [ ] Pricing, support, compatibility policy, security response and refund terms are defined before sale.

## 8. Accounts, subscriptions, and premium Intelligence

- [ ] Authentication and authorization are enforced server-side.
- [ ] Reader, author, editor, administrator, and service permissions are explicit and least-privilege.
- [ ] Premium content access is checked on the server and cannot be bypassed through client-side state.
- [ ] Subscription, billing, cancellation, and entitlement states are auditable before paid access launches.
- [ ] Personalization is transparent, optional where appropriate, and privacy-conscious.
- [ ] Account deletion and data export behavior are documented before reader accounts launch.

## 9. Security and privacy

- [ ] Threat modeling is completed for authentication, editorial publishing, search, uploads, integrations, and administrative functions.
- [ ] OWASP Top 10 risks are assessed; relevant ASVS controls are mapped to implementation and tests.
- [ ] Server-side authorization is deny-by-default and tested for cross-role and cross-tenant access.
- [ ] Inputs are validated at trust boundaries; output encoding and parameterized database access are used.
- [ ] CSRF, XSS, injection, SSRF, insecure file handling, and security misconfiguration are addressed where applicable.
- [ ] Secrets are never committed to the repository or exposed to client bundles.
- [ ] Rate limits, abuse controls, secure headers, and appropriate session protections are implemented.
- [ ] Dependencies are pinned/managed and scanned; critical/high findings are resolved or explicitly risk-accepted by an accountable owner before release.
- [ ] Audit logs capture privileged actions and editorial approval/publishing events without unnecessarily logging secrets or sensitive personal data.
- [ ] Backups, restore procedures, retention, and incident response are documented and tested.
- [ ] Data collection is minimized and privacy notices accurately describe actual behavior.
- [ ] External content, tool outputs, and agent observations are treated as untrusted data.

## 10. Accessibility and performance

- [ ] Target WCAG 2.2 AA for core user journeys.
- [ ] Keyboard navigation and visible focus work across navigation, search, forms, dialogs, and interactive tools.
- [ ] Semantic landmarks, labels, headings, alt text, and accessible names are present.
- [ ] Color is not the only means of conveying meaning.
- [ ] Reduced-motion preferences are respected.
- [ ] Core Web Vitals are measured on representative production pages and budgets are documented.
- [ ] Images, fonts, scripts, and data requests are optimized; third-party scripts are minimized.
- [ ] No serious accessibility blocker or performance regression is knowingly shipped.

## 11. Engineering quality and operations

- [ ] Architecture is modular and maintainable; avoid premature microservices.
- [ ] TypeScript strict mode is used if TypeScript is selected for the application.
- [ ] Database schema changes use versioned migrations.
- [ ] Unit, integration, and end-to-end tests cover critical behavior and authorization boundaries.
- [ ] CI runs formatting/linting, type checks, tests, build, and relevant security checks.
- [ ] Production deployment is repeatable and has a rollback procedure.
- [ ] Environment configuration and secret management are documented.
- [ ] Error monitoring, structured logs, uptime checks, and actionable alerts are in place.
- [ ] Backups and restore have been exercised, not merely configured.
- [ ] No unexpected paid infrastructure is introduced without explicit approval; cost assumptions are documented.

## 12. Release gates

### Gate A — Foundation
- [ ] Brand assets and design tokens are integrated correctly.
- [ ] Information architecture and editorial content model are documented.
- [ ] Threat model, data classification, and permission model are reviewed.
- [ ] CI baseline is green.

### Gate B — Editorial MVP
- [ ] Homepage, division pages, article pages, author/editor attribution, and navigation work.
- [ ] Draft/review/approval/publish permissions are enforced server-side.
- [ ] Source attribution, disclosures, corrections, and revision history work.
- [ ] SEO metadata and sitemap are verified.
- [ ] Responsive and accessibility checks pass.

### Gate C — Research and Labs
- [ ] Evidence and methodology records are usable and auditable.
- [ ] First interactive tool has documented, tested formulas and limitations.
- [ ] Shareable output does not disclose private inputs.
- [ ] Tool performance and accessibility are verified.

### Gate D — Intelligence and scale
- [ ] Premium entitlements and billing flows are tested before monetization.
- [ ] Search and discovery scale tests meet documented budgets.
- [ ] Privacy, retention, export, and deletion workflows are verified.
- [ ] Operational monitoring, backup restoration, and incident procedures are exercised.

## 13. Definition of done

A release is accepted only when:
1. All applicable acceptance criteria are checked with evidence.
2. CI and production build are green.
3. Critical user journeys pass automated and manual verification.
4. No unresolved critical/high security issue remains without formal, time-bounded risk acceptance.
5. Editorial approval cannot be bypassed by automation or privilege escalation.
6. No fabricated or placeholder content is present.
7. Accessibility, responsive behavior, and performance have been checked on representative pages.
8. Deployment, rollback, monitoring, and backup procedures are documented.
9. The release owner and accountable editorial owner approve the release.

A checkbox is not evidence by itself. Link the test, report, screenshot, audit record, or review that demonstrates the criterion is satisfied.
