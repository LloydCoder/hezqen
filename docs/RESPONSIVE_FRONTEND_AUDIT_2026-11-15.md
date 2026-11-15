# HEZQEN Frontend Responsive and Navigation Audit — 15 November 2026

## Scope and method

Reviewed the current `main` frontend route tree, shared App Router layout, global styles, all public page families, Labs calculators, Infrastructure page, Payload Articles collection, and the current CI workflows. Cross-checked the implementation against current WCAG 2.2 and WAI-ARIA Authoring Practices guidance.

This audit covers source-level behavior and automated regression checks. It does not claim a complete manual device-lab, screen-reader, or WCAG conformance certification.

## Findings and remediation

| Severity | Finding | Root cause / affected surface | Remediation |
|---|---|---|---|
| Critical | No usable mobile primary navigation | `app/(frontend)/layout.tsx` rendered only the desktop `.primary-nav`. At 700px and below it became a horizontal scrolling row; the About link was hidden from 1050px down. | Added `src/components/MobileNavigation.tsx`, integrated into the shared header, with all six primary destinations plus About, Contact and Editorial Standards. |
| High | Keyboard and touch dismissal were absent | No disclosure button, expanded state, Escape behavior, outside interaction handling or current-page indication existed. | Added a 48px disclosure button, `aria-expanded`, `aria-controls`, labelled navigation landmark, list semantics, `aria-current="page"`, Escape-to-close with focus return, outside pointer dismissal, focus-leave dismissal and route-change close. |
| High | Homepage hero retained a two-column layout on phones | The `max-width:700px` rule in `app/(frontend)/globals.css` explicitly used two equal grid tracks despite a 280px content width on a 320px viewport. | Collapsed the hero to one column at tablet/mobile widths and tuned the editorial aside, heading and action spacing for narrow phones. |
| High | Calculator pages nested main landmarks | `app/(frontend)/labs/vram/vram-calculator.tsx` and `app/(frontend)/labs/ai-cost/ai-cost-calculator.tsx` returned their own `<main>` inside the shared layout's `<main id="main-content">`. | Replaced the inner landmarks with sections so each page has one main landmark. |
| Medium | Notched-device safe areas were not handled | The viewport configuration did not opt into full safe-area layout and the shell did not use safe-area insets. | Added `viewportFit: "cover"`, top/side shell insets and bottom footer inset. |
| Medium | Responsive behavior needed a consistent breakpoint strategy | Header, hero, calculator, division, platform and infrastructure surfaces used separate breakpoints, with a problematic mobile hero exception. | Established a consistent collapse sequence: navigation at 900px; hero and infrastructure/card layouts at tablet widths; one-column calculator fields at 560px; narrow-phone typography and gutters at 380px. |

## Navigation behavior

The new mobile navigation is a disclosure-based site navigation, not an ARIA application menu. It keeps ordinary anchor semantics, so links remain normal navigable links and do not require menu/menubar arrow-key behavior.

Behavior:
- Opens and closes through a native button.
- Exposes the expanded state and controlled navigation panel.
- Closes after a destination is selected.
- Closes on Escape and returns focus to the disclosure button.
- Closes when pointer interaction or keyboard focus moves outside the navigation.
- Closes when the current route changes.
- Marks the current route with `aria-current="page"`.
- Includes every primary navigation destination and the key About, Contact and Editorial Standards links.

## Responsive coverage in source

| Viewport range | Expected layout |
|---|---|
| 1440px / wide desktop | Full six-link horizontal navigation, editorial two-column hero, four-column division and platform grids. |
| 1050–901px | Compact desktop navigation; About remains available. |
| 900–801px | Disclosure navigation; single-column hero; tablet-friendly content flow. |
| 800–701px | Disclosure navigation; calculator and infrastructure grids collapse. |
| 700–561px | Single-column division/platform cards, stacked footer and mobile content gutters. |
| 560–381px | Single-column calculator fields and compact panel spacing. |
| 380–320px | 32px total content gutter, smaller headings and constrained hero spacing; no two-column hero. |

The CSS uses fluid `minmax`, `clamp`, `min()`, and `max()` sizing rather than device-model-specific breakpoints. The 320 CSS-pixel reflow target is the minimum audit viewport, not a claim that every physical handset has been manually tested.

## Additional functionality gap analysis

These are product-level gaps, not mobile-navigation defects. They remain separate from this remediation because they require editorial/CMS data-flow decisions and end-to-end acceptance criteria.

| Priority | Missing capability | Evidence in current codebase | Recommended next implementation |
|---|---|---|---|
| Critical for publication launch | Public article archive and article detail pages | Payload has an `Articles` collection with title, slug, excerpt, rich-text body, division, topics, author, workflow status and publication timestamp. The frontend route tree has no public `/articles` archive or `/articles/[slug]` detail route. Division pages currently describe editorial scope rather than listing published stories. | Build a server-rendered public article query layer that exposes only records where both Payload draft status and editorial workflow status are published; add archive, article detail, division feeds, canonical metadata, Article/NewsArticle schema, pagination and sitemap integration. |
| High | Site-wide article search | No public search route, search UI or search service exists in the frontend route tree. | Add accessible search with query validation, published-only results, pagination, empty/error states and a database-backed index. |
| High | Topic and author discovery | Topics and author relationships exist in Payload, but no public topic or author route exists. | Add topic archives and author profiles only after public author-display policy and editorial identity fields are defined. |
| Medium | Latest stories and editorial discovery on the homepage | Homepage currently presents static positioning, four divisions and product surfaces; it does not present published stories. | Add a latest/featured reporting module once the public article query layer is verified. |
| Medium | Newsletter subscription | No subscription form or server-side subscription endpoint is present. | Integrate a chosen mailing-list provider with consent capture, double opt-in, rate limiting, bot controls and unsubscribe handling. Do not collect addresses until the provider and privacy language are approved. |
| Optional | Reader accounts, saved articles, alerts and personalization | No reader authentication or reader profile routes are present. | Defer until audience demand and a privacy/security model justify accounts. |

### Important publishing security rule

The public article query must not trust a frontend-supplied status filter. Enforce publication eligibility on the server using the CMS access policy and both independent states: Payload `_status = published` and editorial `workflowStatus = published`. Drafts, scheduled-but-not-due articles, fact-checking work and correction-required records must never leak through public pages, search, feeds, JSON-LD or sitemaps.

## External standards consulted

- WCAG 2.2, Success Criterion 1.4.10 Reflow: https://www.w3.org/TR/WCAG22/#reflow
- WCAG 2.2, Success Criterion 2.5.8 Target Size (Minimum): https://www.w3.org/TR/WCAG22/#target-size-minimum
- WAI-ARIA Authoring Practices, Disclosure Navigation example: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/
- MDN CSS environment variables and safe-area insets: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env
- Next.js viewport configuration: https://nextjs.org/docs/app/api-reference/functions/generate-viewport

## Verification status

The final source revision passed:
- HEZQEN CI: lint, format check, all 112 tests, dependency audit, production build, runtime smoke test and TypeScript.
- Cloudflare compatibility: Next.js/vinext compatibility and Worker public-route smoke tests.
- Payload migration verification: ephemeral PostgreSQL migration workflow.
- Vercel preview: successful production build and READY deployment.

Preview HTTP/SSR checks returned 200 for the homepage, one editorial division, Labs, VRAM calculator, AI-cost calculator, RAG storage calculator, Infrastructure, About, Contact and Editorial Standards. Each response included the mobile navigation with all nine links, a matching `aria-controls` / panel ID, the viewport-fit setting and exactly one main landmark.

Interactive browser viewport emulation and screenshots at 320px through desktop widths were not completed because the browser automation wallet had an insufficient balance. No wallet top-up or automatic reload was performed. Therefore, this is not a physical-device test or a WCAG 2.2 AA certification. Manual VoiceOver/TalkBack checks, physical-device testing, screenshot comparisons and a full accessibility assessment remain release validation tasks.

The repository includes `src/lib/responsive-shell.test.mjs` in the standard `pnpm test` command. It checks mobile disclosure semantics, all navigation destinations, focus dismissal, route state, responsive breakpoints, 320px gutter rules, calculator reflow and main-landmark uniqueness.
