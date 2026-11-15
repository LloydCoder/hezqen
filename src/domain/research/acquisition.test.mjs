import assert from "node:assert/strict";
import test from "node:test";
import { isPublicIpAddress, validateEvidenceTarget } from "./acquisition.ts";

test("accepts an absolute HTTPS public hostname without credentials or unusual ports", () => {
  const result = validateEvidenceTarget("https://research.example.org/report");
  assert.equal(result.hostname, "research.example.org");
  assert.equal(result.protocol, "https:");
});

test("rejects non-HTTPS schemes, credentials, unusual ports and fragments", () => {
  assert.throws(() => validateEvidenceTarget("http://example.org"), /HTTPS/);
  assert.throws(() => validateEvidenceTarget("ftp://example.org"), /HTTPS/);
  assert.throws(() => validateEvidenceTarget("https://user:pass@example.org"), /credentials/);
  assert.throws(() => validateEvidenceTarget("https://example.org:8443"), /port/);
  assert.throws(() => validateEvidenceTarget("https://example.org/path#fragment"), /fragment/);
});

test("rejects local and special-use hostnames", () => {
  for (const host of ["localhost", "service.local", "db.internal", "example.test", "router.lan"]) {
    assert.throws(() => validateEvidenceTarget(`https://${host}/`), /hostname/);
  }
});

test("rejects private, loopback, link-local, documentation and multicast IPv4 ranges", () => {
  for (const address of [
    "0.0.0.0",
    "10.1.2.3",
    "100.64.0.1",
    "127.0.0.1",
    "169.254.10.20",
    "172.16.0.1",
    "172.31.255.254",
    "192.168.1.1",
    "192.0.2.10",
    "198.18.0.1",
    "198.51.100.1",
    "203.0.113.1",
    "224.0.0.1",
    "240.0.0.1",
  ]) {
    assert.equal(isPublicIpAddress(address), false, address);
  }
});

test("accepts public IPv4 and rejects IPv6 loopback, unique-local, link-local and mapped private IPv4", () => {
  assert.equal(isPublicIpAddress("8.8.8.8"), true);
  assert.equal(isPublicIpAddress("1.1.1.1"), true);
  assert.equal(isPublicIpAddress("::1"), false);
  assert.equal(isPublicIpAddress("fc00::1"), false);
  assert.equal(isPublicIpAddress("fe80::1"), false);
  assert.equal(isPublicIpAddress("ff02::1"), false);
  assert.equal(isPublicIpAddress("::ffff:127.0.0.1"), false);
  assert.equal(isPublicIpAddress("::ffff:8.8.8.8"), true);
});

test("rejects IP literal targets unless the address is globally routable", () => {
  assert.throws(() => validateEvidenceTarget("https://127.0.0.1/document"), /public/);
  assert.throws(() => validateEvidenceTarget("https://[::1]/document"), /public/);
  assert.equal(validateEvidenceTarget("https://8.8.8.8/document").hostname, "8.8.8.8");
});
