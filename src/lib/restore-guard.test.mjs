import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const baseEnv = {
  ...process.env,
  BACKUP_FILE: "/tmp/hezqen-restore-guard.dump",
  RESTORE_DATABASE_URL: "postgres://localhost/restore_guard_test",
  HEZQEN_RESTORE_ENV: "staging",
  HEZQEN_RESTORE_CONFIRM_TARGET: "staging",
};

test("restore refuses to run without explicit approval", () => {
  const result = spawnSync("sh", ["scripts/db/restore.sh"], {
    encoding: "utf8",
    env: { ...baseEnv, HEZQEN_RESTORE_APPROVED: "false" },
  });

  assert.equal(result.status, 64);
  assert.match(result.stderr, /HEZQEN_RESTORE_APPROVED=true/);
});

test("restore requires a separate production approval", () => {
  const result = spawnSync("sh", ["scripts/db/restore.sh"], {
    encoding: "utf8",
    env: {
      ...baseEnv,
      HEZQEN_RESTORE_ENV: "production",
      HEZQEN_RESTORE_CONFIRM_TARGET: "production",
      HEZQEN_RESTORE_APPROVED: "true",
      HEZQEN_PRODUCTION_RESTORE_APPROVED: "false",
    },
  });

  assert.equal(result.status, 64);
  assert.match(result.stderr, /HEZQEN_PRODUCTION_RESTORE_APPROVED=true/);
});

test("production restore requires a separate overwrite approval", () => {
  const result = spawnSync("sh", ["scripts/db/restore.sh"], {
    encoding: "utf8",
    env: {
      ...baseEnv,
      HEZQEN_RESTORE_ENV: "production",
      HEZQEN_RESTORE_CONFIRM_TARGET: "production",
      HEZQEN_RESTORE_APPROVED: "true",
      HEZQEN_PRODUCTION_RESTORE_APPROVED: "true",
      HEZQEN_RESTORE_ALLOW_OVERWRITE: "false",
    },
  });

  assert.equal(result.status, 64);
  assert.match(result.stderr, /HEZQEN_RESTORE_ALLOW_OVERWRITE=true/);
});

test("restore rejects a confirmation target that differs from the selected environment", () => {
  const result = spawnSync("sh", ["scripts/db/restore.sh"], {
    encoding: "utf8",
    env: {
      ...baseEnv,
      HEZQEN_RESTORE_APPROVED: "true",
      HEZQEN_RESTORE_CONFIRM_TARGET: "production",
    },
  });

  assert.equal(result.status, 64);
  assert.match(result.stderr, /confirmation target does not match/);
});

test("restore refuses a non-empty target unless overwrite is explicitly approved", (t) => {
  const directory = mkdtempSync(join(tmpdir(), "hezqen-restore-guard-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));

  const backupFile = join(directory, "backup.dump");
  const fakeBin = join(directory, "bin");
  mkdirSync(fakeBin);
  writeFileSync(backupFile, "backup-payload");
  const checksum = createHash("sha256").update("backup-payload").digest("hex");
  writeFileSync(`${backupFile}.sha256`, `${checksum}  ${backupFile}\n`);
  const psql = join(fakeBin, "psql");
  writeFileSync(psql, "#!/bin/sh\nprintf '1\\n'\n");
  chmodSync(psql, 0o755);

  const result = spawnSync("sh", ["scripts/db/restore.sh"], {
    encoding: "utf8",
    env: {
      ...baseEnv,
      PATH: `${fakeBin}:${process.env.PATH}`,
      BACKUP_FILE: backupFile,
      HEZQEN_RESTORE_APPROVED: "true",
    },
  });

  assert.equal(result.status, 64);
  assert.match(result.stderr, /target is not empty/);
});

test("restore refuses every non-empty target even when overwrite is requested", (t) => {
  const directory = mkdtempSync(join(tmpdir(), "hezqen-restore-nonempty-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));

  const backupFile = join(directory, "backup.dump");
  const fakeBin = join(directory, "bin");
  mkdirSync(fakeBin);
  writeFileSync(backupFile, "backup-payload");
  const checksum = createHash("sha256").update("backup-payload").digest("hex");
  writeFileSync(`${backupFile}.sha256`, `${checksum}  ${backupFile}\n`);
  const psql = join(fakeBin, "psql");
  writeFileSync(psql, "#!/bin/sh\nprintf '1\\n'\n");
  chmodSync(psql, 0o755);
  const pgRestore = join(fakeBin, "pg_restore");
  writeFileSync(pgRestore, '#!/bin/sh\necho called > "$PG_RESTORE_MARKER"\n');
  chmodSync(pgRestore, 0o755);

  const marker = join(directory, "pg_restore-called");
  const result = spawnSync("sh", ["scripts/db/restore.sh"], {
    encoding: "utf8",
    env: {
      ...baseEnv,
      PATH: `${fakeBin}:${process.env.PATH}`,
      BACKUP_FILE: backupFile,
      HEZQEN_RESTORE_APPROVED: "true",
      HEZQEN_RESTORE_ALLOW_OVERWRITE: "true",
      PG_RESTORE_MARKER: marker,
    },
  });

  assert.equal(result.status, 64);
  assert.match(result.stderr, /target database must be empty/);
  assert.equal(existsSync(marker), false);
});
