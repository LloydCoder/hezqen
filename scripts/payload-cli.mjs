import { spawnSync } from "node:child_process";
import path from "node:path";

const args = process.argv.slice(2);
const executable = path.resolve(
  "node_modules",
  ".bin",
  process.platform === "win32" ? "payload.cmd" : "payload",
);

const env = {
  ...process.env,
  PAYLOAD_CONFIG_PATH: process.env.PAYLOAD_CONFIG_PATH ?? "src/payload.config.ts",
};

const result = spawnSync(executable, args, {
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
