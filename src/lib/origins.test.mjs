import assert from "node:assert/strict";
import test from "node:test";

import { resolveAllowedOrigins, resolvePayloadServerUrl } from "./origins.ts";

test("allows the configured canonical origin and exact Vercel deployment hostname", () => {
  assert.deepEqual(
    resolveAllowedOrigins({
      configuredOrigins: "https://hezqen.tinlance.com",
      deploymentHostname: "hezqen-preview-123.vercel.app",
      deploymentEnvironment: "preview",
      nodeEnv: "production",
    }),
    ["https://hezqen.tinlance.com", "https://hezqen-preview-123.vercel.app"],
  );
});

test("does not add a Vercel production deployment hostname to the origin allowlist", () => {
  assert.deepEqual(
    resolveAllowedOrigins({
      configuredOrigins: "https://hezqen.tinlance.com",
      deploymentHostname: "hezqen-production-123.vercel.app",
      deploymentEnvironment: "production",
      nodeEnv: "production",
    }),
    ["https://hezqen.tinlance.com"],
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

test("rejects HTTP localhost origins in production", () => {
  assert.throws(
    () =>
      resolveAllowedOrigins({
        configuredOrigins: "http://localhost:3000",
        nodeEnv: "production",
      }),
    /only HTTPS origins/,
  );
});

test("allows localhost HTTP only with the explicit local CI runtime-test flag", () => {
  assert.deepEqual(
    resolveAllowedOrigins({
      configuredOrigins: "http://localhost:3001",
      nodeEnv: "production",
      allowLocalRuntimeTest: true,
    }),
    ["http://localhost:3001"],
  );
  assert.throws(
    () =>
      resolveAllowedOrigins({
        configuredOrigins: "http://remote.example",
        nodeEnv: "production",
        allowLocalRuntimeTest: true,
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
  assert.deepEqual(resolveAllowedOrigins({ nodeEnv: "development" }), ["http://localhost:3000"]);
  assert.deepEqual(resolveAllowedOrigins({ nodeEnv: "production" }), []);
});

test("uses the exact Vercel deployment origin for Payload on Preview", () => {
  const allowedOrigins = resolveAllowedOrigins({
    configuredOrigins: "https://hezqen.tinlance.com",
    deploymentHostname: "hezqen-preview-123.vercel.app",
    nodeEnv: "production",
  });

  assert.equal(
    resolvePayloadServerUrl({
      configuredSiteUrl: "https://hezqen.tinlance.com",
      deploymentHostname: "hezqen-preview-123.vercel.app",
      deploymentEnvironment: "preview",
      allowedOrigins,
      nodeEnv: "production",
    }),
    "https://hezqen-preview-123.vercel.app",
  );
});

test("uses the canonical origin for Vercel Production", () => {
  const allowedOrigins = resolveAllowedOrigins({
    configuredOrigins: "https://hezqen.tinlance.com",
    deploymentHostname: "hezqen-prod-123.vercel.app",
    nodeEnv: "production",
  });

  assert.equal(
    resolvePayloadServerUrl({
      configuredSiteUrl: "https://hezqen.tinlance.com",
      deploymentHostname: "hezqen-prod-123.vercel.app",
      deploymentEnvironment: "production",
      allowedOrigins,
      nodeEnv: "production",
    }),
    "https://hezqen.tinlance.com",
  );
});

test("requires a canonical site URL in production Preview deployments", () => {
  assert.throws(
    () =>
      resolvePayloadServerUrl({
        deploymentHostname: "hezqen-preview-123.vercel.app",
        deploymentEnvironment: "preview",
        allowedOrigins: ["https://hezqen-preview-123.vercel.app"],
        nodeEnv: "production",
      }),
    /NEXT_PUBLIC_SITE_URL is required/,
  );
});

test("requires the canonical site origin in the allowlist for Preview deployments", () => {
  assert.throws(
    () =>
      resolvePayloadServerUrl({
        configuredSiteUrl: "https://hezqen.tinlance.com",
        deploymentHostname: "hezqen-preview-123.vercel.app",
        deploymentEnvironment: "preview",
        allowedOrigins: ["https://hezqen-preview-123.vercel.app"],
        nodeEnv: "production",
      }),
    /canonical site origin must be allowed/,
  );
});

test("rejects a server URL that is not in the explicit origin allowlist", () => {
  assert.throws(
    () =>
      resolvePayloadServerUrl({
        configuredSiteUrl: "https://untrusted.example",
        allowedOrigins: ["https://hezqen.tinlance.com"],
        nodeEnv: "production",
      }),
    /must be allowed/,
  );
});
