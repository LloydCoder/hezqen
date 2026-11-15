import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const payloadConfig = readFileSync(new URL("./payload.config.ts", import.meta.url), "utf8");
const collectionFiles = [
  "Articles.ts",
  "AuditEvents.ts",
  "Claims.ts",
  "Evidence.ts",
  "Sources.ts",
  "Topics.ts",
  "Users.ts",
];

test("Payload config does not load native Sharp without upload collections", () => {
  assert.doesNotMatch(payloadConfig, /import\s+sharp\s+from\s+["']sharp["']/);
  assert.doesNotMatch(payloadConfig, /^\s*sharp\s*,?\s*$/m);
});

test("current Payload collections do not declare upload fields", () => {
  for (const file of collectionFiles) {
    const source = readFileSync(new URL(`./collections/${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /\bupload\s*:/, file);
  }
});
