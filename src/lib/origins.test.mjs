import assert from "node:assert/strict";
import test from "node:test";

import { resolveAllowedOrigins } from "./origins.ts";

test("allows the configured canonical origin and exact Vercel deployment hostname", () => {
  assert.deepEqual(
    resolveAllowedOrigins({
      configuredOrigins: "https://hezqen.tinlance.com",
      deploymentHostname: "hezqen-preview-123.vercel.app",
      nodeEnv: "production",
    }),
    ["https://hezqen.tinlance.com", "https://hezqen-preview-123.vercel.app"],
  );
});

test("deduplicates normalized configured origins", () => {
  assert.deepEqual(
    resolveAllowedOrigins({
      configuredOrigins: "https://hezqen.tinlance.com, https://hezqen.tinlance.com/",
      nodeEnv: "production",
    }),
    ["https://hezqen.tinlance.com"],
  );
});

test("rejects insecure non-local origins", () => {
  assert.throws(
    () =>
      resolveAllowedOrigins({
        configuredOrigins: "http://hezqen.tinlance.com",
        nodeEnv: "production",
      }),
    /only HTTPS origins/,
  );
});

test("rejects malformed Vercel deployment hostnames", () => {
  assert.throws(
    () =>
      resolveAllowedOrigins({
        configuredOrigins: "https://hezqen.tinlance.com",
        deploymentHostname: "https://attacker.example/path",
        nodeEnv: "production",
      }),
    /exact deployment hostname/,
  );
});

test("uses localhost only as the non-production default", () => {
  assert.deepEqual(resolveAllowedOrigins({ nodeEnv: "development" }), [
    "http://localhost:3000",
  ]);
  assert.deepEqual(resolveAllowedOrigins({ nodeEnv: "production" }), []);
});
