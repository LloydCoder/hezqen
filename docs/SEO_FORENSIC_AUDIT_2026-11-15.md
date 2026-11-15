# HEZQEN Technical SEO and Frontend Forensic Audit

**Audit date:** 2026-11-15  
**Repository baseline:** `42d2dcd2a49d4c40a84a2952208a56f7c72e20ff`  
**Public deployment inspected:** `https://hezqen.vercel.app` (not the canonical custom domain)  
**Canonical launch target:** `https://hezqen.tinlance.com`  
**Production state:** NOT READY; no production-target Vercel deployment or custom-domain attachment was verified.

## Evidence boundary

Repository findings below were inspected against the default branch. HTTP findings were observed against the public Vercel alias. The Vercel alias is serving a deployment that does not contain the latest mainline route set: for example, its `/labs` route and `/llms.txt` return 404, while the repository contains those assets. Therefore the live alias is not evidence of the current main branch build. The custom canonical hostname is not attached in the Vercel project inventory and was not publicly verified. No Cloudflare zone rules were modified.

## Audit and architecture matrix

| Severity | Finding / pillar | Affected files, routes or viewports | Impact | Remediation / acceptance |
|---|---|---|---|---|
| Critical | Live deployment is stale and not the current source revision (1, 2, 3) | Vercel alias `hezqen.vercel.app`; routes `/labs`, `/llms.txt`, `/llms-full.txt` | Public crawler receives 404 for routes present in mainline; live source and sitemap disagree | Controlled Vercel preview must be deployed from current mainline; verify every public route and assets before domain cutover. Production deployment is not authorized by this code-only PR. |
| Critical | Canonical host is not attached/verified (2, 3) | `src/lib/site.ts`, `app/(frontend)/layout.tsx`, Vercel project domains | Canonical tags and sitemap point to `hezqen.tinlance.com` while observed alias is `hezqen.vercel.app`; duplicate/canonical mismatch risk | Attach DNS/domain only after hosting and database gates; verify TLS, redirects and canonical parity. |
| High | No machine-readable organization/site entity graph (4) | `app/(frontend)/layout.tsx` | Search/answer engines lack explicit publisher and website entity relationships | Add stable Organization, NewsMediaOrganization and WebSite JSON-LD graph with persistent @id values. Article/Product schema must be added only when real records and routes exist. |
| High | Missing public trust and policy routes (1) | New `/contact`, `/corrections`, `/security`, `/privacy`, `/cookies`, `/terms` | Weak visitor support and incomplete trust/legal information | Add concise, honest initial pages; legal and operational details remain release gates and must be reviewed against actual data flows and jurisdictions. |
| High | No human-readable site directory (1) | New `/sitemap` | Visitors and crawlers lack a navigable HTML directory | Add a server-rendered HTML sitemap linking actual static, division, Labs and policy routes. |
| High | XML sitemap emits build-time `lastModified` for every route (2) | `app/sitemap.ts` | Every URL appears equally fresh regardless of whether content changed; weakens lastmod signal quality | Omit lastModified until source records expose trustworthy modified timestamps. Include all real indexable static routes. |
| High | Global canonical default risks inheriting root canonical on pages without overrides (2) | `app/(frontend)/layout.tsx`, About and Editorial Standards metadata | Non-home pages may emit root canonical if nested metadata does not override it | Ensure each indexable route explicitly defines canonical metadata; test rendered head per route. |
| Medium | Footer has incomplete discoverability links (1) | `app/(frontend)/layout.tsx` | Several public sections and policies are not linked from a global crawlable navigation surface | Add direct server-rendered anchors to contact, corrections, policies, security, sitemap, Labs and Infrastructure. |
| Medium | No mobile drawer; mobile navigation is a horizontal scroll strip (5) | `app/(frontend)/layout.tsx`, `app/(frontend)/globals.css` lines 661–693 | Not a crawlability failure because links remain in HTML; mobile usability must be checked on real devices | Keep all navigation anchors present in server HTML; test keyboard focus and 375/390/430 widths. |
| Medium | No Content-Security-Policy header configured (7) | `next.config.ts` | Browser script/style/resource policy not explicitly constrained | Design a nonce-compatible CSP after inspecting Next/Payload runtime dependencies; do not ship a guessed restrictive policy that breaks hydration/admin. |
| Medium | No public article route or CMS-backed article sitemap integration (1, 2, 3, 4) | `app/(frontend)`, `app/sitemap.ts`, Payload Articles collection | No article inventory is currently available for indexing; Article schema cannot be truthfully emitted | Implement article route and publication-aware queries after CMS/database staging acceptance. No empty or fabricated article URLs. |
| Medium | No custom global error boundary identified in inspected route tree | App Router error route files | Unhandled server errors may fall back to framework default | Add an accessible error boundary after confirming runtime behavior and safe error disclosure. |
| Low | Hero image is a logo SVG, not a photographic LCP image; font stack falls back to system fonts | `app/(frontend)/layout.tsx`, `globals.css` | No evidence of image dimension omission on logo; local Inter font packaging remains a brand-system task | Preserve explicit image dimensions and priority; evaluate font loading and CWV from a deployed build. |
| Low | Labs index uses inline styles rather than shared tokens | `app/(frontend)/labs/page.tsx` | Visual consistency and maintainability risk | Consolidate styles only with screenshot-based regression testing at desktop/tablet/mobile. |

## Observed HTTP evidence

Observed on `https://hezqen.vercel.app` at audit time:

| URL | Status | Observation |
|---|---:|---|
| `/` | 200 | SSR HTML includes title, description, canonical, H1, semantic header/nav/main/footer and crawlable anchors. |
| `/about` | 200 | SSR content and page-specific title/description. Canonical must be checked against the latest deployed source after redeploy. |
| `/divisions/ai-technology` | 200 | SSR content and page-specific title/description. |
| `/labs` | 404 | Observed deployment predates current mainline Labs integration. |
| `/robots.txt` | 200 | Allows public crawling; disallows /admin/ and /api/; sitemap points to canonical hostname. |
| `/sitemap.xml` | 200 | Sitemap points to canonical hostname and includes current route set only for the older deployment. |
| `/llms.txt` | 404 | Public alias is stale relative to repository assets. |
| `/llms-full.txt` | 404 | Public alias is stale relative to repository assets. |

Security headers observed on successful HTML responses include HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP and CORP. CSP and X-Robots-Tag were not observed. This audit did not prove that Cloudflare WAF is in the request path for the Vercel alias.

## Cloudflare verified-bot policy

No Cloudflare WAF expression was deployed. User-Agent matching alone is not an identity check and can be spoofed. Prefer Cloudflare's verified-bot signal and preserve the full WAF stack by default. If event logs prove a verified crawler is receiving a challenge, create a narrowly scoped exception for read-only public requests and skip only the exact custom challenge rule(s) responsible; do not skip all managed WAF rules, bot protections, rate limiting or DDoS protections.

Candidate match expression for a *targeted exception only after log confirmation*:

```text
(cf.client.bot and http.request.method in {"GET" "HEAD"} and not starts_with(http.request.uri.path, "/admin") and not starts_with(http.request.uri.path, "/api"))
```

This expression is not a complete WAF rule by itself. In the Cloudflare Skip action, select only the specific challenge-producing custom rule IDs proven to cause the false positive. Do not skip Managed WAF, Bot Fight Mode, rate limiting or DDoS protections globally. Do not add User-Agent allowlists for Googlebot, OAI-SearchBot, ClaudeBot, PerplexityBot or Applebot-Extended as a substitute for verified identity. Search/AI crawlers do not need special access if ordinary public GET requests already pass.

## Rendering, schema and accessibility notes

- The observed homepage response contained its primary title, description, canonical, H1 and primary navigation anchors in initial HTML; the route is server-rendered.
- The inspected header uses native anchors and a semantic `nav`; mobile links remain in the DOM as a horizontal overflow strip. No mobile drawer was present.
- Organization/WebSite graph is being added. Article/Product/Service/FAQ schema must be attached only to matching real content, offers and user-visible Q&A; do not fabricate entities or FAQ rich-result eligibility.
- Automated schema validation and responsive browser screenshot testing remain required on the current deployment.
- The 404 page exists. No 500 boundary was verified.
- No Core Web Vitals field data or full Lighthouse run was available in this audit. Do not claim CWV pass from source inspection alone.

## Release blockers

1. Vercel custom domain/DNS/TLS and canonical redirect parity.
2. Fresh Vercel preview deployment from current mainline and route-by-route browser QA.
3. Verified Neon environment-to-branch mapping, migration approval and staging acceptance.
4. Production backups, restore evidence, monitoring and rollback.
5. Privacy/cookie policy verification against actual deployment and legal review.
6. Cloudflare zone configuration/log review before any crawler exception.
7. Article route/CMS publishing workflow before claiming editorial article discoverability.
8. WCAG 2.2 AA and Core Web Vitals measurements on representative real browsers/devices.

A green CI run proves only the automated checks in the workflow. It does not prove production readiness, indexation, AI crawler visibility, legal compliance or ranking.
