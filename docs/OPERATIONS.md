# HEZQEN operational readiness

## Health endpoints

- `GET /api/health` is a liveness endpoint. It confirms the Next.js process can answer requests and returns only service status and an ISO timestamp.
- `GET /api/health/ready` is a readiness endpoint. It checks that Payload can query the Users collection using the configured database. It returns only `ready` or `not_ready`, never database errors, credentials or user records. Responses are not cached.

The GitHub Actions uptime workflow runs every 30 minutes only after the repository variable `HEZQEN_HEALTH_URL` is configured. It accepts only `https://hezqen.tinlance.com/` and checks both endpoints. The variable must remain unset until the canonical domain is attached, the Payload migration is applied to staging/production as approved, and public readiness has been accepted. Until then, the workflow's health job is intentionally skipped. Failed checks surface through GitHub Actions notifications; no external monitoring vendor is provisioned.

## Database backup

Run `scripts/db/backup.sh` from an environment with PostgreSQL 18 client tools and a least-privilege `DATABASE_URL`:

```sh
DATABASE_URL='postgres://…' BACKUP_FILE='/secure-backups/hezqen-YYYYMMDD-HHMMSS.dump' sh scripts/db/backup.sh
```

The script creates a custom-format `pg_dump` archive, verifies it can be listed by `pg_restore`, writes a SHA-256 checksum, uses a restrictive file mode, and refuses to overwrite an existing archive. It never prints the connection string. Store backups only in an encrypted, access-controlled destination; do not commit or upload them to public artifacts.

## Database restore

Restore is destructive to the explicitly selected target database. Provision an empty target first, verify the backup and checksum, and use all confirmation variables:

```sh
BACKUP_FILE='/secure-backups/hezqen-YYYYMMDD-HHMMSS.dump' \
RESTORE_DATABASE_URL='postgres://…' \
HEZQEN_RESTORE_ENV=staging \
HEZQEN_RESTORE_CONFIRM_TARGET=staging \
HEZQEN_RESTORE_APPROVED=true \
sh scripts/db/restore.sh
```

The restore script refuses every non-empty target, even when an overwrite flag is supplied. This prevents a restore into a database containing unrelated objects: the script does not offer in-place overwrite or merge semantics. Provision a new empty database, restore into it, verify the application against it, and perform any connection-string cutover as a separate approved operation. Production additionally requires `HEZQEN_PRODUCTION_RESTORE_APPROVED=true`. The script validates the archive checksum and refuses missing approval, an invalid environment, or a mismatched target confirmation. Never place production credentials in CI or use the CI restore flag for a real environment.

## CI backup/restore drill

The Payload migration verification workflow applies migrations to ephemeral PostgreSQL, creates a custom-format backup, restores it into a second ephemeral database, and compares schema-table and migration counts. It also proves the restore guard blocks unapproved and unapproved-production restores. This validates the tooling; it is not a production backup schedule or restore drill.

## Current provider constraints

- Neon Free v3 has six-hour history retention; no snapshots or automatic snapshot schedules are configured. Automatic backup scheduling and protected branches require a paid plan. No plan upgrade is authorized.
- Neon `main`, `staging`, and `production` branches are unprotected. Use migration PR review, restricted connector access, explicit approval, and a verified backup before any shared-branch migration.
- Cloudflare R2 is not enabled. Do not enable it or create buckets until storage requirements, encryption, retention, access controls and cost are approved.
- Vercel remains the approved hosting target. The Hobby deployment allowance is managed by controlled previews; do not remove Vercel or upgrade the plan without approval.
- No production domain, production deployment, shared database migration, external monitoring destination, or backup storage bucket is currently configured.
