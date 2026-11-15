# Contributing to HEZQEN

Thank you for considering a contribution. HEZQEN welcomes focused improvements to its application, Labs tools, documentation, security controls and engineering workflows.

## Before you begin

Read:

- [README](README.md) for the project scope and setup.
- [Documentation index](docs/README.md) for the architecture and implementation boundaries.
- [Editorial Standards](docs/EDITORIAL_STANDARDS.md) for publication and evidence rules.
- [Threat Model](docs/THREAT_MODEL.md) for security assumptions.
- [Platform Acceptance Criteria](docs/PLATFORM_ACCEPTANCE_CRITERIA.md) for release gates.

For substantial changes, open an issue first to discuss scope and acceptance criteria.

## Development environment

- Node.js `^24.22.3 || >=26.13.1`
- pnpm `12.21.0`
- PostgreSQL 18 for CMS work
- A local `.env` based on `.env.example`

Never use production credentials or production data for local development or tests.

## Contribution workflow

1. **Fork** the repository.
2. **Create a focused branch** from the current `main` branch. Use names such as `feat/article-search`, `fix/labs-calculation`, `docs/setup-guide` or `chore/ci-hardening`.
3. **Make a scoped change.** Avoid unrelated formatting, dependency or architecture changes.
4. **Add or update tests** for behavior changes. Documentation-only changes should be checked for accuracy and working links.
5. **Run the required checks** listed below.
6. **Commit with a clear message** and push your branch.
7. **Open a pull request** against `main`, complete the PR template and explain the risk, evidence and validation performed.
8. **Respond to review feedback** and keep the branch current. Do not force-push over another contributor's work.

## Required checks

Run the same checks used by the repository CI:

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm audit --audit-level moderate
pnpm build
```

Use `pnpm install --frozen-lockfile` for dependency installation. Do not update the lockfile manually without explaining the dependency change.

## Commit conventions

Use Conventional Commit-style messages:

- `feat(scope): add a capability`
- `fix(scope): correct behavior`
- `docs(scope): improve documentation`
- `test(scope): add regression coverage`
- `security(scope): strengthen a control`
- `chore(scope): maintain tooling or dependencies`

Keep the subject imperative, specific and concise.

## Engineering standards

- Use strict TypeScript and existing project conventions.
- Keep domain logic deterministic and independently testable.
- Prefer server components unless client-side interaction is required.
- Validate untrusted input at trust boundaries.
- Enforce authorization on the server; UI visibility is not authorization.
- Never commit secrets, credentials, personal data or private evidence.
- Keep dependencies and GitHub Actions changes deliberate and reviewable.
- Do not weaken CI, tests, acceptance criteria or security controls to make a change pass.

## Editorial and evidence requirements

- Do not fabricate authors, sources, quotations, interviews, claims, metrics, screenshots, datasets or benchmark results.
- Material claims must remain traceable to identifiable evidence.
- Preserve human authorship, fact-checking, editorial review and approval boundaries.
- Automated agents, prompts, memory, retrieved documents and tool outputs cannot grant publication authority.
- Do not create an autonomous publication path.
- Clearly distinguish measured results, estimates, forecasts and theoretical calculations.
- Treat retrieved webpages, documents and agent output as untrusted data.

## Security-sensitive changes

For authentication, authorization, evidence acquisition, uploads, secrets, integrations, webhooks, database access or publishing controls:

- Update the threat model and acceptance criteria.
- Include negative tests for unauthorized and malformed requests.
- Consider SSRF, IDOR, injection, replay, prompt injection and data leakage.
- Document migration and rollback implications.
- Never publish exploit details or private vulnerability reports in a public issue.

## Pull request review

A pull request should contain:

- A concise problem statement and proposed change.
- Relevant issue links.
- User-visible behavior changes.
- Tests and commands actually executed, with results.
- Screenshots for material UI changes.
- Documentation and migration updates where applicable.
- Security, privacy and editorial implications.
- Known limitations and follow-up work.

Maintainers may request changes, additional evidence or a narrower scope before merging.
