# HEZQEN CMS Setup

## Environment

Copy .env.example to .env and provide:
- DATABASE_URL: a dedicated HEZQEN PostgreSQL connection string. Never point local development at production.
- PAYLOAD_SECRET: a unique high-entropy secret of at least 32 random bytes.
- NEXT_PUBLIC_SITE_URL: the canonical origin for the current environment.
- HEZQEN_ALLOWED_ORIGINS: comma-separated exact HTTPS origins allowed by Payload CORS/CSRF. Local development may use http://localhost:3000.

Production must explicitly provide all four values. The application does not fall back to a build-time or known secret at runtime.

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
1. A reviewed initial migration is generated.
2. The migration is approved and applied to an isolated staging branch.
3. An initial administrator is bootstrapped.
4. Authenticated access and direct REST/Local API denial tests pass.
5. A server-only editorial command invokes the existing workflow state machine and writes state plus audit events transactionally.
6. Private object storage is provisioned and evidence integrity is verified after upload.

Initial migration generation is isolated in a dedicated GitHub Actions workflow using an ephemeral PostgreSQL 18 service. Generated migration files are committed to a review branch; a separate PR workflow applies them only to an ephemeral PostgreSQL service and verifies migration status. Neither workflow connects to Neon or applies migrations to any shared database. No database migration is applied by the application build.
