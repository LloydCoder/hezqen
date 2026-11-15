# HEZQEN Platform Architecture

**Status:** Public application foundation deployed; persistence and editorial platform remain in implementation  
**Architecture style:** Modular monolith  
**Primary repository:** LloydCoder/hezqen

## Product boundaries

HEZQEN is organized into three connected product surfaces:

- **HEZQEN Media:** public reporting, investigations, analysis and explainers.
- **HEZQEN Labs:** tools, calculators, benchmarks and engineering experiments.
- **HEZQEN Intelligence:** premium research, briefings and decision support.

The four editorial divisions are AI & Technology, Cybersecurity, Cloud & Engineering, and Business & Startups.

## Runtime and delivery

- Next.js App Router, React Server Components by default, React 19 and strict TypeScript.
- Node.js 24.x runtime on a dedicated Vercel project.
- PostgreSQL 18 in a dedicated Neon project in AWS eu-central-1; do not confuse Neon-managed infrastructure with a HEZQEN-owned AWS account.
- Separate Neon `main`, `staging`, and `production` branches. Preview's sensitive database configuration currently targets staging only.
- GitHub Actions CI checks formatting, lint, tests, dependency audit, production build and TypeScript.
- The initial production deployment reached Vercel READY. Route-level browser verification and branded-domain activation remain open gates.

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

The dedicated Neon project is reserved for HEZQEN. No production schema or CMS data model is considered complete until versioned migrations have been applied and verified on staging and production. The production Vercel environment must use the dedicated production branch; Preview must use staging.

Existing Tinlyt, Kalevio, ThreatFade, Hezqara and shared Tinlance databases/services must not be repurposed.

Tinlyt, Searqon and TAS integrations are optional adapters over authenticated APIs or signed webhooks. They must not share database tables or become runtime prerequisites for public reading. Each adapter must be independently disableable.

## Editorial authority

The editorial domain includes a tested publication policy and a tested workflow state machine. The state machine models pitch, research, draft, fact-check, editorial review, approval, scheduling, publication, correction and archive transitions. Approval and publication require the assigned human editor, separation of author/editor duties, completed fact-check, disclosure review and source-backed material claims.

**Important:** these modules are not yet connected to a CMS, authenticated server session or persistence layer. They do not currently enforce production publishing permissions. The CMS must call the rules from server-only mutation handlers, persist state and audit events transactionally, and test direct API bypass and stale-write attempts. See [Editorial Workflow](EDITORIAL_WORKFLOW.md).

No model, agent, prompt, memory, webpage, tool output or integration may create editorial authority.

## Research provenance

The research domain validates source identity, evidence metadata, checksum shape and claim-to-source/evidence relationships. A claim cannot pass the current verified-claim gate without a valid source and preserved, verified evidence record. This is domain validation only; acquisition, exact-byte storage, digest calculation, immutable provenance, and independent human fact-checking remain to be implemented. See [Research Evidence](RESEARCH_EVIDENCE.md).

## Security posture

The initial application disables the powered-by header and sets baseline response headers. A strict Content Security Policy, session controls, upload controls, rate limits, database authorization, secrets handling, audit persistence and complete threat-model mappings remain required.

## Deployment topology

- Development: local or isolated engineering environment.
- Preview/staging: Vercel Preview deployment + Neon staging branch.
- Production: dedicated HEZQEN Vercel project + Neon production branch + branded hostname (pending).
- Media: dedicated HEZQEN object-storage namespace (pending).

The existing `tinlance.com` Vercel project and DNS records are out of scope and must remain untouched.
