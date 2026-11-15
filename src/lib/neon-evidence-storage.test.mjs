import assert from "node:assert/strict";
import test from "node:test";

import {
  ALLOWED_EVIDENCE_CONTENT_TYPES,
  MAX_EVIDENCE_BYTES,
  readNeonEvidenceStorageConfig,
  sha256Hex,
  putAndVerifyEvidenceObject,
} from "./neon-evidence-storage.ts";

test("computes a stable SHA-256 digest for the exact evidence bytes", () => {
  const bytes = new TextEncoder().encode("HEZQEN evidence integrity");
  assert.equal(
    sha256Hex(bytes),
    "cd4a9348a9698cf4763eca3e527a88866c8d11b859e9283942d5a11f02e15eb4",
  );
});

test("requires a complete private Neon storage configuration", () => {
  assert.throws(() => readNeonEvidenceStorageConfig({}), /NEON_EVIDENCE_STORAGE_NOT_CONFIGURED/);
  const config = readNeonEvidenceStorageConfig({
    AWS_ENDPOINT_URL_S3: "https://br-example.storage.c-8.eu-central-1.aws.neon.tech",
    AWS_REGION: "eu-central-1",
    HEZQEN_EVIDENCE_BUCKET: "hezqen-evidence",
    AWS_ACCESS_KEY_ID: "nak_test",
    AWS_SECRET_ACCESS_KEY: "nsk_test",
  });
  assert.equal(config.bucket, "hezqen-evidence");
  assert.equal(config.endpoint, "https://br-example.storage.c-8.eu-central-1.aws.neon.tech");
});

test("rejects non-HTTPS object storage endpoints", () => {
  assert.throws(
    () =>
      readNeonEvidenceStorageConfig({
        AWS_ENDPOINT_URL_S3: "http://storage.example.test",
        AWS_REGION: "eu-central-1",
        HEZQEN_EVIDENCE_BUCKET: "hezqen-evidence",
        AWS_ACCESS_KEY_ID: "nak_test",
        AWS_SECRET_ACCESS_KEY: "nsk_test",
      }),
    /NEON_EVIDENCE_STORAGE_ENDPOINT_INVALID/,
  );
});

test("limits evidence uploads to the configured size and safe MIME allowlist", async () => {
  assert.equal(MAX_EVIDENCE_BYTES, 4 * 1024 * 1024);
  assert.ok(ALLOWED_EVIDENCE_CONTENT_TYPES.has("application/pdf"));
  assert.equal(ALLOWED_EVIDENCE_CONTENT_TYPES.has("text/html"), false);
  await assert.rejects(
    putAndVerifyEvidenceObject(
      {
        endpoint: "https://storage.example.test",
        region: "eu-central-1",
        bucket: "hezqen-evidence",
        accessKeyId: "nak_test",
        secretAccessKey: "nsk_test",
      },
      {
        key: "evidence/00000000-0000-4000-8000-000000000000",
        bytes: new TextEncoder().encode("<script>alert(1)</script>"),
        contentType: "text/html",
      },
    ),
    /EVIDENCE_CONTENT_TYPE_NOT_ALLOWED/,
  );
});

test("rejects an expected digest that does not match the supplied bytes before upload", async () => {
  await assert.rejects(
    putAndVerifyEvidenceObject(
      {
        endpoint: "https://storage.example.test",
        region: "eu-central-1",
        bucket: "hezqen-evidence",
        accessKeyId: "nak_test",
        secretAccessKey: "nsk_test",
      },
      {
        key: "evidence/00000000-0000-4000-8000-000000000000",
        bytes: new TextEncoder().encode("captured evidence"),
        contentType: "text/plain",
        expectedSha256: "0".repeat(64),
      },
    ),
    /EVIDENCE_CHECKSUM_MISMATCH/,
  );
});
