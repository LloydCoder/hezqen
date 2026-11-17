# Dependency security exception: picomatch

**Status:** Temporary, locally mitigated; upstream release pending  
**Advisory:** GHSA-fc5q-39xc-vjpf / CVE-2026-112366  
**Affected lockfile package:** picomatch 4.0.7  
**Severity:** High (CVSS 4.0: 8.7)

## Exposure

The current dependency path is through Payload/Next.js build tooling:
@payloadcms/richtext-lexical -> @payloadcms/next -> next -> sass -> chokidar -> anymatch -> picomatch.

The advisory describes catastrophic regular-expression backtracking for attacker-controlled single-branch repeated extglobs such as +( *) and +(*a). The risk is relevant when untrusted glob patterns reach picomatch; HEZQEN does not intentionally expose a user-controlled glob-matching API.

## Mitigation

HEZQEN applies the upstream proposed fix from micromatch/picomatch PR #237, pinned to commit 1bf0d04563cb9ce568cf36efc5f6b7187d9911d5, as a local pnpm patch to 4.0.7. The patch collapses safe single-branch repeated-star extglobs to remove nested unbounded quantifiers. A regression test exercises hostile inputs, generated regex structure, and matching semantics.

The pnpm audit exception is scoped to this single GHSA because the registry advisory currently publishes no fixed package version. The exception does not suppress other advisories. It is a documented temporary waiver, not a claim that the package publisher has released a fix.

## Exit criteria

1. Upgrade to an official picomatch release that contains the same or a stronger fix.
2. Remove the local patch and direct test dependency if no longer needed.
3. Remove GHSA-fc5q-39xc-vjpf from audit.ignore.
4. Confirm pnpm audit --audit-level moderate passes without this exception.

**Review date:** 2026-12-17.
