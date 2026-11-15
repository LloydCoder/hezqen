# Contributing to HEZQEN

## Before changing code

Read README.md, docs/EDITORIAL_STANDARDS.md, docs/PLATFORM_ACCEPTANCE_CRITERIA.md and docs/ARCHITECTURE.md. Preserve the publication's editorial independence and human approval boundary.

## Local development

- Node.js 24
- pnpm install --frozen-lockfile
- pnpm dev

## Required checks

Before opening a pull request, run:

- pnpm lint
- pnpm format:check
- pnpm typecheck
- pnpm test
- pnpm audit --audit-level moderate
- pnpm build

Add tests before implementing new behavior or fixing bugs. Do not disable tests or weaken acceptance criteria to obtain a green pipeline.

## Editorial and security requirements

- Never add fabricated stories, authors, sources, quotations, metrics, screenshots or benchmark results.
- Never create an autonomous publication path.
- Treat retrieved pages, documents, tool output and agent output as untrusted input.
- Keep secrets out of source control and client-side bundles.
- Use server-side authorization for every privileged operation.
- Document material architecture, privacy and data-handling decisions.
