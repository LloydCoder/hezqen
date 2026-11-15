import { createHash, createHmac } from "node:crypto";

export interface NeonEvidenceStorageConfig {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface VerifiedEvidenceObject {
  key: string;
  sha256: string;
  byteSize: number;
  contentType: string;
  etag: string | null;
}

export const MAX_EVIDENCE_BYTES = 4 * 1024 * 1024;

export const ALLOWED_EVIDENCE_CONTENT_TYPES = new Set([
  "application/pdf",
  "application/json",
  "application/xml",
  "text/xml",
  "text/plain",
  "text/csv",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

export function sha256Hex(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export function readNeonEvidenceStorageConfig(
  env: Record<string, string | undefined> = process.env,
): NeonEvidenceStorageConfig {
  const endpoint = env.AWS_ENDPOINT_URL_S3;
  const region = env.AWS_REGION;
  const bucket = env.HEZQEN_EVIDENCE_BUCKET;
  const accessKeyId = env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = env.AWS_SECRET_ACCESS_KEY;

  if (!endpoint || !region || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error("NEON_EVIDENCE_STORAGE_NOT_CONFIGURED");
  }
  const parsed = new URL(endpoint);
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error("NEON_EVIDENCE_STORAGE_ENDPOINT_INVALID");
  }
  if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket)) {
    throw new Error("NEON_EVIDENCE_STORAGE_BUCKET_INVALID");
  }
  return { endpoint: parsed.origin, region, bucket, accessKeyId, secretAccessKey };
}

function hmac(key: string | Uint8Array, value: string): Buffer {
  return createHmac("sha256", key).update(value, "utf8").digest();
}

function signingKey(secret: string, dateStamp: string, region: string): Buffer {
  const dateKey = hmac(`AWS4${secret}`, dateStamp);
  const regionKey = hmac(dateKey, region);
  const serviceKey = hmac(regionKey, "s3");
  return hmac(serviceKey, "aws4_request");
}

function objectUrl(config: NeonEvidenceStorageConfig, key: string): URL {
  const encodedKey = key.split("/").map((segment) => encodeURIComponent(segment)).join("/");
  return new URL(`/${config.bucket}/${encodedKey}`, config.endpoint);
}

function signedHeaders(
  config: NeonEvidenceStorageConfig,
  method: "GET" | "PUT" | "DELETE",
  url: URL,
  payloadHash: string,
  contentType?: string,
  now = new Date(),
): Headers {
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const canonicalHeaderValues: Record<string, string> = {
    host: url.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };
  if (contentType) canonicalHeaderValues["content-type"] = contentType;

  const headerNames = Object.keys(canonicalHeaderValues).sort();
  const canonicalHeaders = headerNames
    .map((name) => `${name}:${canonicalHeaderValues[name]?.trim()}\n`)
    .join("");
  const signedHeaderNames = headerNames.join(";");
  const canonicalRequest = [
    method,
    url.pathname,
    url.searchParams.toString(),
    canonicalHeaders,
    signedHeaderNames,
    payloadHash,
  ].join("\n");
  const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    createHash("sha256").update(canonicalRequest).digest("hex"),
  ].join("\n");
  const signature = createHmac("sha256", signingKey(config.secretAccessKey, dateStamp, config.region))
    .update(stringToSign, "utf8")
    .digest("hex");

  const headers = new Headers({
    "x-amz-date": amzDate,
    "x-amz-content-sha256": payloadHash,
    authorization: `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaderNames}, Signature=${signature}`,
  });
  if (contentType) headers.set("content-type", contentType);
  return headers;
}

async function requestObject(
  config: NeonEvidenceStorageConfig,
  method: "GET" | "PUT" | "DELETE",
  key: string,
  body?: Uint8Array,
  contentType?: string,
): Promise<Response> {
  const url = objectUrl(config, key);
  const payloadHash = sha256Hex(body ?? new Uint8Array());
  const headers = signedHeaders(config, method, url, payloadHash, contentType);
  return fetch(url, {
    method,
    headers,
    body: method === "PUT" ? Buffer.from(body ?? new Uint8Array()) : undefined,
    cache: "no-store",
  });
}

async function responseError(response: Response, operation: string): Promise<never> {
  const detail = (await response.text()).slice(0, 300);
  throw new Error(`NEON_EVIDENCE_${operation}_FAILED_${response.status}: ${detail}`);
}

export async function putAndVerifyEvidenceObject(
  config: NeonEvidenceStorageConfig,
  input: { key: string; bytes: Uint8Array; contentType: string; expectedSha256?: string },
): Promise<VerifiedEvidenceObject> {
  if (input.bytes.byteLength < 1 || input.bytes.byteLength > MAX_EVIDENCE_BYTES) {
    throw new Error("EVIDENCE_SIZE_OUT_OF_RANGE");
  }
  if (!ALLOWED_EVIDENCE_CONTENT_TYPES.has(input.contentType)) {
    throw new Error("EVIDENCE_CONTENT_TYPE_NOT_ALLOWED");
  }
  const sha256 = sha256Hex(input.bytes);
  if (input.expectedSha256 && input.expectedSha256.toLowerCase() !== sha256) {
    throw new Error("EVIDENCE_CHECKSUM_MISMATCH");
  }

  const uploaded = await requestObject(config, "PUT", input.key, input.bytes, input.contentType);
  if (!uploaded.ok) await responseError(uploaded, "UPLOAD");

  const retrieved = await requestObject(config, "GET", input.key);
  if (!retrieved.ok) await responseError(retrieved, "VERIFY");
  const storedBytes = new Uint8Array(await retrieved.arrayBuffer());
  const storedSha256 = sha256Hex(storedBytes);
  if (storedBytes.byteLength !== input.bytes.byteLength || storedSha256 !== sha256) {
    throw new Error("EVIDENCE_PERSISTED_BYTES_MISMATCH");
  }

  return {
    key: input.key,
    sha256,
    byteSize: storedBytes.byteLength,
    contentType: input.contentType,
    etag: retrieved.headers.get("etag"),
  };
}

export async function getPrivateEvidenceObject(
  config: NeonEvidenceStorageConfig,
  key: string,
): Promise<{ bytes: Uint8Array; contentType: string }> {
  const response = await requestObject(config, "GET", key);
  if (!response.ok) await responseError(response, "DOWNLOAD");
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > MAX_EVIDENCE_BYTES) throw new Error("EVIDENCE_SIZE_OUT_OF_RANGE");
  return {
    bytes,
    contentType: response.headers.get("content-type") ?? "application/octet-stream",
  };
}

export async function deleteEvidenceObject(
  config: NeonEvidenceStorageConfig,
  key: string,
): Promise<void> {
  const response = await requestObject(config, "DELETE", key);
  if (!response.ok && response.status !== 404) await responseError(response, "DELETE");
}
