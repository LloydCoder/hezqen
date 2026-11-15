# HEZQEN Infrastructure Discovery and Hosting Assessment

**Last reconciled:** 2026-11-15  
**Canonical launch target:** `https://hezqen.tinlance.com`  
**Decision:** Keep HEZQEN isolated. Evaluate Cloudflare Workers without changing DNS or shared product infrastructure. No production deployment is authorized by this document.

## 1. Scope and safety boundaries

- The public HEZQEN hostname is `hezqen.tinlance.com`, under the existing `tinlance.com` zone.
- Do not use `hezqen.com`, a Vercel alias or a temporary preview host as the public launch identity.
- Do not alter `tinlance.com` apex, `www`, mail, or existing product DNS records.
- Do not repurpose the `tinlyt-api-production` Cloudflare tunnel.
- Do not attach HEZQEN to Tinlyt, Kalevio, ThreatFade, Hezqara or any other product database, bucket, tunnel or service.
- Keep staging and production databases separate. Do not run migrations against shared Neon branches without an explicit release approval and verified backup.
- Do not upgrade to a paid Cloudflare Workers plan, create billable resources, or accept new recurring charges without explicit cost approval.
- **Vercel remains an approved hosting option** and is the current standard Node.js deployment target under evaluation. The existing `hezqen` Vercel project is linked to this repository on the Hobby plan. `vercel.json` currently disables Git-triggered deployments while the team is consuming the daily deployment allowance through iterative engineering; this is a temporary deployment-throttling control, not a decision to remove Vercel. Use controlled deployments only after GitHub CI is green. Do not upgrade the plan or incur charges without explicit cost approval.

## 2. Cloudflare account inventory (read-only)

The connected Cloudflare account was inspected on 2026-11-15:

| Resource | Observed state | HEZQEN consequence |
|---|---|---|
| Zones | `tinlance.com` and `threatfade.com` are active; `tinlance.com` shows the Free Website plan | The existing zone can host the HEZQEN subdomain after acceptance. |
| DNS | No `hezqen.tinlance.com` record exists | Correctly remains unattached while hosting is evaluated. |
| Workers | No Worker scripts listed | No existing Worker runtime can be reused. |
| Pages | No Pages projects listed | Pages is not an existing hosting surface. |
| R2 | R2 is not enabled for the account; API reports enablement is required before bucket operations | No HEZQEN object storage exists. Do not enable or create a bucket until media/evidence storage is designed and cost reviewed. |
| Hyperdrive | No Hyperdrive configurations listed | No Cloudflare database pooling configuration exists. |
| Access | No Cloudflare Access applications listed | No HEZQEN admin Access policy exists. |
| Tunnels | One inactive tunnel named `tinlyt-api-production` | Reserved for Tinlyt; do not reuse. |
| Zone SSL mode | The zone-wide setting reports `Flexible` | Do not change it as part of HEZQEN work; it is shared zone configuration and needs a separate origin-by-origin review. |

No Cloudflare DNS, SSL, Worker, Pages, R2, Hyperdrive, Access or Tunnel resource was created, deleted or modified during this inspection.

## 3. Cloudflare Workers suitability

Cloudflare's current Next.js guidance recommends vinext for new Next.js-on-Workers deployments. Cloudflare documents vinext as beta and instructs teams to run its compatibility check and review the compatibility dashboard before production adoption:

- [Cloudflare Next.js on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
- [Cloudflare Vercel-to-Workers migration guide](https://developers.cloudflare.com/workers/static-assets/migration-guides/vercel-to-workers/nextjs/)
- [vinext documentation](https://vinext.dev/docs)

The HEZQEN repository has a pinned, non-deploying compatibility workflow. It reported 86% compatibility, with 10 supported features, 4 partial-support findings and no hard issues. The partial findings include Turbopack/webpack loader behavior, typed-route generation and React Strict Mode behavior. A compatibility score is not proof of runtime acceptance.

The mainline Cloudflare workflow runs a compatibility check and a separate local Worker build/HTTP smoke job using ephemeral PostgreSQL. At main commit `5877dac0424fe5d25a4c36fd94140e4406d693ae`, both the compatibility-check job and the Worker build/smoke job passed, including ephemeral Payload migration and public/CMS route smoke tests. This validates the isolated Worker candidate only; Cloudflare Workers + vinext remains a beta alternative, not an automatic replacement for Vercel.

### Application dependencies and known gates

- Application stack: Next.js 16.4.6, React 19.3.1 and Payload CMS 3.93.0.
- Payload uses the PostgreSQL adapter with Postgres.js. Cloudflare documents Hyperdrive as included in Workers Free and Paid plans, with 100,000 database queries/day on Free; a HEZQEN Hyperdrive config has not been created.
- The current Payload collections do not declare upload fields, and `src/payload.config.ts` no longer imports or configures native Sharp. The `sharp` package remains in the dependency graph. Cloudflare Worker compatibility is validated only by the isolated Worker build and route smoke tests; removing a config import alone is not runtime acceptance.
- No current collection provides a media upload endpoint or evidence object storage. Do not infer that R2 is required for the current public shell; it is a prerequisite for the future private evidence vault and any upload feature.
- No application cache binding, durable object or queue is configured. Avoid adding these until workload and invalidation semantics are specified.

### Cost and limits

Cloudflare documents the default Workers Free plan as 100,000 requests/day and 10 ms CPU per invocation. Workers Paid has a $5/month account minimum and higher included usage; Hyperdrive is included in Free and Paid with 100,000 queries/day on Free. The current zone Website plan does not establish which Workers billing plan is enabled for the account. Verify the Workers plan and usage before any deployment that may incur charges.

### R2 evidence-storage economics and immutability

R2 Standard storage currently includes a monthly free tier of 10 GB-month, 1 million Class A operations and 10 million Class B operations, with zero egress fees. Above the free tier, published rates are $0.015/GB-month, $4.50/million Class A and $0.36/million Class B. Infrequent Access has no free tier and adds retrieval charges; it is not the default recommendation for active evidence custody. R2 supports bucket-lock rules that prevent overwrite/deletion for a specified age, date or indefinitely, and lifecycle rules for retention/transition. Bucket locks override lifecycle deletion and cannot be emptied while configured. R2 documents strong global consistency for object reads/writes/deletes.

For HEZQEN, R2 Standard is a plausible future private evidence store, but it is not provisioned or enabled. Before using bucket locks, define source confidentiality, legal holds, retention periods, data-subject erasure obligations and evidence preservation policy. Do not apply indefinite retention by default. A dedicated EU jurisdiction/location may be evaluated against data-residency requirements; do not assume that the Neon Frankfurt region automatically determines R2 jurisdiction.

- [R2 pricing](https://developers.cloudflare.com/r2/pricing/)
- [R2 bucket locks](https://developers.cloudflare.com/r2/buckets/bucket-locks/)
- [R2 object lifecycles](https://developers.cloudflare.com/r2/buckets/object-lifecycles/)
- [R2 consistency](https://developers.cloudflare.com/r2/reference/consistency/)

- [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Hyperdrive pricing](https://developers.cloudflare.com/hyperdrive/platform/pricing/)

A server-rendered CMS workload may exceed the Free CPU allowance; measure actual Worker CPU time and request volume under realistic workloads. Do not upgrade plans automatically.

## 4. Neon PostgreSQL inventory

A dedicated Neon project named `hezqen-core` exists in `aws-eu-central-1` (Frankfurt), PostgreSQL 18, with 0.25 CU minimum/maximum compute. Branches named `main`, `staging` and `production` exist.

Read-only inspection on 2026-11-15 returned:

| Branch | Database | Role | Public tables |
|---|---|---|---:|
| Staging | `hezqen` | `hezqen_app` | 0 |
| Production | `hezqen` | `hezqen_app` | 0 |

No schema migration has been applied to the shared staging or production branches. The initial Payload migration is checked into `src/migrations/` and is tested by GitHub Actions against ephemeral PostgreSQL. The CI database is not the shared Neon project.

The configured branch-to-environment mapping must still be verified without exposing connection strings. Before staging migration:
1. Verify the Preview/staging `DATABASE_URL` points to the staging branch.
2. Verify the production `DATABASE_URL` points to the production branch.
3. Take a backup or Neon restore point and document recovery steps.
4. Obtain approval for the staging migration.
5. Apply only the reviewed migration to staging and verify schema, login, API access and restore.
6. Production migration remains a separate approved release step.

The Neon migration connector requires explicit approval before applying changes to a shared branch. Do not bypass that control.

## 5. Environment contract

Production CMS configuration requires:

- `DATABASE_URL`: dedicated HEZQEN branch only.
- `PAYLOAD_SECRET`: unique high-entropy secret, never committed or printed.
- `NEXT_PUBLIC_SITE_URL`: `https://hezqen.tinlance.com` in production.
- `HEZQEN_ALLOWED_ORIGINS`: exact HTTPS origin `https://hezqen.tinlance.com` in production; do not use wildcard origins.

Local development uses localhost. A staging hostname must have its own explicit origin and matching site URL. Do not allow arbitrary preview domains. Do not copy secrets between staging and production.

## 6. Hosting, domain and TLS cutover

Vercel remains an approved deployment target for the standard Node.js Next.js + Payload runtime. Cloudflare remains complementary for authoritative DNS and edge security, with Workers + vinext retained as a separately evaluated beta alternative. No host or custom domain is accepted for production yet.

The safe sequence is:

1. Complete application, CMS, security and operational acceptance on an isolated Vercel preview using the dedicated Neon staging branch. Keep Git-triggered deployments disabled while the Hobby daily deployment limit is being conserved; do not create repeated builds to probe the limit.
2. Verify environment mapping, runtime logs, database connectivity, auth/CSRF, all public routes, all sixteen Labs routes, error handling and rollback.
3. Verify the Vercel plan and cost ceiling. Do not upgrade the plan or add paid resources without approval.
4. Add `hezqen.tinlance.com` to the existing HEZQEN Vercel project only after acceptance. Coordinate the exact DNS record in the existing Cloudflare `tinlance.com` zone as a separate release operation; no record currently exists.
5. Keep the apex, `www`, mail and every other product record unchanged. Do not alter the zone-wide SSL mode as part of this cutover.
6. If Cloudflare Workers is later selected instead, first pass the full Worker build and route/CMS acceptance on an isolated `workers.dev` hostname, then review its beta status, plan and measured cost before any custom-domain operation.
7. Verify HTTPS, redirects, canonical URLs, robots, sitemap, Open Graph and Payload CORS/CSRF after the approved host/domain attachment.

References: [Vercel deployment limits](https://vercel.com/docs/limits), [Cloudflare Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

## 7. Operational gaps

The following are not yet evidenced as complete:

- Dedicated private object storage and lifecycle/retention policy.
- Backup schedule, point-in-time recovery verification and a completed restore drill.
- Monitoring for uptime, errors, latency, CPU, database connectivity and queue failures.
- Alert routing, incident ownership, incident runbooks and rollback exercise.
- Authorized transactional email sender, SPF/DKIM/DMARC alignment and delivery monitoring.
- Staging admin bootstrap and role-by-role authorization verification.
- Production secrets and environment wiring for the selected host.
- Legal trademark clearance and brand/domain review. The supplied logo kit explicitly states HEZQEN has not been legally cleared.

## 8. Current Vercel project evidence

Read-only inspection on 2026-11-15 confirmed an existing Vercel project named `hezqen`, linked to `LloydCoder/hezqen`, using the Next.js framework and the Hobby plan. The project has the system aliases `hezqen.vercel.app`, `hezqen-lloydcoders-projects.vercel.app` and `hezqen-git-main-lloydcoders-projects.vercel.app`; only `hezqen.vercel.app` is listed as a verified project domain. `hezqen.tinlance.com` is not attached.

`vercel.json` currently sets `git.deploymentEnabled` to `false` to conserve the Hobby plan's 100-deployments-per-24-hours allowance during active implementation. This is a temporary operational control. It does not remove Vercel from the architecture or prevent a controlled deployment after CI passes.

A Vercel deployment from commit `9b0137c1842b27fd903057069434b0532939bc8c` failed during Payload config generation because `HEZQEN_ALLOWED_ORIGINS` was absent. This is distinct from the separate Vercel bot errors on the older PR #20, which reported the daily deployment limit. The follow-up implementation adds the exact `VERCEL_URL` deployment origin to Payload's allowlist and configures the canonical origin for Preview and Production. Re-run a controlled preview deployment after the branch is merged and the daily limit permits it; do not interpret either historical error as proof that Vercel is unsupported.

## 9. Explicit non-actions

- No DNS records or zone-wide SSL settings were changed.
- No Worker, Pages project, R2 bucket, Hyperdrive config or Access application was created.
- The Tinlyt tunnel was not modified or repurposed.
- No Neon migration was applied to staging or production.
- No paid plan was enabled and no production deployment was made.
