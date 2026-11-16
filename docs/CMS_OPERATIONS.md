[object Object]

### Staging SSO smoke-test update — 2026-11-16

After the alias assignment above, a live read-only fetch was attempted against the staging homepage, readiness endpoint, sitemap, robots file, one division page, a missing-article route and the admin login route. Every request was redirected to Vercel's login/SSO page. Therefore the hostname-to-deployment alias is confirmed by Vercel's alias API, but application HTTP behavior remains unverified because deployment SSO blocks the external test client.

A temporary 10-minute Vercel deployment protection bypass was created for this test, did not bypass the SSO redirect, and was immediately revoked. No bypass secret remains active. Do not weaken or disable SSO to make the smoke test pass. Complete the remaining authenticated tests using an authorized operator browser session or a narrowly scoped, approved staging test identity.

**Staging verdict:** deployment is READY and the alias maps to the PR #52 merge deployment, but HTTP smoke, CMS login and all authenticated acceptance remain BLOCKED by Vercel SSO. Production remains NOT READY.


### Public production-host smoke test — 2026-11-16

A live read-only Firecrawl fetch was performed against the public custom domains:

- `https://hezqen.tinlance.com/` returned HTTP 200 and rendered the HEZQEN homepage with its four editorial divisions and current brand presentation.
- `https://www.hezqen.tinlance.com/` redirected to the canonical `https://hezqen.tinlance.com/` and returned the homepage.
- `https://hezqen.tinlance.com/divisions/ai-technology` returned HTTP 200.
- `/sitemap.xml` returned HTTP 200 but contained only the homepage, About, Editorial Standards and four division URLs; no published article URLs were present.
- `/api/health/ready` returned HTTP 404.
- `/admin/login` on both the canonical and admin hostnames returned HTTP 404.
- `/articles/ci-missing-article` returned HTTP 404, as expected for a missing article, but this alone does not prove the PR #52 CMS-backed route is deployed.
- `/corrections` returned HTTP 404.

**Interpretation:** the public hostname is serving a real HEZQEN site, but the live public deployment is not the current CMS/public-reader release. The currently served sitemap is static and article-free; readiness and Payload admin routes are absent. The production application must be redeployed to an approved commercial host after staging acceptance. Do not treat the existing HTTP 200 homepage as a completed launch.
