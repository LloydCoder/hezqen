# ADR-0001: Editorial CMS and PostgreSQL persistence

- **Status:** Accepted as the target architecture; implementation is gated on toolchain compatibility and isolated database validation.
- **Date:** 2026-11-15
- **Decision owners:** HEZQEN engineering

## Context

HEZQEN needs a self-hosted editorial CMS integrated with the existing Next.js App Router application and a dedicated PostgreSQL database. The CMS must support a human-controlled publishing workflow, version history, rich text, granular access control, authenticated users, migrations and a provider-neutral deployment model.

The repository currently uses Next.js 16.4.6, React 19.3.1, TypeScript 5.9.3 and Node.js 24.x in CI. The dedicated Neon project is PostgreSQL 18 with isolated main, staging and production branches. The database currently has no HEZQEN application tables.

## Decision

Adopt **Payload CMS 3.93.0** with:
- `payload`
- `@payloadcms/next`
- `@payloadcms/db-postgres`
- `@payloadcms/richtext-lexical`
- `sharp` for image processing where uploads require it

All Payload packages must be pinned to exactly the same version. Use the official PostgreSQL adapter, not a Vercel-specific adapter. Keep the existing Next.js App Router and modular monolith.

## Compatibility gate

The official Payload installation documentation currently specifies:
- Node.js `^24.22.3` (or supported newer major)
- Next.js `16.2.6+` in the supported 16.x range
- React and React DOM `^19.3.1`
- TypeScript `6.0.3+`

The current Next.js and React versions satisfy the documented framework ranges. The repository's current Node 24.22.2 runner and TypeScript 5.9.3 do not satisfy the current documented minimums. Before adding Payload packages:
1. Pin CI and supported runtime to Node 24.22.3 or a later compatible Node 24 patch.
2. Upgrade TypeScript to at least 6.0.3.
3. Regenerate and commit the pnpm lockfile.
4. Run all existing tests, lint, formatting, audit, production build and typecheck.
5. Install all Payload packages at exactly 3.93.0 and validate peer dependency resolution without force flags.

Do not install Payload while these gates are unresolved.

## Database and migration policy

- Use the dedicated HEZQEN Neon PostgreSQL 18 project only.
- Preview/staging must use the staging branch; production must use the production branch.
- Use the pooled endpoint for application traffic only where validated; use a direct endpoint for migration execution and operations requiring session semantics.
- Keep schema changes in versioned Payload migrations committed to the repository.
- Disable automatic schema push outside isolated local development.
- Never run destructive migrations or resets against shared branches without an explicit reviewed migration and approval.
- Verify migration status on staging before production rollout.
- Test backup and restore before launch.

## Editorial authority

Payload access control is necessary but not sufficient. The HEZQEN editorial state machine remains the domain authority for workflow transitions. Server-side commands must:
- Derive actor identity and role from the authenticated Payload request.
- Load persisted author/editor assignments and current revision.
- Reject client-supplied approval identity, status, role or publication timestamps.
- Call the tested workflow transition function.
- Persist the state transition and audit event in one transaction.
- Use optimistic concurrency/version checks.
- Enforce author/editor separation of duties.
- Keep automated agents and integrations outside approval and publication authority.

Public APIs and public frontend queries may return published records only.

## Alternatives considered

### Custom CMS using Next.js route handlers and SQL

Rejected for the initial release because it would require HEZQEN to build and maintain authentication, admin UI, rich-text editing, versions, drafts, access control and migrations before shipping editorial value.

### WordPress

Rejected because it introduces a separate runtime and plugin security/update surface, and does not fit the existing TypeScript/Next.js modular monolith as cleanly.

### TinaCMS

Not selected because the required persisted editorial workflow, granular server-side authorization and evidence-linked relational data are better served by Payload's database-backed collections and access-control model.

## Consequences

- Payload becomes a core runtime dependency and must be kept patched.
- Generated database migrations are reviewed artifacts and must be tested before deployment.
- Payload collection access rules must be tested through REST and Local APIs, not just the admin UI.
- The editorial state machine and evidence domain remain separate, independently tested modules.
- The public website must continue to render published content if optional external integrations are unavailable.

## Official references

- Installation and software requirements: https://payloadcms.com/docs/getting-started/installation
- PostgreSQL adapter: https://payloadcms.com/docs/database/postgres
- Access control: https://payloadcms.com/docs/access-control/overview
- Authentication: https://payloadcms.com/docs/authentication/overview
- Transactions: https://payloadcms.com/docs/database/transactions
- Migrations: https://payloadcms.com/docs/database/migrations
