# Cloudflare hosting assessment — 2026-11-15

**Target hostname:** `https://hezqen.tinlance.com`  
**Hosting candidate:** Cloudflare Workers using the official vinext Next.js compatibility path  
**Decision:** Evaluate Cloudflare in isolation. Do not deploy, provision resources, or change DNS until the compatibility and runtime gates pass.

## Account inventory (read-only)

- The active Cloudflare zones are `tinlance.com` and `threatfade.com`; the `tinlance.com` zone is on the Free Website plan.
- The account currently has no Worker scripts and no Pages projects.
- R2 is not enabled for the account; the API requires R2 to be enabled in the Cloudflare dashboard before bucket inventory or provisioning is possible.
- No Hyperdrive configurations exist.
- No Cloudflare Access applications exist.
- The only listed tunnel is `tinlyt-api-production`, which is inactive. It is reserved for Tinlyt and must not be repurposed for HEZQEN.
- The `tinlance.com` DNS zone currently has no `hezqen.tinlance.com` record. Existing apex, `www`, mail and product records are out of scope.
- The zone-wide SSL mode currently reports `Flexible`. Do not change this setting as part of HEZQEN work: it affects other services in the zone and requires a separate origin-by-origin review.

## Application compatibility findings

- The application uses Next.js 16.4.6, React 19.3.1 and Payload CMS 3.93.0.
- The Payload PostgreSQL adapter uses the `postgres` (Postgres.js) driver. Cloudflare documents Postgres.js support on Workers and recommends Hyperdrive for pooled database connectivity; no Hyperdrive configuration currently exists.
- `src/payload.config.ts` imports and configures `sharp`. Cloudflare's current Next.js migration guidance explicitly calls out native modules such as Sharp for replacement. This is a compatibility gate, not a reason to remove Sharp without validating the current CMS behavior.
- The current seven Payload collections contain no upload fields. Reassess the Sharp dependency against the actual image-processing requirements before changing it.
- Cloudflare recommends vinext for new Next.js-on-Workers deployments. A pinned, non-deploying `vinext check` workflow has been added. Its result must be reviewed before running `vinext init`, modifying runtime configuration, or attempting a Worker build.
- Static Next.js on Pages is not a fit for the current server-rendered Payload CMS application. Pages currently has no project in the account.

## Safe rollout sequence

1. Run and review the pinned vinext compatibility check.
2. Resolve any critical Next.js, Payload, Sharp, Node.js API and Postgres connectivity incompatibilities in a separate branch.
3. Build and test locally as a Worker, including Payload admin, auth, all public routes, database access, cache behavior and error handling.
4. Deploy only to an isolated `workers.dev` staging hostname after the build and runtime checks pass.
5. Keep Neon staging and production branches isolated. Never run migrations against production during hosting evaluation.
6. Only after acceptance, attach `hezqen.tinlance.com` as a Worker Custom Domain. Cloudflare Custom Domains create the corresponding DNS record and certificate; do not pre-create a speculative DNS record.
7. Provision a dedicated HEZQEN object-storage namespace only if the product actually requires media storage. Do not use a shared product bucket.

## Explicit non-actions

- No DNS records were created or modified.
- No Worker, Pages project, R2 bucket, Hyperdrive, Access application or tunnel was created or changed.
- The Tinlyt tunnel and all existing Tinlance product DNS records remain untouched.
- No Vercel deployment was made. The repository's `vercel.json` disables Git-triggered deployments; Cloudflare is being evaluated as the replacement runtime.

---

# Infrastructure Discovery Record

**Captured:** 2026-11-15  
**Scope:** HEZQEN-specific infrastructure provisioning, deployment and environment isolation  
**Decision:** Keep HEZQEN isolated from existing Tinlance product data and production workloads.

## Confirmed resources

- A dedicated Vercel project named `hezqen` exists in the Tinlance Vercel team and is linked to `LloydCoder/hezqen`.
- The project is configured for Next.js. Its package engine range permits Node.js 24.22.3 and Node.js 26.13.1 or newer; Vercel currently selects Node.js 26.x because of that range, even though the project setting is 24.x.
- A production deployment for commit `58f6ceed82c44a97ef98c4443b4cbabc931569b7` previously reached Vercel state `READY` and had aliases `hezqen.vercel.app`, `hezqen-lloydcoders-projects.vercel.app`, and `hezqen-git-main-lloydcoders-projects.vercel.app`. A READY deployment does not establish acceptance of later commits or every route.
- The documentation-overhaul pull request deployment for commit `75793d3219246312fa6e0121a30ab823927cea9b` failed during the Payload import-map build step because `HEZQEN_ALLOWED_ORIGINS` was absent and the production-mode configuration rejects an empty origin allowlist. The same required variable is absent from the inspected Preview and Production environment-variable inventories.
- GitHub Actions CI for the documentation-overhaul commit passed dependency installation, lint, formatting, unit tests and dependency audit at the time of inspection; production build and remaining checks were still running. The final CI result must be read from the pull request checks.
- A dedicated Neon project `hezqen-core` exists in `aws-eu-central-1`, PostgreSQL 18, with minimum and maximum compute both set to 0.25 CU.
- Neon branches `main`, `staging`, and `production` exist. Staging and production branch compute endpoints are provisioned and idle. The staging endpoint has transaction pooling enabled.
- The Vercel Preview environment has entries for `DATABASE_URL`, `PAYLOAD_SECRET` and `NEXT_PUBLIC_SITE_URL`. The database variable's operator-supplied comment identifies the staging Neon branch.
- The Vercel Production environment has entries for `DATABASE_URL`, `PAYLOAD_SECRET` and `NEXT_PUBLIC_SITE_URL`. The database variable's operator-supplied comment identifies the production Neon branch.
- Both inspected environments set `NEXT_PUBLIC_SITE_URL` to `https://hezqen.tinlance.com`. The hostname is not yet attached to the Vercel project.
- Secret values are intentionally not recorded in Git or this document. The environment inventory was inspected without decrypting sensitive values.

## Required environment configuration

The Payload configuration requires all four variables in production mode:

- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `HEZQEN_ALLOWED_ORIGINS`

The last variable is currently missing from both inspected Vercel environments. It must contain the exact HTTPS origin that matches `NEXT_PUBLIC_SITE_URL`; paths, query strings and fragments are not valid origins.

Before the next deployment, the maintainer must configure and verify the allowed-origin list separately for Preview and Production. Preview CMS administration also requires a deliberate origin strategy: the canonical hostname alone will not authorize arbitrary per-deployment Vercel preview hostnames. Do not broaden the allowlist with wildcards or disable the origin validation to make a deployment pass.

## Isolation decisions

- Do not repurpose the Vercel project currently serving `tinlance.com`.
- Do not alter apex or `www` DNS records.
- Do not attach HEZQEN to Tinlyt, Kalevio, ThreatFade, Hezqara or other product databases.
- No new AWS account infrastructure is being provisioned for HEZQEN. Neon itself currently reports AWS as its underlying platform in the Frankfurt region; its commercial usage and billing are governed by Neon, not by a HEZQEN-owned AWS account.
- Do not create or modify DNS records until the HEZQEN application has passed preview deployment and domain validation.
- Use only the dedicated HEZQEN Neon project and a dedicated HEZQEN object-storage namespace for future persistence.

## Outstanding infrastructure gates

- Add and verify `HEZQEN_ALLOWED_ORIGINS` in Preview and Production, with an explicit origin strategy for preview admin access.
- Apply and verify the versioned HEZQEN database schema on both staging and production branches.
- Verify that Preview and Production database URLs point to their intended isolated Neon branches.
- Verify backup/restore and point-in-time recovery settings; no restore drill is evidenced yet.
- Provision dedicated media/object storage and lifecycle rules.
- Attach and validate `hezqen.tinlance.com` only after the release gate is satisfied.
- Configure and verify email sender authorization, monitoring, alerting and retention.
- Complete trademark and domain clearance for HEZQEN and `hezqen.com`.

## Current Vercel project

The `hezqen` project is separate from the existing Tinlance website project. The public production alias `hezqen.vercel.app` has had a READY deployment, but the latest documentation-overhaul preview deployment failed because the required origin allowlist is missing. The branded Tinlance subdomain remains pending. The existing `tinlance.com` project and DNS are out of scope and must remain untouched.
