# HEZQEN Production Hosting Decision

**Reviewed:** 2026-11-17  
**Decision:** HOLD PRODUCTION RELEASE — CURRENT HOSTING PLAN IS NOT APPROVED FOR COMMERCIAL PUBLICATION  
**Owner:** Tinlance

## Executive decision

Do not deploy the commercial HEZQEN publication or private editorial/CMS data to the current Vercel Hobby plan.

The project is a commercial publication owned and operated by Tinlance. Vercel's Hobby plan is restricted to personal, non-commercial use. Vercel's current Terms of Service also state that content submitted under Hobby (and trial Pro) may be used to train or improve AI/ML models and shared with third parties for model training, subject to the terms and available account controls.

This is both a commercial-terms issue and a data-governance issue. Do not put private drafts, unpublished investigations, source evidence, contributor personal data or subscriber records on the Hobby deployment while the account's current terms and opt-out settings remain unresolved.

## Verified provider constraints

### Vercel

- Hobby: free plan intended for personal, non-commercial use.
- Pro: currently listed at USD 20/month, with usage-based charges and a monthly usage credit. Confirm current billing terms before selecting it.
- Vercel's Terms of Service (effective June 1, 2026) include a Hobby/trial-Pro content training provision. The terms describe account-level controls for opting out and state that Pro content is not used for training by default unless the customer opts in.
- Existing HEZQEN Next.js/Payload architecture has already been built around Vercel, so Pro is the lowest migration-risk option, but it introduces recurring spend.

Official references:
- [Vercel Pricing](https://vercel.com/pricing)
- [Vercel Terms of Service](https://vercel.com/legal/terms)

### Cloudflare Workers

- Workers Free currently has a 100,000-request daily limit, 10 ms CPU time per request, 128 MB memory and other subrequest/connection limits.
- Workers Paid currently starts at USD 5/month and provides a substantially larger included request and CPU budget.
- Static assets can be served separately from Worker compute; this may make a static-first public frontend attractive.
- HEZQEN's full Next.js + Payload runtime includes server rendering, authentication, database access and editorial APIs. A local compatibility build or isolated fixture smoke test is not proof that the complete production workload fits the Free CPU budget.
- Cloudflare's general Free website plan is positioned for personal/hobby and non-business-critical use. The exact commercial rights for the specific Workers plan and account must be checked against the applicable service terms before production use; do not infer permission from technical availability.

Official references:
- [Cloudflare Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Cloudflare Plans](https://www.cloudflare.com/plans/)

## Options

| Option | Approximate recurring cost | Fit | Status |
|---|---:|---|---|
| Vercel Hobby | USD 0 | Not permitted for commercial HEZQEN; content-training terms require review | REJECT for commercial production |
| Vercel Pro | USD 20/month base plus applicable usage/overage | Lowest migration risk for existing Next.js/Payload app | Technically preferred; spend not approved |
| Cloudflare Workers Free | USD 0 | CPU/runtime limits may be unsuitable; commercial terms need confirmation | Pilot only; not approved for production |
| Cloudflare Workers Paid | USD 5/month base plus applicable usage | Potentially lower cost; full Payload compatibility and operational fit unproven | Candidate for controlled pilot |
| Self-managed Node hosting | Provider-dependent | Full Node/Payload compatibility, but introduces patching, backups, monitoring and on-call responsibility | Candidate only after cost/ops review |

These are provider list-price references, not a complete cost estimate. Database, object storage, email, egress, backups, observability and tax may add costs.

## Recommended decision path

1. Keep production deployment and DNS cutover on hold.
2. Preserve the existing Vercel Hobby environment only for non-sensitive, non-commercial development/preview work until its terms are reviewed.
3. Run the Cloudflare compatibility workflow and a controlled runtime pilot using an isolated database fixture. Measure actual CPU time, memory, response latency and Payload admin/API behaviour.
4. Verify the applicable Cloudflare service terms and commercial-use permission for the exact Workers plan/account.
5. Compare the complete monthly cost and operational burden of Cloudflare Workers Paid against Vercel Pro.
6. Select a commercially permitted host and obtain explicit recurring-spend approval before upgrading or provisioning paid resources.
7. Only then migrate production secrets/data, run production migrations, perform backup/restore, and execute production acceptance.

## Non-negotiable controls

- Do not bypass Vercel Hobby restrictions by describing commercial publication traffic as personal use.
- Do not rely on a temporary trial as a permanent production solution.
- Do not disable Vercel deployment protection to work around staging SSO.
- Do not deploy private evidence, drafts or subscriber data until data-processing and AI-training terms are acceptable.
- Do not change DNS, production database roles, secrets or production migrations until the hosting decision and rollback plan are approved.
- Do not claim production readiness from green CI or a local Cloudflare compatibility build alone.

## Current blocker

A production-grade, commercially permitted host has not been selected. This blocks G1 and final production launch. The engineering work can continue in PRs and isolated test environments, but the final deployment gate cannot honestly be marked complete until this decision is resolved.
