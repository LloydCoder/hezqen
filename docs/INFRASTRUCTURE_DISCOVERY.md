# Infrastructure Discovery Record

**Captured:** 2026-11-15  
**Scope:** Read-only inventory before HEZQEN application provisioning  
**Decision:** Isolate HEZQEN; do not reuse unrelated production data stores.

## Confirmed

- Cloudflare manages the active tinlance.com zone.
- The Cloudflare zone is on the Free Website plan.
- A separate Vercel project named hezqen has been created in the existing Tinlance Vercel team and linked to LloydCoder/hezqen.
- The new Vercel project has no custom domain and no deployment at the time of this record.
- The repository is public and its initial editorial policies and platform acceptance criteria are present.
- The active Supabase project named Tinlyt-Early-Access is a distinct Tinlyt environment and is not approved for HEZQEN data.
- Existing Vercel projects and Railway services are in use by other Tinlance products. They are not assumed to be available capacity.

## Isolation decisions

- Do not repurpose the Vercel project currently serving tinlance.com.
- Do not alter apex or www DNS records.
- Do not attach HEZQEN to Tinlyt, Kalevio, ThreatFade, Hezqara or other product databases.
- Do not provision new AWS infrastructure for the initial build.
- Do not create or modify DNS records until the HEZQEN application has passed preview deployment and domain validation.
- Use a dedicated HEZQEN database and object-storage namespace when persistence is introduced.

## Not yet verified or provisioned

- Dedicated HEZQEN PostgreSQL database, backups and restore process.
- Dedicated media/object storage bucket and lifecycle rules.
- Vercel production domain and DNS target.
- Email delivery domain and sender authorization for HEZQEN.
- Analytics, error monitoring, alerting and retention configuration.
- Production secrets and environment separation.
- Trademark and domain clearance for HEZQEN and hezqen.com.

## Current Vercel project

The new project is named hezqen and is linked to the main branch of LloydCoder/hezqen. It is deliberately separate from the existing Tinlance website project. A preview/production deployment is not considered accepted until CI is green and deployment smoke tests pass.
