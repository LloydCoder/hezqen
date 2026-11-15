#!/bin/sh
set -eu

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${BACKUP_FILE:?BACKUP_FILE is required}"

case "$BACKUP_FILE" in
  *.dump) ;;
  *)
    echo "BACKUP_FILE must end in .dump." >&2
    exit 64
    ;;
esac

if [ -e "$BACKUP_FILE" ] || [ -e "$BACKUP_FILE.sha256" ]; then
  echo "Refusing to overwrite an existing backup or checksum." >&2
  exit 73
fi

umask 077
backup_dir=$(dirname "$BACKUP_FILE")
mkdir -p "$backup_dir"
temporary_file="${BACKUP_FILE}.tmp.$$"
trap 'rm -f "$temporary_file"' 0 HUP INT TERM

pg_dump --format=custom --no-owner --no-privileges --file="$temporary_file" "$DATABASE_URL"
pg_restore --list "$temporary_file" >/dev/null
mv "$temporary_file" "$BACKUP_FILE"
sha256sum "$BACKUP_FILE" > "$BACKUP_FILE.sha256"
chmod 600 "$BACKUP_FILE" "$BACKUP_FILE.sha256"

echo "HEZQEN database backup archive and checksum created."
