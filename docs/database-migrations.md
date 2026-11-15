# HEZQEN database migration and bootstrap procedure

## Schema source of truth

The Payload collection configuration under `src/collections/` is the schema source of truth. The PostgreSQL adapter uses `push: false`; production schema changes must be represented by reviewed migration files under `src/migrations/`.

## Generate a migration

1. Create a branch named `db/migration-<purpose>`.
2. Update the Payload collection configuration and tests.
3. Push the branch. The isolated migration-generation workflow starts a temporary PostgreSQL service, generates the Payload migration, formats the generated TypeScript and JSON snapshot, and commits the artifacts to that branch.
4. Review the migration SQL and snapshot in the pull request.

Do not hand-edit generated migration SQL unless a reviewed corrective migration is required.

## Verify before merge

The pull-request migration workflow applies all checked-in migrations to an ephemeral PostgreSQL database and runs `payload migrate:status`. The standard HEZQEN CI workflow also runs lint, formatting, tests, dependency audit, production build, route smoke tests and type checking.

These workflows do not connect to or modify the shared Neon project.

## Apply to a shared environment

Only after an approved release window and a verified database backup:

```bash
pnpm install --frozen-lockfile
pnpm payload migrate
pnpm payload migrate:status
```

Provide `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`, and `HEZQEN_ALLOWED_ORIGINS` through the target environment's secret manager. Never place credentials in the repository or migration files. Do not use Payload schema push in production.

## Bootstrap the first administrator

Run the one-time bootstrap script only after the target database migration has completed:

```bash
HEZQEN_BOOTSTRAP_ADMIN_CONFIRM=CREATE_FIRST_ADMIN \
HEZQEN_BOOTSTRAP_ADMIN_EMAIL=admin@example.com \
HEZQEN_BOOTSTRAP_ADMIN_PASSWORD='<at-least-20-character-secret>' \
pnpm bootstrap:admin
```

The script refuses to run unless the explicit confirmation value is present, the password is at least 20 characters, and the users collection is empty. Remove the bootstrap credentials from the environment immediately afterward.

## Operational safeguards

- Keep database credentials and the Payload secret outside Git.
- Take and verify a backup before production migrations.
- Run migrations against staging before production.
- Preserve the generated migration and snapshot as a single reviewed change.
- Do not run migrations against the shared Neon project without explicit release authorization.
