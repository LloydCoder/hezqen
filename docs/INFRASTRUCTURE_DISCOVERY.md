# Infrastructure Discovery Record

**Captured:** 2026-11-15  
**Scope:** HEZQEN-specific infrastructure provisioning and isolation  
**Decision:** Keep HEZQEN isolated from existing Tinlance product data and production workloads.

## Confirmed resources

- A dedicated Vercel project named `hezqen` exists in the Tinlance Vercel team and is linked to `LloydCoder/hezqen`.
- The project is configured for Next.js and Node.js 24.x. Preview deployments are protected by Vercel team SSO; custom domains are exempt from deployment protection.
- A production deployment for commit `58f6ceed82c44a97ef98c4443b4cbabc931569b7` reached Vercel state `READY` and has aliases `hezqen.vercel.app`, `hezqen-lloydcoders-projects.vercel.app`, and `hezqen-git-main-lloydcoders-projects.vercel.app`.
- GitHub Actions CI for that main commit completed successfully. This proves the configured CI job and deployment build completed; it does not prove every future phase or every public route has been independently browser-tested.
- A dedicated Neon project `hezqen-core` exists in `aws-eu-central-1`, PostgreSQL 18, with minimum and maximum compute both set to 0.25 CU.
- Neon branches `main`, `staging`, and `production` exist. Staging and production branch compute endpoints are provisioned and idle. The staging endpoint has transaction pooling enabled.
- A sensitive `DATABASE_URL` and `PAYLOAD_SECRET` were stored in the HEZQEN Vercel project's **Preview** environment only. The configured URL points to the staging branch's pooled endpoint. Secret values are intentionally not recorded in Git.
- The project has a canonical URL environment value set to `https://hezqen.tinlance.com` for Preview. This hostname is not yet attached to the Vercel project.

## Isolation decisions

- Do not repurpose the Vercel project currently serving `tinlance.com`.
- Do not alter apex or `www` DNS records.
- Do not attach HEZQEN to Tinlyt, Kalevio, ThreatFade, Hezqara or other product databases.
- No new AWS account infrastructure is being provisioned for HEZQEN. Neon itself currently reports AWS as its underlying platform in the Frankfurt region; its commercial usage and billing are governed by Neon, not by a HEZQEN-owned AWS account.
- Do not create or modify DNS records until the HEZQEN application has passed preview deployment and domain validation.
- Use only the dedicated HEZQEN Neon project and a dedicated HEZQEN object-storage namespace for future persistence.

## Outstanding infrastructure gates

- Apply and verify the versioned HEZQEN database schema on both staging and production branches.
- Store a distinct production `DATABASE_URL` and production `PAYLOAD_SECRET` in the Vercel Production environment after the production schema and access model are reviewed.
- Verify backup/restore and point-in-time recovery settings; no restore drill is evidenced yet.
- Provision dedicated media/object storage and lifecycle rules.
- Attach and validate `hezqen.tinlance.com` only after the release gate is satisfied.
- Configure and verify email sender authorization, monitoring, alerting and retention.
- Complete trademark and domain clearance for HEZQEN and `hezqen.com`.

## Current Vercel project

The `hezqen` project is separate from the existing Tinlance website project. Its production Vercel deployment is READY on the `hezqen.vercel.app` alias. The branded Tinlance subdomain remains pending. The existing `tinlance.com` project and DNS are out of scope and must remain untouched.
