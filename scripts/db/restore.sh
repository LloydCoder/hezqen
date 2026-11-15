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

if [ ! -f "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE.sha256" ]; then
  echo "Restore refused: backup archive or checksum is missing." >&2
  exit 66
fi

sha256sum --check "$BACKUP_FILE.sha256" >/dev/null
pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$RESTORE_DATABASE_URL" "$BACKUP_FILE"

echo "HEZQEN database restore completed for the explicitly confirmed target."
