#!/bin/sh
set -eu

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${RESTORE_DATABASE_URL:?RESTORE_DATABASE_URL is required}"
: "${BACKUP_FILE:?BACKUP_FILE is required}"

if env -u HEZQEN_RESTORE_APPROVED sh scripts/db/restore.sh >/dev/null 2>&1; then
  echo "Restore guard failed to block an unapproved restore." >&2
  exit 1
fi

if HEZQEN_RESTORE_ENV=production \
  HEZQEN_RESTORE_CONFIRM_TARGET=production \
  HEZQEN_RESTORE_APPROVED=true \
  HEZQEN_PRODUCTION_RESTORE_APPROVED= \
  sh scripts/db/restore.sh >/dev/null 2>&1; then
  echo "Restore guard failed to block an unapproved production restore." >&2
  exit 1
fi

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "CREATE DATABASE hezqen_restore_smoke"
sh scripts/db/backup.sh
sh scripts/db/restore.sh

source_tables=$(psql "$DATABASE_URL" -Atqc "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'")
restored_tables=$(psql "$RESTORE_DATABASE_URL" -Atqc "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'")
source_migrations=$(psql "$DATABASE_URL" -Atqc "SELECT count(*) FROM payload_migrations")
restored_migrations=$(psql "$RESTORE_DATABASE_URL" -Atqc "SELECT count(*) FROM payload_migrations")

if [ "$source_tables" != "$restored_tables" ] || [ "$source_migrations" != "$restored_migrations" ]; then
  echo "Backup/restore verification failed: restored schema or migration count differs." >&2
  exit 1
fi

echo "Ephemeral PostgreSQL backup/restore smoke test passed."
