# HEZQEN

**HEZQEN — BY TINLANCE**  
**Global Technology & Business Intelligence**  
_Research. Intelligence. Perspective._

HEZQEN is a global technology and business intelligence publication featuring original research, investigative journalism, technical analysis, industry insights, benchmarks, and engineering tools across four editorial divisions:

- AI & Technology
- Cybersecurity
- Cloud & Engineering
- Business & Startups

## The platform

- **HEZQEN Media** — reporting, investigations, analysis, and explainers.
- **HEZQEN Labs** — tools, calculators, benchmarks, and engineering experiments.
- **HEZQEN Intelligence** — premium research and decision-support products.

The product is designed as an editorial and intelligence platform, not a high-volume content blog.

## Editorial integrity

Our governing principle is: **AI may assist the newsroom; AI must not become the newsroom.**

Every published item requires accountable human authorship and human editorial approval. Material claims must be traceable to evidence. AI-generated material, sources, quotations, statistics, and benchmark results must never be published as verified facts without independent human verification.

Read the [HEZQEN Editorial Standards](docs/EDITORIAL_STANDARDS.md).

## Engineering and quality

The initial application uses Next.js App Router, React, strict TypeScript, Node's built-in test runner and Biome. The architecture is a modular monolith. The CI workflow runs linting, formatting, type checks, unit tests, dependency audit and production build.

Install dependencies with pnpm install --frozen-lockfile and start the development server with pnpm dev.

Before opening a pull request, run pnpm lint, pnpm format:check, pnpm typecheck, pnpm test, pnpm audit --audit-level moderate and pnpm build.

## Project documentation

- [Editorial Standards](docs/EDITORIAL_STANDARDS.md)
- [Editorial Workflow](docs/EDITORIAL_WORKFLOW.md)
- [Research Evidence](docs/RESEARCH_EVIDENCE.md)
- [Platform Acceptance Criteria](docs/PLATFORM_ACCEPTANCE_CRITERIA.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Brand System](docs/BRAND_SYSTEM.md)
- [Infrastructure Discovery](docs/INFRASTRUCTURE_DISCOVERY.md)
- [Implementation Phase Status](docs/PHASE_STATUS.md)
- [Security Policy](SECURITY.md)
- [Contributing](CONTRIBUTING.md)

## Project status

The application foundation and public-facing shell are under implementation. The homepage, four division landing pages, About page, Editorial Standards page, brand assets, SEO route metadata, baseline response headers, and initial editorial publication-policy tests exist.

The CMS, dedicated database, evidence registry, search, Labs tools, accounts, subscriptions, integrations, production monitoring, backups, and complete security/accessibility gates are not yet implemented. This repository does not claim production readiness.

## Brand system

The supplied HEZQEN logo kit and usage guidelines are the source of truth for logo assets, colors, typography, and application. Preserve the supplied marks and their proportions; do not recreate or distort them.

## License

Apache License 2.0. See [LICENSE](LICENSE).
