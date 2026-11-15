import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
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
