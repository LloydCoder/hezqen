import { createHash } from "node:crypto";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { request as httpsRequest } from "node:https";

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const ALLOWED_CONTENT_TYPES = new Set([
  "text/html",
  "text/plain",
  "application/pdf",
  "application/json",
]);
const MAX_REDIRECTS = 3;
const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 12_000;

export interface EvidenceAcquisition {
  finalUrl: string;
  contentType: string;
  bytes: Uint8Array;
  sha256: string;
  retrievedAt: string;
}

interface PublicAddress {
  address: string;
  family: 4 | 6;
}

function parseIpv6(address: string): bigint | null {
  const normalized = address.toLowerCase().split("%")[0];
  if (!normalized || normalized.includes("%")) return null;

  let input = normalized;
  if (input.includes(".")) {
    const lastColon = input.lastIndexOf(":");
    if (lastColon < 0) return null;
    const ipv4 = input.slice(lastColon + 1);
    if (isIP(ipv4) !== 4) return null;
    const octets = ipv4.split(".").map(Number);
    const high = ((octets[0] << 8) | octets[1]).toString(16);
    const low = ((octets[2] << 8) | octets[3]).toString(16);
    input = `${input.slice(0, lastColon)}:${high}:${low}`;
  }

  const halves = input.split("::");
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - left.length - right.length;
  if ((halves.length === 1 && missing !== 0) || (halves.length === 2 && missing < 1)) {
    return null;
  }

  const groups = [...left, ...Array.from({ length: missing }, () => "0"), ...right];
  if (groups.length !== 8 || groups.some((group) => !/^[0-9a-f]{1,4}$/.test(group))) {
    return null;
  }

  return groups.reduce((value, group) => (value << 16n) | BigInt(`0x${group}`), 0n);
}

function isPublicIpv4(address: string): boolean {
  const octets = address.split(".").map(Number);
  if (
    octets.length !== 4 ||
    octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)
  ) {
    return false;
  }
  const [a, b, c] = octets;
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 168) return false;
  if (a === 192 && b === 0 && c === 0) return false;
  if (a === 192 && b === 0 && c === 2) return false;
  if (a === 192 && b === 88 && c === 99) return false;
  if (a === 198 && (b === 18 || b === 19)) return false;
  if (a === 198 && b === 51 && c === 100) return false;
  if (a === 203 && b === 0 && c === 113) return false;
  if (a === 255) return false;
  return true;
}

export function isPublicIpAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return isPublicIpv4(address);
  if (family !== 6) return false;

  const value = parseIpv6(address);
  if (value === null) return false;

  const ipv4MappedPrefix = value >> 32n;
  if (ipv4MappedPrefix === 0xffffn) {
    const ipv4 = Number(value & 0xffffffffn);
    const octets = [(ipv4 >>> 24) & 255, (ipv4 >>> 16) & 255, (ipv4 >>> 8) & 255, ipv4 & 255];
    return isPublicIpv4(octets.join("."));
  }

  // Only global-unicast 2000::/3 is eligible; documentation space is excluded.
  const globalUnicast = value >> 125n;
  if (globalUnicast !== 1n) return false;
  const documentationPrefix = value >> 96n;
  if (documentationPrefix === 0x20010db8n) return false;
  return true;
}

function isForbiddenHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (!host || host === "localhost") return true;
  return [".localhost", ".local", ".internal", ".test", ".example", ".invalid", ".lan"].some(
    (suffix) => host.endsWith(suffix),
  );
}

export function validateEvidenceTarget(input: string): URL {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("Evidence target must be an absolute URL.");
  }

  if (url.protocol !== "https:") {
    throw new Error("Evidence target must use HTTPS.");
  }
  if (url.username || url.password) {
    throw new Error("Evidence target credentials are forbidden.");
  }
  if (url.port && url.port !== "443") {
    throw new Error("Evidence target must use the default HTTPS port.");
  }
  if (url.hash) {
    throw new Error("Evidence target fragments are forbidden.");
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (isForbiddenHostname(hostname)) {
    throw new Error("Evidence target hostname is not publicly routable.");
  }

  const family = isIP(hostname);
  if (family && !isPublicIpAddress(hostname)) {
    throw new Error("Evidence target IP address must be globally routable and public.");
  }
  return url;
}

async function resolvePublicAddress(hostname: string): Promise<PublicAddress> {
  const family = isIP(hostname);
  if (family) {
    if (!isPublicIpAddress(hostname)) {
      throw new Error("Evidence target IP address must be globally routable and public.");
    }
    return { address: hostname, family };
  }

  const addresses = await lookup(hostname, { all: true, verbatim: true });
  if (addresses.length === 0 || addresses.some((item) => !isPublicIpAddress(item.address))) {
    throw new Error("Evidence target resolves to a non-public or reserved IP address.");
  }
  const selected = addresses[0];
  return { address: selected.address, family: selected.family as 4 | 6 };
}

function requestPinned(
  url: URL,
  address: PublicAddress,
  maxBytes: number,
): Promise<{ status: number; location?: string; contentType?: string; bytes?: Uint8Array }> {
  return new Promise((resolve, reject) => {
    const hostname = url.hostname.replace(/^\[|\]$/g, "");
    const request = httpsRequest(
      {
        protocol: "https:",
        hostname,
        port: 443,
        path: `${url.pathname}${url.search}`,
        method: "GET",
        servername: isIP(hostname) ? undefined : hostname,
        lookup: (_host, _options, callback) => {
          callback(null, address.address, address.family);
        },
        headers: {
          "user-agent": "HEZQEN-EvidenceBot/1.0 (+https://hezqen.tinlance.com/methodology)",
          accept: "text/html,application/pdf,text/plain,application/json;q=0.9",
          "accept-encoding": "identity",
        },
      },
      (response) => {
        const status = response.statusCode ?? 0;
        const location = response.headers.location;
        const contentTypeHeader = response.headers["content-type"];
        const contentType = Array.isArray(contentTypeHeader)
          ? contentTypeHeader[0]
          : contentTypeHeader;
        if (REDIRECT_STATUSES.has(status)) {
          response.resume();
          response.on("end", () => resolve({ status, location }));
          return;
        }
        if (status < 200 || status >= 300) {
          response.resume();
          reject(new Error(`Evidence source returned HTTP ${status}.`));
          return;
        }

        const mimeType = contentType?.split(";")[0]?.trim().toLowerCase();
        if (!mimeType || !ALLOWED_CONTENT_TYPES.has(mimeType)) {
          response.resume();
          reject(new Error("Evidence source returned an unsupported content type."));
          return;
        }

        const declaredLength = Number(response.headers["content-length"] ?? 0);
        if (declaredLength > maxBytes) {
          response.resume();
          reject(new Error("Evidence source exceeds the configured size limit."));
          return;
        }

        const chunks: Buffer[] = [];
        let total = 0;
        response.on("data", (chunk: Buffer) => {
          total += chunk.length;
          if (total > maxBytes) {
            request.destroy(new Error("Evidence source exceeds the configured size limit."));
            return;
          }
          chunks.push(chunk);
        });
        response.on("end", () =>
          resolve({
            status,
            contentType: mimeType,
            bytes: Buffer.concat(chunks),
          }),
        );
        response.on("error", reject);
      },
    );

    request.setTimeout(REQUEST_TIMEOUT_MS, () => {
      request.destroy(new Error("Evidence source request timed out."));
    });
    request.on("error", reject);
    request.end();
  });
}

export async function acquireEvidence(
  input: string,
  options: { maxBytes?: number; maxRedirects?: number } = {},
): Promise<EvidenceAcquisition> {
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const maxRedirects = options.maxRedirects ?? MAX_REDIRECTS;
  if (!Number.isInteger(maxBytes) || maxBytes < 1 || maxBytes > 50 * 1024 * 1024) {
    throw new RangeError("maxBytes must be an integer between 1 byte and 50 MiB.");
  }
  if (!Number.isInteger(maxRedirects) || maxRedirects < 0 || maxRedirects > 5) {
    throw new RangeError("maxRedirects must be an integer between 0 and 5.");
  }

  let current = validateEvidenceTarget(input);
  for (let redirects = 0; ; redirects += 1) {
    const hostname = current.hostname.replace(/^\[|\]$/g, "");
    const address = await resolvePublicAddress(hostname);
    const response = await requestPinned(current, address, maxBytes);

    if (REDIRECT_STATUSES.has(response.status)) {
      if (!response.location || redirects >= maxRedirects) {
        throw new Error(
          "Evidence source exceeded the redirect limit or omitted its redirect target.",
        );
      }
      current = validateEvidenceTarget(new URL(response.location, current).toString());
      continue;
    }

    if (!response.bytes || !response.contentType) {
      throw new Error("Evidence source response did not contain a preserved body.");
    }

    return {
      finalUrl: current.toString(),
      contentType: response.contentType,
      bytes: response.bytes,
      sha256: createHash("sha256").update(response.bytes).digest("hex"),
      retrievedAt: new Date().toISOString(),
    };
  }
}
