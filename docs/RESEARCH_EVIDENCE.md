# HEZQEN Research Evidence and Claim Verification

## Purpose

HEZQEN research must preserve the chain between a published claim, the source supporting it, and the evidence captured from that source. A URL citation alone is not proof that the underlying material was preserved or independently checked.

## Source record

A source record identifies the publisher and original material:
- Stable internal source ID
- Canonical source URL (HTTPS)
- Publisher and title
- Publication date when available
- Retrieval timestamp

The source validator rejects malformed URLs, non-HTTPS URLs, embedded URL credentials, missing publisher/title and inconsistent dates.

## Evidence record

An evidence record identifies a captured artifact:
- Stable evidence ID and source ID
- Collection method
- Retrieval timestamp
- SHA-256 digest
- Storage reference
- Verification status

The evidence validator checks required provenance metadata and digest shape. It does not itself download a URL, calculate a digest, prove that a storage object exists, or attest that captured content is authentic. Those operations belong to the acquisition and preservation service.

## Claim states

The domain recognizes:
- `verified`
- `corroborated`
- `attributed`
- `disputed`
- `unverified`
- `corrected`

The current verification gate permits a claim to pass only when:
1. Its state is explicitly `verified`.
2. It references at least one valid source.
3. It references at least one valid evidence record.
4. Every referenced evidence record is marked verified.
5. Every evidence record belongs to a source cited by the claim.

A citation without preserved evidence is insufficient for a verified claim. Missing references, invalid provenance, unverified evidence and source/evidence mismatches block the gate.

## Domain boundary and limitations

The current TypeScript module is a pure validation and assessment layer. It is not yet a database schema, immutable evidence vault, acquisition crawler, independent fact-checking engine, cryptographic signature system, or editorial approval service.

Before production use, implement:
- Server-side acquisition with SSRF protection and strict egress controls.
- Content-type and size limits; safe HTML/PDF parsing and malware scanning.
- Exact-byte preservation in private object storage with retention and access policies.
- SHA-256 calculation over the stored bytes, not caller-supplied digests.
- Append-only provenance and audit events.
- Database foreign keys and transactional claim/evidence/source relationships.
- Independent corroboration workflow and human fact-checker attestation.
- Evidence export and integrity verification.
- Direct API authorization tests and access logging.

Never fetch arbitrary user-supplied URLs from a privileged server without destination validation, DNS/IP checks, redirect revalidation, network egress restrictions and time/size limits.

## Acquisition guard

The server-side acquisition module now applies a conservative outbound-fetch policy:
- HTTPS only; default port only; no embedded credentials or fragments.
- Reject localhost and common private/local hostname suffixes.
- Reject private, loopback, link-local, documentation, multicast and reserved IP ranges.
- Resolve DNS before connecting; reject a hostname if any returned address is non-public.
- Pin the HTTPS request to the validated IP while retaining the original hostname for TLS SNI and certificate verification.
- Revalidate every redirect target and cap redirect count.
- GET only; no cookies or caller-supplied authorization headers.
- Accept only HTML, plain text, PDF and JSON.
- Enforce a response byte limit and request timeout.
- Calculate SHA-256 over the exact response bytes returned by the HTTPS response.

This is an initial defensive layer, not a substitute for network-level egress restrictions. Production deployment should also enforce outbound firewall policy, monitor DNS and redirect behavior, use a dedicated acquisition worker with no access to application secrets, and verify the stored object's checksum after upload. DNS pinning and address-range logic require security review before enabling acquisition against arbitrary public URLs.
