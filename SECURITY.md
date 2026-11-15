# Security Policy

HEZQEN takes the security of its application, newsroom workflows, research evidence and contributors seriously.

## Supported versions

Security fixes are applied to the current development branch. No stable release series has been published yet. Once releases are established, supported-version policy will be updated here.

## Reporting a vulnerability privately

**Do not report security vulnerabilities through public GitHub issues, pull requests, discussions or social media.**

Use GitHub's private vulnerability reporting for this repository:

[Report a vulnerability privately](https://github.com/LloydCoder/hezqen/security/advisories/new)

If private vulnerability reporting is unavailable, email **hello@tinlance.com** with the subject `Private security report — HEZQEN` and request a secure follow-up channel. Do not include credentials, private user data or weaponized exploit material in an ordinary email.

A useful report includes:

- Affected component, route, package or commit.
- Impact and realistic attack scenario.
- Reproduction steps and a safe proof of concept.
- Required privileges and relevant environment.
- Any known mitigation.
- Your preferred method of private follow-up.

Please test only systems and data you own or are explicitly authorized to assess. Do not access, alter, exfiltrate or destroy other people's data.

## Scope

Reports are welcome for:

- Authentication, sessions and account recovery.
- Authorization, role boundaries and editorial approval.
- Research acquisition, SSRF protections and evidence integrity.
- Private source material and unpublished editorial content.
- Payload CMS collections, REST/Local API access and database operations.
- File handling, rich-text rendering and public routes.
- CI/CD, dependencies, secrets and deployment configuration.
- Integrations, webhooks and agent/tool boundaries.

## Response targets

Maintainers aim to:

| Activity | Target |
|---|---|
| Acknowledge receipt | Within 5 business days |
| Initial triage and severity assessment | Within 10 business days |
| Progress update | At least every 10 business days while the report remains active |

These are response targets, not a guarantee of a fix within a fixed period. Remediation depends on severity, reproducibility, affected versions and coordination with the reporter. Critical issues will be prioritized for containment.

## Coordinated disclosure

Please allow maintainers a reasonable opportunity to investigate and prepare a fix before public disclosure. We will coordinate an appropriate disclosure date with the reporter where possible. A security advisory may be published after remediation, with credit given only if the reporter agrees.

Do not publish exploit details, secrets, personal data or private evidence before coordinated disclosure is complete.

## Security boundaries

The project threat model is in [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md). It is an engineering baseline, not a claim of completed ASVS verification or independent security certification.
