# HEZQEN CMS Setup

## Environment

Copy .env.example to .env and provide:
- DATABASE_URL: a dedicated HEZQEN PostgreSQL connection string. Never point local development at production.
- PAYLOAD_SECRET: a unique high-entropy secret of at least 32 random bytes.
- NEXT_PUBLIC_SITE_URL: the canonical origin for the current environment.
- HEZQEN_ALLOWED_ORIGINS: comma-separated exact HTTPS origins allowed by Payload CORS/CSRF. Local development may use http://localhost:3000.

Production must explicitly provide all four values. On Vercel, `VERCEL_URL` is added as an exact HTTPS origin only when `VERCEL_ENV=preview`; Payload's `serverURL` resolves to that exact Preview hostname. Production uses the canonical `NEXT_PUBLIC_SITE_URL` and does not add the Vercel deployment hostname to the allowlist. This keeps Payload's own server origin correct without permitting wildcard domains. `HEZQEN_ALLOWED_ORIGINS` must still contain the canonical origin; arbitrary hosts, wildcard origins and untrusted forwarded-host values are not accepted. `NEXT_PUBLIC_SITE_URL` remains the canonical public/SEO origin. The Cloudflare Worker CI smoke harness uses an explicit `CI=true` plus `HEZQEN_LOCAL_RUNTIME_TEST=true` flag for its local HTTP listener only; remote HTTP origins remain rejected, and the flag is not configured in Vercel or production. The application does not fall back to a build-time or known secret at runtime.

## Commands

- pnpm install --frozen-lockfile
- pnpm dev
- pnpm generate:importmap
- pnpm generate:types
- pnpm payload migrate:create
- pnpm payload migrate
- pnpm build
- pnpm bootstrap:admin

The Payload CLI wrapper sets the config path and invokes the local CLI without shell interpolation. Migration commands require real environment variables and must never be run against production without a reviewed migration and explicit release approval.

## Initial administrator

The bootstrap command requires:
- HEZQEN_BOOTSTRAP_ADMIN_CONFIRM=CREATE_FIRST_ADMIN
- HEZQEN_BOOTSTRAP_ADMIN_EMAIL
- HEZQEN_BOOTSTRAP_ADMIN_PASSWORD with at least 20 characters

It refuses to proceed if any user already exists. Run it once against a newly migrated non-production database first. Remove the bootstrap variables immediately afterward. Do not expose the command through an HTTP route or public job.

## Current implementation boundary

The Payload admin panel and REST routes are integrated in the application source. Collections define restricted access for users, articles, topics, sources, evidence, claims and audit events. Workflow state, approval, publication, evidence creation, claim verification and audit writes are not directly editable through normal collection APIs.

The CMS is not operational until:
1. The checked-in initial migration is reviewed against the current collections and data model.
2. A backup/restore point is verified and the migration is explicitly approved and applied to the isolated staging branch; shared staging has not yet been migrated.
3. An initial administrator is bootstrapped in staging using one-time credentials and a controlled procedure.
4. Authenticated access and direct REST/Local API denial tests pass for every role and sensitive field.
5. A server-only editorial command invokes the existing workflow state machine and writes the state change plus immutable audit event in one PostgreSQL transaction, with optimistic concurrency checks.
6. Private object storage is provisioned and exact-byte evidence integrity is verified after upload.
7. Staging login, admin, public article reads, correction flow, error handling and rollback are accepted.

Initial migration generation is isolated in a dedicated GitHub Actions workflow using an ephemeral PostgreSQL 18 service. The generated migration is checked into `src/migrations/20261115_155359_initial.ts` with its snapshot. A separate PR workflow applies it only to an ephemeral PostgreSQL service and verifies migration status. Neither workflow connects to Neon or applies migrations to any shared database. No database migration is applied by the application build.


## Current operational reconciliation

For the latest implementation state, runtime environment variables, editorial workflow authority, private evidence storage, transactional email, scheduler setup and release gates, see [CMS Operations and Release Contract](CMS_OPERATIONS.md). This addendum supersedes older setup assumptions where they conflict; it does not mark staging or production as accepted.
