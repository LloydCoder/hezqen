# HEZQEN Infrastructure Discovery and Hosting Assessment

**Last reconciled:** 2026-11-16  
**Canonical launch target:** `https://hezqen.tinlance.com`  
**Decision:** No commercially permitted production host is currently approved. The existing Vercel project is on Hobby and is not suitable for HEZQEN's commercial publication. Cloudflare Workers/vinext has compatibility/build CI but full Payload CMS, admin, authentication and database runtime acceptance remains incomplete. The public hostname is attached and serves an earlier HEZQEN shell; a READY Preview exists for PR #52's merge commit, but staging SSO blocks live acceptance. No production deployment or cutover is approved by this assessment.

## 1. Scope and safety boundaries

- The public HEZQEN hostname is `hezqen.tinlance.com`, under the existing `tinlance.com` zone.
- Do not use `hezqen.com`, a Vercel alias or a temporary preview host as the public launch identity.
- Do not alter `tinlance.com` apex, `www`, mail, or existing product DNS records.
- Do not repurpose the `tinlyt-api-production` Cloudflare tunnel.
- Do not attach HEZQEN to Tinlyt, Kalevio, ThreatFade, Hezqara or any other product database, bucket, tunnel or service.
- Keep staging and production databases separate. Do not run migrations against shared Neon branches without an explicit release approval and verified backup.
- Do not upgrade to a paid Cloudflare Workers plan, create billable resources, or accept new recurring charges without explicit cost approval.
- The repository's `vercel.json` disables automatic Git-triggered Vercel deployments. Vercel remains an approved hosting option; a manual preview deployment from current main is READY and SSO-protected. No production deployment or custom-domain attachment has been made.

## 2. Cloudflare account inventory (read-only)

The connected Cloudflare account was inspected on 2026-11-15:

| Resource | Observed state | HEZQEN consequence |
|---|---|---|
| Zones | `tinlance.com` and `threatfade.com` are active; `tinlance.com` shows the Free Website plan | The existing zone can host the HEZQEN subdomain after acceptance. |
| DNS | No `hezqen.tinlance.com` record exists | Correctly remains unattached while hosting is evaluated. |
| Workers | No Worker scripts listed; the account Workers subdomain is `nwachukwuchinaemerem8.workers.dev` | No existing Worker runtime can be reused. The subdomain exists, but no HEZQEN Worker is deployed. |
| Pages | No Pages projects listed | Pages is not an existing hosting surface. |
| R2 | A fresh read-only API request returned HTTP 403 / error 10042: “Please enable R2 through the Cloudflare Dashboard.” | R2 is not enabled and no HEZQEN object storage exists. Enabling it requires a dashboard action; do not enable or create a bucket until media/evidence storage is designed and cost reviewed. |
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


### Latest isolated runtime evidence (2026-11-15)

The PR #42 compatibility run built the Worker successfully and served the public page, Labs, infrastructure catalogue, sitemap/robots, and liveness/readiness endpoints. The Payload REST collection endpoint `GET /api/articles` returned HTTP 500; the local Workers runtime reported that it cancelled the request after detecting a hung Worker. This is a real unresolved CMS API compatibility failure, not a passing CMS test. The CMS/admin workflow has therefore **not** been accepted on Workers. The compatibility workflow's smoke-test scope is limited to the public routes and health contract that passed; it must not be interpreted as CMS compatibility. Vercel remains the approved production host. Keep Workers/vinext as a beta alternative until the Payload REST API, admin interactions, authentication, database connectivity and representative write operations pass isolated runtime tests. Do not deploy a Worker or change DNS on the basis of the public-route smoke test.

A separate pull request adds a local Worker build and HTTP smoke test using an ephemeral PostgreSQL service. It also verifies the Payload migration in ephemeral PostgreSQL. The evaluation must pass all build and route checks before Cloudflare is selected. The Worker must be exercised for public routes, Labs, robots/sitemap, Payload admin, authentication and CMS APIs. Do not merge a failed or incomplete hosting evaluation.

### Application dependencies and known gates

- Application stack: Next.js 16.4.6, React 19.3.1 and Payload CMS 3.93.0.
- Payload uses the PostgreSQL adapter with Postgres.js. Cloudflare documents Hyperdrive as included in Workers Free and Paid plans, with 100,000 database queries/day on Free; a HEZQEN Hyperdrive config has not been created.
- The current Payload collections do not declare upload fields. The existing Payload config imports Sharp. Cloudflare's migration guidance specifically warns to replace native modules such as Sharp when moving to Workers. A separate TDD branch evaluates removing the Sharp runtime configuration because the present collections do not use upload transforms. Keep this decision isolated until the Worker build and CMS tests prove the behavior.
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

Read-only table inventory returned zero application tables on `main`, `staging` and `production`. The project has no snapshots, and all three automatic snapshot schedules are empty; history retention is 21,600 seconds (6 hours). Backup/restore is not configured or tested. Neon's backup-schedule API requires a paid plan, so automated snapshot scheduling is not available on this Free v3 project without a plan change. See [Neon backup schedule API](https://api-docs.neon.tech/reference/setsnapshotschedule) and [history window limits](https://neon.com/docs/postgres/backup-restore/history-window). No schema migration has been applied to the shared staging or production branches. The initial Payload migration is checked into `src/migrations/` and is tested by GitHub Actions against ephemeral PostgreSQL. The CI database is not the shared Neon project.

The Vercel environment inventory contains Preview and Production `DATABASE_URL` secrets. The Preview variable is described as the staging Neon branch; the Production variable is described as the production branch. Secret values were not decrypted or exposed, so exact host-to-branch mapping remains unverified. The configured branch-to-environment mapping must still be verified without exposing connection strings. Before staging migration:
1. Verify the Preview/staging `DATABASE_URL` points to the staging branch.
2. Verify the production `DATABASE_URL` points to the production branch.
3. Take a backup or Neon restore point and document recovery steps.
4. Obtain approval for the staging migration.
5. Apply only the reviewed migration to staging and verify schema, login, API access and restore.
6. Production migration remains a separate approved release step.

The Neon migration connector requires explicit approval before applying changes to a shared branch. The current Free v3 project has no protected branches; until an approved plan change is available, enforce change control through migration PR review, explicit migration approval, restricted connector access, and a verified backup/restore procedure. Do not bypass that control.

## 5. Environment contract

Production CMS configuration requires:

Vercel provides `VERCEL_URL` and `VERCEL_ENV` for each deployment. The Payload origin resolver adds the exact Vercel hostname only when `VERCEL_ENV=preview`; it uses the canonical `NEXT_PUBLIC_SITE_URL` in Production. The configured `HEZQEN_ALLOWED_ORIGINS` value remains the exact canonical origin in Preview and Production. No wildcard or forwarded-host trust is introduced. The `HEZQEN_LOCAL_RUNTIME_TEST` exception is enabled only in the ephemeral Cloudflare CI harness together with `CI=true`; it is not set in Vercel.


- `DATABASE_URL`: dedicated HEZQEN branch only.
- `PAYLOAD_SECRET`: unique high-entropy secret, never committed or printed.
- `NEXT_PUBLIC_SITE_URL`: `https://hezqen.tinlance.com` in production.
- `HEZQEN_ALLOWED_ORIGINS`: exact HTTPS origin `https://hezqen.tinlance.com` in production; do not use wildcard origins.

Local development uses localhost. A staging hostname must have its own explicit origin and matching site URL. Do not allow arbitrary preview domains. Do not copy secrets between staging and production.

## 6. Domain and TLS cutover

Cloudflare Custom Domains can create the DNS record and issue the required certificate automatically after an active Worker exists. Cloudflare cautions that a custom domain cannot be created on a hostname that already has a CNAME record. The intended sequence is therefore:

1. Complete and accept the Worker runtime evaluation.
2. Deploy to an isolated `workers.dev` staging hostname.
3. Pass CMS, public-route, security, accessibility, performance and rollback checks.
4. Verify the intended Workers plan and cost ceiling.
5. Only then attach `hezqen.tinlance.com` as a Worker Custom Domain; let Cloudflare manage the record and certificate.
6. Verify HTTPS, redirects, canonical URLs, robots, sitemap, Open Graph and admin CORS/CSRF.
7. Do not modify the apex or `www` DNS records.

Reference: [Cloudflare Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

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

Read-only inspection on 2026-11-15 confirmed an existing Vercel project named `hezqen`, linked to `LloydCoder/hezqen`, using Next.js and Node.js 24.x. The project is on the Hobby plan with `live=false`. The project domain inventory contains only `hezqen.vercel.app`; `hezqen.tinlance.com` is not attached. Preview SSO protection is enabled.

The READY Preview from PR #35 head `c56f59b16ae20f2625346c91de6239fc17b3f8da` is available at https://hezqen-ix8xrxv5s-lloydcoders-projects.vercel.app. The PR merged as `3888d2ccb9d77c1398c39a53fd5f969f472025b1`. The package engine is pinned to Node 24.x, matching the Vercel project setting and GitHub Actions CI. The preview build completed successfully with this pin and generated the homepage, all four divisions, the Infrastructure catalog, Labs, all sixteen calculator routes, Payload admin/API routes, robots.txt and sitemap.xml.

The Hobby plan has documented limits of 100 deployments per 24 hours, 32 builds per hour and one concurrent build. `vercel.json` sets `git.deploymentEnabled` to false to conserve the allowance during iterative implementation. See [Vercel limits](https://vercel.com/docs/limits) and [Hobby plan](https://vercel.com/docs/plans/hobby). This is a temporary throttling control, not a decision to remove Vercel. Use controlled deployments after GitHub CI passes; do not upgrade the plan without cost approval.

Do not treat a preview alias as a production domain. No custom-domain attachment, production deployment or DNS cutover has been made.

## 9. Explicit non-actions

- No DNS records or zone-wide SSL settings were changed.
- No Worker, Pages project, R2 bucket, Hyperdrive config or Access application was created.
- The Tinlyt tunnel was not modified or repurposed.
- No Neon migration was applied to staging or production.
- No paid plan was enabled and no production deployment was made.


## 10. Authoritative infrastructure reconciliation — 2026-11-16

This section supersedes the older 2026-11-15 inventory statements above where they conflict with current provider state.

### Vercel

- Project `hezqen` is Node 24.x on the Hobby plan; project metadata reports `live=false`.
- The custom domains `hezqen.tinlance.com`, `admin.hezqen.tinlance.com`, `staging.hezqen.tinlance.com` and `www.hezqen.tinlance.com` are attached and verified.
- READY Preview deployment `dpl_26VkrhKLuH93iMBxpEEczkQZimVk` points to PR #52 merge commit `c71e6b7d1bffcf677b73454f959b99a593c269f0`. It is not a Production-target deployment.
- The staging hostname has an explicit alias assignment to that Preview deployment. Vercel SSO still redirects external staging fetches to login; a temporary 10-minute bypass was ineffective and revoked.
- The newest Production-target deployment points to old commit `1ab4076cbf76bd505f53ffd319711bf68d2e7b46`; the public main hostname serves the earlier shell, not the CMS/public-reader release.
- Vercel Hobby is not an acceptable commercial production host. No Pro upgrade or recurring paid plan is approved.

### Cloudflare

- Zone `tinlance.com` remains active. The staging DNS record is a DNS-only CNAME to Vercel target `2f37e089d5bcfcf5.vercel-dns-017.com`.
- Worker `hezqen-scheduler` exists and exports a `scheduled` handler, but its Cron Trigger schedule list is empty. Do not enable it until staging authentication and due-only publication acceptance pass.
- The scheduler Worker is not the HEZQEN web application. No Cloudflare production web Worker deployment was created.
- The isolated vinext compatibility/build workflow is not proof of Payload CMS, admin, authentication, Hyperdrive or production database connectivity.

### Neon

- Project `old-bird-82399990` has isolated `staging` branch `br-lucky-bird-bayxt3by` and `production` branch `br-aged-surf-bavls0wu`; both are unprotected on the current plan.
- Staging has 18 public tables and two recorded Payload migrations. It contains one active administrator and no articles, audit events, evidence or claims.
- The private `hezqen-evidence` bucket exists and contains no objects.
- Production has zero public application tables and remains unmigrated.
- The staging `hezqen_cms` role is restricted and does not have role/database creation, replication or RLS bypass attributes. The separate `hezqen_app` role has elevated owner-like privileges and must not be used by the application runtime.
- Vercel Preview `DATABASE_URL` metadata is sensitive and its value was not decrypted; the intended runtime role/endpoint mapping remains unverified. Production `DATABASE_URL` mapping is likewise unverified.

### Release decision

No production database migration, production deployment, production DNS cutover, paid-plan upgrade, production administrator bootstrap or scheduler activation has occurred. Select a commercially permitted host, complete staging operational acceptance, prove least-privilege runtime DB credentials, and pass backup/restore, security, accessibility, monitoring and rollback gates before any production cutover.


## 11. Commercial hosting decision research — 2026-11-16

Official provider documentation was rechecked before selecting a production path:

- Vercel states Hobby is for personal/non-commercial use; Pro is designed for professional and business use. Current listed Pro base price is USD $20/month with USD $20 included usage credit; additional usage may be charged. Sources: [Vercel pricing](https://vercel.com/pricing), [Vercel Terms of Service — Hobby Plan](https://vercel.com/legal/terms), [Vercel fair-use guidelines](https://vercel.com/docs/limits/fair-use-guidelines).
- Cloudflare Workers Free currently has a 10 ms CPU limit per invocation and 100,000 requests/day. Cloudflare documents that SSR/auth-heavy workloads typically use 10–20 ms. Workers Paid has a USD $5/month account minimum and substantially higher CPU limits. Sources: [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/).
- Cloudflare recommends vinext for Next.js on Workers but explicitly labels vinext beta and instructs teams to run compatibility checks before production adoption. Source: [Cloudflare Next.js on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/).

**Engineering recommendation:** Vercel Pro is the lowest-migration-risk production candidate because HEZQEN is already a Next.js + Payload application and the current project has a READY Vercel Preview for the merged code. It is not approved or activated because no recurring billing authorization has been given. Cloudflare Workers Paid is a viable cost-comparison candidate only after full Payload/admin/auth/database integration tests and a measured runtime benchmark; Workers Free should not be assumed suitable for the full CMS workload under its 10 ms CPU ceiling. No provider plan was upgraded and no billable resource was created.
