# HEZQEN Platform Architecture

**Status:** Application foundation implemented; no production deployment; CMS and editorial operations remain in implementation  
**Architecture style:** Modular monolith  
**Primary repository:** LloydCoder/hezqen

## Product boundaries

HEZQEN is organized into four connected product surfaces:

- **HEZQEN Media:** public reporting, investigations, analysis and explainers.
- **HEZQEN Labs:** tools, calculators, benchmarks and engineering experiments.
- **HEZQEN Intelligence:** premium research, briefings and decision support.
- **HEZQEN Infrastructure:** reusable local-AI deployment, PII protection, multi-GPU optimization, air-gapped RAG and offline lab-bundle products. Source code and engineering acceptance live in the separate [HEZQEN Infrastructure Standard repository](https://github.com/LloydCoder/hezqen-infrastructure-standard); the publication site is a discovery and distribution surface, not a runtime dependency.

The four editorial divisions are AI & Technology, Cybersecurity, Cloud & Engineering, and Business & Startups.

## Runtime and delivery

- Next.js App Router, React Server Components by default, React 19, strict TypeScript and Node.js 24 for the standard Next.js development/build path.
- Cloudflare Workers + vinext is an isolated hosting candidate, not an accepted production runtime. The compatibility check reported partial feature support; a local Worker build and route smoke test are being evaluated separately. vinext is beta.
- PostgreSQL 18 in a dedicated Neon project in AWS eu-central-1; do not confuse Neon-managed infrastructure with a HEZQEN-owned AWS account.
- Separate Neon `main`, `staging`, and `production` branches. Shared staging and production currently have no application tables; neither has received the checked-in migration.
- GitHub Actions CI checks formatting, lint, tests, dependency audit, production build, runtime routes, TypeScript and ephemeral PostgreSQL migrations.
- No production deployment or DNS cutover has been made. `https://hezqen.tinlance.com` is the canonical launch target, not a live service.

## Planned application modules

- editorial workflow and content
- authors, editors and role administration
- investigations and research projects
- sources, claims, evidence and provenance
- methodology and benchmark records
- taxonomy, companies, products and technologies
- search and discovery
- Labs tools and tool-run history
- newsletter preferences and reader accounts
- premium entitlements and subscriptions
- analytics, audit events and operational administration

Module boundaries should be enforced through imports and server-side service interfaces. Public rendering must not have direct access to privileged editorial writes.

## Data and integration boundaries

The dedicated Neon project is reserved for HEZQEN. An initial versioned Payload migration is checked in and verified against ephemeral PostgreSQL in CI. Shared staging and production have not been migrated. The host environment mapping must be verified so staging uses the Neon staging branch and production uses the dedicated production branch.

Existing Tinlyt, Kalevio, ThreatFade, Hezqara and shared Tinlance databases/services must not be repurposed.

Tinlyt, Searqon and TAS integrations are optional adapters over authenticated APIs or signed webhooks. They must not share database tables or become runtime prerequisites for public reading. Each adapter must be independently disableable.

## Data model and CMS decision

The logical relational model and migration policy are documented in [DATA_MODEL.md](DATA_MODEL.md). Payload CMS 3.93.0 with its official PostgreSQL adapter is the selected target in [ADR-0001](adr/0001-editorial-cms-and-postgres.md). The initial migration is generated and committed; CI applies it only to an ephemeral PostgreSQL database. No Payload schema has been applied to the shared Neon branches.

## Editorial authority

The editorial domain includes a tested publication policy and a tested workflow state machine. The state machine models pitch, research, draft, fact-check, editorial review, approval, scheduling, publication, correction and archive transitions. Approval and publication require the assigned human editor, separation of author/editor duties, completed fact-check, disclosure review and source-backed material claims.

**Important:** the pure domain modules are not yet connected to authenticated server commands or a persistence layer. They do not currently enforce production publishing permissions. The CMS must call the rules from server-only mutation handlers, persist state and audit events transactionally, and test direct API bypass and stale-write attempts. See [Editorial Workflow](EDITORIAL_WORKFLOW.md).

No model, agent, prompt, memory, webpage, tool output or integration may create editorial authority.

## CMS implementation boundary

Payload CMS 3.93.0 is integrated with the Next.js App Router and official PostgreSQL adapter. The admin panel and REST routes are mounted; user, article, topic, source, evidence, claim and audit-event collections define restrictive access. Workflow and verification fields are locked against ordinary client mutations. The initial schema migration has been verified only against ephemeral PostgreSQL; shared Neon staging and production remain unmigrated. No public publishing command is enabled. See [CMS_SETUP.md](CMS_SETUP.md).

## Research provenance

The research domain validates source identity, evidence metadata, checksum shape and claim-to-source/evidence relationships. A claim cannot pass the current verified-claim gate without a valid source and preserved, verified evidence record. The acquisition module currently uses Node.js-only networking primitives (`dns/promises` and `https.request`). It is not included in the current Worker route smoke test and must remain in a separately isolated Node.js acquisition service unless an equivalent Worker-safe egress design is implemented and security-reviewed. Exact-byte storage, immutable provenance and independent human fact-checking remain to be implemented. See [Research Evidence](RESEARCH_EVIDENCE.md).

## Security posture

The initial application disables the powered-by header and sets baseline response headers. A strict Content Security Policy, session controls, upload controls, rate limits, database authorization, secrets handling, audit persistence and complete threat-model mappings remain required.

## Deployment topology

- Development: local or isolated engineering environment.
- Preview/staging: isolated host preview or `workers.dev` staging candidate + Neon staging branch; not yet provisioned or accepted.
- Production: selected host + Neon production branch + `hezqen.tinlance.com`; not yet deployed or attached.
- Evidence/media: dedicated private HEZQEN object-storage namespace; not yet provisioned.

No Vercel deployment is part of the current hosting decision. Existing Tinlance product services and DNS records remain out of scope.
