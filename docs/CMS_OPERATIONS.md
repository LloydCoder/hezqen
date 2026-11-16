[object Object]

### Staging SSO smoke-test update — 2026-11-16

After the alias assignment above, a live read-only fetch was attempted against the staging homepage, readiness endpoint, sitemap, robots file, one division page, a missing-article route and the admin login route. Every request was redirected to Vercel's login/SSO page. Therefore the hostname-to-deployment alias is confirmed by Vercel's alias API, but application HTTP behavior remains unverified because deployment SSO blocks the external test client.

A temporary 10-minute Vercel deployment protection bypass was created for this test, did not bypass the SSO redirect, and was immediately revoked. No bypass secret remains active. Do not weaken or disable SSO to make the smoke test pass. Complete the remaining authenticated tests using an authorized operator browser session or a narrowly scoped, approved staging test identity.

**Staging verdict:** deployment is READY and the alias maps to the PR #52 merge deployment, but HTTP smoke, CMS login and all authenticated acceptance remain BLOCKED by Vercel SSO. Production remains NOT READY.
