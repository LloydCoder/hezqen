# HEZQEN CMS Setup

> **Current-state notice (15 November 2026):** This document began as the initial setup checklist. The authoritative operational record is [CMS Operations and Release Contract](CMS_OPERATIONS.md), with phase acceptance in [PHASE_STATUS.md](PHASE_STATUS.md). The staging database has since been migrated and bootstrapped; production remains untouched. Historical statements below are superseded where the operational record is newer.

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

## Historical implementation checklist (superseded by current state below)

The Payload admin panel and REST routes are integrated in the application source. Collections define restricted access for users, articles, topics, sources, evidence, claims and audit events. Workflow state, approval, publication, evidence creation, claim verification and audit writes are not directly editable through normal collection APIs.

The initial implementation checklist is now partly complete. Current acceptance is tracked in CMS_OPERATIONS.md; do not use this historical list as a deployment approval.

Migration generation and verification remain isolated in GitHub Actions using ephemeral PostgreSQL 18. The migration registry now contains `20261115_155359_initial` and `20261116_000000_editorial_scheduling_corrections`; both are applied to the shared Neon staging branch in batches 1 and 2. The migration workflow itself still uses only ephemeral PostgreSQL and does not connect to Neon. No database migration is applied by the application build. Production has not been migrated.


## Verified staging state — 15 November 2026

- Neon staging branch `br-lucky-bird-bayxt3by` (`hezqen` database) records both migrations: `20261115_155359_initial` (batch 1) and `20261116_000000_editorial_scheduling_corrections` (batch 2). The pre-migration recovery branch exists. No production migration was applied.
- One active staging administrator was bootstrapped (`hello@tinlance.com`). The temporary password was disclosed in the earlier setup exchange; rotate it on first successful login. Interactive login has not been independently tested.
- The code now includes transactional editorial workflow commands, optimistic concurrency, correction lifecycle metadata, scheduled publishing fields, immutable audit writes, private evidence preservation and verification endpoints, claim verification, and admin controls. The current PR/CI state remains authoritative; do not infer release acceptance from code presence.
- Evidence and claim verification are explicit gates: fact-check completion is blocked until every material claim and its attached evidence are verified. Protected writes use private request-context capabilities; collection hooks deny direct Local API writes/deletes outside approved service paths.
- Neon private object storage is provisioned and the adapter performs a write/read-back SHA-256 comparison. A live staging upload/read-back acceptance test has not been completed.
- Resend adapter/configuration is present, but a live password-reset email delivery test has not been completed.
- The scheduler endpoint and secret configuration exist, but no production Cron Trigger has been enabled or verified.
- The public correction policy page exists; public article rendering with correction notices is not yet accepted.
- The Vercel project is on Hobby. Vercel documents Hobby as non-commercial, so it is not an acceptable production host for HEZQEN. Cloudflare Worker compatibility and local smoke checks run in CI, but no production Worker deployment has been accepted.
- Main immutable tables (`audit_events`, `evidence`, `claims`, `sources`) have no UPDATE/DELETE grants, and `articles`, `topics`, `users` have no DELETE grants. Remaining DELETE grants are limited to Payload internal/version/relationship/session/preferences tables; review `_articles_v` retention. Full authenticated role-matrix acceptance, live storage/email tests, scheduler execution, public article/correction rendering, and production hosting/cutover remain release gates.
## Current operational reconciliation

For the latest implementation state, runtime environment variables, editorial workflow authority, private evidence storage, transactional email, scheduler setup and release gates, see [CMS Operations and Release Contract](CMS_OPERATIONS.md). This addendum supersedes older setup assumptions where they conflict; it does not mark staging or production as accepted.
