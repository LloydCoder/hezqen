<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/brand/hezqen-horizontal-reversed.svg">
    <img src="public/brand/hezqen-horizontal-color.svg" alt="HEZQEN" width="320">
  </picture>
</p>

<h1 align="center">HEZQEN</h1>
<p align="center"><strong>Global Technology &amp; Business Intelligence</strong><br>Research. Intelligence. Perspective.</p>

HEZQEN is a global technology and business intelligence publication and engineering-product portfolio for people building, governing and investing in technology. It connects evidence-led reporting, original research, technical analysis, transparent Labs tools and practical infrastructure kits across AI, cybersecurity, cloud engineering, and business.

<p align="center">
  <a href="https://github.com/LloydCoder/hezqen/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/LloydCoder/hezqen/ci.yml?branch=main&label=CI" alt="CI status"></a>
  <a href="https://github.com/LloydCoder/hezqen/blob/main/LICENSE"><img src="https://img.shields.io/github/license/LloydCoder/hezqen" alt="Apache-2.0 license"></a>
  <img src="https://img.shields.io/badge/Node.js-24.x-339933?logo=nodedotjs&logoColor=white" alt="Node.js 24">
  <img src="https://img.shields.io/badge/pnpm-12.x-F69220?logo=pnpm&logoColor=white" alt="pnpm 12">
</p>

## Preview and release status

The intended public hostname is **https://hezqen.tinlance.com**. It is not yet a production service and must not be treated as live until the hosting, database, security, browser QA, monitoring, backup/restore and rollback gates are accepted. The repository intentionally does not trigger Vercel Git deployments. Cloudflare Workers is under isolated compatibility evaluation; no Cloudflare deployment or DNS change has been made.

The public application shell and sixteen HEZQEN Labs calculators can be exercised locally using the Quick Start instructions below.

## HEZQEN Labs

The Labs portfolio contains sixteen calculators: VRAM sizing, API-versus-self-hosted AI cost, RAG storage sizing, AI data-leakage scenario risk, local hardware ROI, fine-tuning versus RAG, cloud migration cost, Kubernetes infrastructure cost, database capacity, AI API pricing comparison, LLM inference throughput, cybersecurity incident cost, SaaS gross margin, data-centre energy, storage growth and AI-agent operating cost. See the [calculator methodology and limitations](docs/LABS_CALCULATOR_SUITE.md) for formulas, assumptions, units and exclusions. The sixteen-calculator portfolio is implemented on `main` and covered by deterministic regression tests, production-build validation and runtime HTTP smoke tests. Production browser QA, live deployment telemetry and public-hostname verification remain separate release checks.

## Why HEZQEN

HEZQEN is designed as an editorial and intelligence platform, not a high-volume content blog.

| Surface | Purpose |
|---|---|
| **HEZQEN Media** | Reporting, investigations, analysis and explainers |
| **HEZQEN Labs** | Transparent calculators, benchmarks and engineering experiments |
| **HEZQEN Intelligence** | Research and briefings for consequential technology and business decisions |
| **HEZQEN Infrastructure** | Reusable local-AI, privacy, multi-GPU and air-gapped RAG engineering kits ([product repository](https://github.com/LloydCoder/hezqen-infrastructure-standard)) |

The four editorial divisions are AI & Technology, Cybersecurity, Cloud & Engineering, and Business & Startups. Our editorial principle is simple: **AI may assist the newsroom; AI must not become the newsroom.** Every published item requires accountable human authorship and human editorial approval. Material claims must be traceable to evidence.

## Quick Start

Prerequisites: Node.js 24.22.3 or a supported version in `package.json`, pnpm 12.21.0, and a local PostgreSQL 18 database. The Payload configuration requires a database URL and a strong application secret.

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev
```

Before starting the server, edit `.env`: set `DATABASE_URL` to your local HEZQEN database and replace `PAYLOAD_SECRET` with a unique secret of at least 32 random bytes. Keep local development isolated from staging and production. The first dependency installation depends on your network and may take longer than 30 seconds.

Open [http://localhost:3000](http://localhost:3000). The public application shell and Labs pages are available independently of the unfinished CMS rollout and are intended to run on the selected hosting target once it passes acceptance. The admin interface requires the reviewed database migration and administrator bootstrap described in [CMS setup](docs/CMS_SETUP.md).

## Installation

| Requirement | Supported configuration |
|---|---|
| Node.js | `^24.22.3 || >=26.13.1` |
| Package manager | pnpm `12.21.0` (declared in `package.json`) |
| Database | PostgreSQL 18 for CMS development |
| Framework | Next.js 16, React 19, strict TypeScript |
| Tooling | Biome 2.6.7 and Node's built-in test runner |

pnpm is the supported package manager because the repository commits `pnpm-lock.yaml` and CI uses frozen installs. From the repository root:

```bash
corepack enable
pnpm install --frozen-lockfile
```

Configure the environment using [the local environment guide](docs/how-to/configure-local-environment.md). Do not point local development at a production database.

## Usage

Start the development server:

```bash
pnpm dev
```

Run the quality checks used by CI:

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm audit --audit-level moderate
pnpm build
```

Run a production build locally after configuring the required environment variables:

```bash
pnpm build
pnpm start
```

The Payload CLI wrapper is available through `pnpm payload`. Database migration and administrator-bootstrap commands are operational tasks: follow [CMS setup](docs/CMS_SETUP.md), use an isolated database, and do not run migrations against shared or production databases without review and explicit approval.

## Configuration

Copy `.env.example` to `.env` and set the values for your local environment.

| Variable | Example/default | Purpose |
|---|---|---|
| `DATABASE_URL` | `postgres://hezqen:replace-me@localhost:5432/hezqen` | PostgreSQL connection string |
| `PAYLOAD_SECRET` | `replace-with-at-least-32-random-bytes` | Unique Payload session/application secret |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Canonical origin for the current environment |
| `HEZQEN_ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated allowed Payload CORS/CSRF origins |

These are example values, not production defaults. Production must use distinct secrets, database credentials and HTTPS origins. See [Configuration Reference](docs/reference/configuration.md).

## Features

| Capability | Current implementation status |
|---|---|
| Public application shell | Homepage, About, editorial standards and four division routes exist |
| HEZQEN Labs | VRAM sizing and API-versus-self-hosted AI cost calculators have deterministic domain logic and tests |
| Payload CMS | Next.js admin/API integration and restricted collections are present; initial database migration and operational acceptance remain outstanding |
| Editorial workflow | Human-controlled workflow state machine and publication-policy tests exist; persistent server-side workflow commands remain outstanding |
| Research evidence | Source/evidence validation and guarded HTTPS acquisition logic exist; private object storage, persistence and production egress controls remain outstanding |
| CI and dependency hygiene | GitHub Actions quality pipeline and weekly Dependabot updates are configured |

HEZQEN is under active development. The repository does not claim that the CMS, evidence vault, search, reader accounts, subscriptions or premium Intelligence service are production-ready. The current implementation boundaries are tracked in [Phase Status](docs/PHASE_STATUS.md).

## Documentation

Start at the [documentation index](docs/README.md).

| Need | Documentation |
|---|---|
| First local run | [Tutorial](docs/tutorials/first-local-run.md) |
| Environment configuration | [How-to guide](docs/how-to/configure-local-environment.md) |
| CMS and migrations | [CMS setup](docs/CMS_SETUP.md) |
| Architecture and boundaries | [Architecture](docs/ARCHITECTURE.md) |
| Data model | [Data model](docs/DATA_MODEL.md) |
| Editorial rules | [Editorial standards](docs/EDITORIAL_STANDARDS.md) |
| Editorial state machine | [Editorial workflow](docs/EDITORIAL_WORKFLOW.md) |
| Research provenance | [Research evidence](docs/RESEARCH_EVIDENCE.md) |
| Security assumptions | [Threat model](docs/THREAT_MODEL.md) |
| Platform gates | [Acceptance criteria](docs/PLATFORM_ACCEPTANCE_CRITERIA.md) |
| Brand application | [Brand system](docs/BRAND_SYSTEM.md) |
| Architecture decision | [ADR-0001](docs/adr/0001-editorial-cms-and-postgres.md) |
| AI cost calculator | [Methodology](docs/AI_COST_CALCULATOR_METHODOLOGY.md) |
| VRAM calculator | [Methodology](docs/LABS_METHODOLOGY.md) |

Machine-readable documentation entry points: [llms.txt](public/llms.txt) and [llms-full.txt](public/llms-full.txt).

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md), follow the editorial and security boundaries, add tests for behavior changes, and submit a pull request against `main`. Do not include secrets, fabricated evidence or unverified editorial claims.

## License and acknowledgements

The repository is identified as **Apache License 2.0**; see [LICENSE](LICENSE). Apache-2.0 does not grant trademark rights. HEZQEN brand usage must follow the supplied [brand system](docs/BRAND_SYSTEM.md). The logo kit states that trademark and domain clearance has not been completed.

The project uses Next.js, React, Payload CMS, PostgreSQL, Biome and pnpm. Their respective licenses and notices remain with their upstream projects.

<details>
<summary>Roadmap and release status</summary>

HEZQEN implementation progress is maintained in [PHASE_STATUS.md](docs/PHASE_STATUS.md). The near-term engineering gates are reviewed database migrations, server-side editorial workflow commands, persistent audit events, evidence storage and integrity verification, and security/accessibility acceptance.

</details>

<details>
<summary>Troubleshooting</summary>

- **Payload reports missing environment variables:** copy `.env.example` to `.env` and configure all four values.
- **Database connection fails:** verify PostgreSQL is running and that `DATABASE_URL` targets your local database.
- **Admin routes are not operational:** the initial migration and administrator bootstrap are not yet a completed production setup. Follow [CMS setup](docs/CMS_SETUP.md).
- **Lockfile installation fails:** use the pnpm version declared by `package.json` and run `pnpm install --frozen-lockfile`.

</details>

<details>
<summary>Support</summary>

For project questions, consult [SUPPORT.md](SUPPORT.md) or open a GitHub issue. Do not disclose vulnerabilities, credentials or private evidence in public issues.

</details>
