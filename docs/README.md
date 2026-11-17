# HEZQEN Documentation

This documentation set uses the [Diátaxis framework](https://www.diataxis.fr/): tutorials teach through a guided learning experience, how-to guides help complete a task, reference pages describe the system, and explanations clarify why it is designed this way.

Choose the section that matches what you need.

## Tutorials — learn by doing

- [First local run](tutorials/first-local-run.md): prepare a local environment and start the public application shell.

## How-to guides — complete a task

- [Configure a local environment](how-to/configure-local-environment.md): set environment variables safely.
- [CMS setup and migration gates](CMS_SETUP.md): prepare Payload, generate and review migrations, and bootstrap a non-production administrator.
- [Contributing](../CONTRIBUTING.md): fork, branch, test and submit a pull request.
- [Security reporting](../SECURITY.md): privately report a vulnerability.

## Reference — look up exact information

- [Environment configuration](reference/configuration.md): variables, examples and constraints.
- [Data model](DATA_MODEL.md): entities, relationships and integrity requirements.
- [Platform acceptance criteria](PLATFORM_ACCEPTANCE_CRITERIA.md): implementation and release gates.
- [AI cost calculator methodology](AI_COST_CALCULATOR_METHODOLOGY.md): formulas, assumptions and exclusions.
- [VRAM calculator methodology](LABS_VRAM_METHODOLOGY.md): versioned formulas, model provenance, GPU capacity assumptions, limitations and public test vectors.
- [Master execution plan](MASTER_EXECUTION_PLAN.md): authoritative workstreams, phase gates, blockers and launch acceptance.
- [Editorial launch briefs](EDITORIAL_LAUNCH_BACKLOG.md): eight researched article commissions and publication controls.
- [Fourteen-calculator suite methodology](LABS_CALCULATOR_SUITE.md): formulas, units, assumptions and limitations for the additional fourteen Labs calculators.
- [HEZQEN Labs index](/labs): public directory of all sixteen calculator tools.
- [ADR-0001](adr/0001-editorial-cms-and-postgres.md): accepted CMS and PostgreSQL decision.

## Explanation — understand the system

- [Architecture](ARCHITECTURE.md): product boundaries, modules and deployment topology.
- [Editorial standards](EDITORIAL_STANDARDS.md): publication principles and human accountability.
- [Editorial workflow](EDITORIAL_WORKFLOW.md): state machine and authority boundaries.
- [Research evidence](RESEARCH_EVIDENCE.md): source, evidence and claim verification model.
- [Threat model](THREAT_MODEL.md): trust boundaries, threat scenarios and security requirements.
- [Brand system](BRAND_SYSTEM.md): official visual identity and application rules.
- [Infrastructure discovery](INFRASTRUCTURE_DISCOVERY.md): confirmed resources and outstanding infrastructure gates.
- [Phase status](PHASE_STATUS.md): evidence-backed implementation progress.
- [HEZQEN Labs methodology page](/labs/methodology): public calculator methodology and source links.
- [RSS feed](/feed.xml): public feed of published articles.

## Documentation conventions

- Keep commands consistent with `package.json`, the lockfile and CI.
- State prerequisites and environment assumptions before commands.
- Distinguish implemented behavior from planned work.
- Do not describe a design or domain validator as a production control until its integration and tests exist.
- Keep tutorials short and runnable; put exhaustive configuration in reference pages.
- Prefer relative links for repository documentation.
- Update this index whenever a document is added, renamed or removed.

- [Infrastructure product catalog](/infrastructure): five engineering-preview kits and their release limitations.

- [Operational readiness](./OPERATIONS.md): liveness/readiness, guarded PostgreSQL backup/restore, CI restore drill and dormant uptime monitoring.
