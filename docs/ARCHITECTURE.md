# HEZQEN Platform Architecture

**Status:** Initial application foundation  
**Architecture style:** Modular monolith  
**Primary repository:** LloydCoder/hezqen

## Product boundaries

HEZQEN is organized into three connected product surfaces:

- **HEZQEN Media:** public reporting, investigations, analysis and explainers.
- **HEZQEN Labs:** tools, calculators, benchmarks and engineering experiments.
- **HEZQEN Intelligence:** premium research, briefings and decision support.

The four editorial divisions are AI & Technology, Cybersecurity, Cloud & Engineering, and Business & Startups.

## Initial runtime

- Next.js App Router with React Server Components by default.
- TypeScript strict mode.
- Next.js metadata, robots and sitemap route handlers.
- Static generation for the initial division pages.
- CSS custom properties as the initial design-token layer.
- Node's built-in test runner for isolated domain tests.
- Biome for linting and formatting, pinned to 2.6.7 in package scripts.
- GitHub Actions for lint, formatting, type checks, tests, dependency audit and production build.
- Dedicated Vercel project named hezqen, isolated from the existing Tinlance production project.

Versions are pinned in package.json and pnpm-lock.yaml. Node 24 is the CI runtime target.

## Planned application modules

The application is expected to grow into the following bounded modules without premature service decomposition:

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

A dedicated HEZQEN database and object-storage namespace are required before CMS or evidence persistence is introduced. Existing Tinlyt, Kalevio, ThreatFade, Hezqara and shared Tinlance databases/services must not be repurposed.

Tinlyt, Searqon and TAS integrations are optional adapters over authenticated APIs or signed webhooks. They must not share database tables or become runtime prerequisites for public reading. Each adapter must be independently disableable.

## Editorial authority

The tested publishing-policy module expresses the initial domain invariant: a human editor must be the actor, a record must have an accountable author/editor, an explicit approval, completed fact-check and disclosure review, and material claims must reference sources.

**Important:** this module is not yet connected to a CMS or persistence layer. It does not currently enforce production publishing permissions. The CMS implementation must call the rule from a server-only authorization boundary and test direct API bypass attempts.

No model, agent, prompt, memory, webpage, tool output or integration may create editorial authority.

## Security posture

The initial application disables the powered-by header and sets baseline response headers. A strict Content Security Policy, session controls, upload controls, rate limits, database authorization, secrets handling, audit persistence and complete threat-model mappings remain later implementation gates. Do not treat the current headers as a complete security program.

## Deployment topology

- Development: local or isolated engineering environment.
- Preview/staging: protected non-production deployment.
- Production: dedicated HEZQEN Vercel project and HEZQEN hostname.
- Database and object storage: dedicated HEZQEN resources, not shared production data stores.

The existing tinlance.com Vercel project and its DNS records are out of scope and must remain untouched.
