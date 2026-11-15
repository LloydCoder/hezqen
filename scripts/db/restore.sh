#!/bin/sh
set -eu

: "${BACKUP_FILE:?BACKUP_FILE is required}"
: "${RESTORE_DATABASE_URL:?RESTORE_DATABASE_URL is required}"
: "${HEZQEN_RESTORE_ENV:?HEZQEN_RESTORE_ENV is required}"
: "${HEZQEN_RESTORE_CONFIRM_TARGET:?HEZQEN_RESTORE_CONFIRM_TARGET is required}"

if [ "${HEZQEN_RESTORE_APPROVED:-}" != "true" ]; then
  echo "Restore refused: set HEZQEN_RESTORE_APPROVED=true after review." >&2
  exit 64
fi

case "$HEZQEN_RESTORE_ENV" in
  ci|staging|production) ;;
  *)
    echo "HEZQEN_RESTORE_ENV must be ci, staging, or production." >&2
    exit 64
    ;;
esac

if [ "$HEZQEN_RESTORE_CONFIRM_TARGET" != "$HEZQEN_RESTORE_ENV" ]; then
  echo "Restore refused: confirmation target does not match restore environment." >&2
  exit 64
fi

if [ "$HEZQEN_RESTORE_ENV" = "production" ] && [ "${HEZQEN_PRODUCTION_RESTORE_APPROVED:-}" != "true" ]; then
  echo "Production restore refused: separate HEZQEN_PRODUCTION_RESTORE_APPROVED=true is required." >&2
  exit 64
fi

if [ "$HEZQEN_RESTORE_ENV" = "production" ] && [ "${HEZQEN_RESTORE_ALLOW_OVERWRITE:-}" != "true" ]; then
  echo "Production restore refused: HEZQEN_RESTORE_ALLOW_OVERWRITE=true is required." >&2
  exit 64
fi

if [ ! -f "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE.sha256" ]; then
  echo "Restore refused: backup archive or checksum is missing." >&2
  exit 66
fi

sha256sum --check "$BACKUP_FILE.sha256" >/dev/null
existing_objects=$(psql "$RESTORE_DATABASE_URL" -Atqc "SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname <> 'information_schema' AND c.relkind IN ('r', 'p', 'v', 'm', 'S', 'f')")
case "$existing_objects" in
  ""|*[!0-9]*)
    echo "Restore refused: could not verify target database contents." >&2
    exit 1
    ;;
esac
if [ "$existing_objects" -gt 0 ] && [ "${HEZQEN_RESTORE_ALLOW_OVERWRITE:-}" != "true" ]; then
  echo "Restore refused: target is not empty; set HEZQEN_RESTORE_ALLOW_OVERWRITE=true after review." >&2
  exit 64
fi
pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$RESTORE_DATABASE_URL" "$BACKUP_FILE"

echo "HEZQEN database restore completed for the explicitly confirmed target."
