# Configure a local environment

Use this guide to configure HEZQEN without exposing production credentials.

## 1. Create the local environment file

From the repository root:

```bash
cp .env.example .env
```

## 2. Set each variable

| Variable | Local value | Requirement |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Must point to a local or isolated development database |
| `PAYLOAD_SECRET` | Unique random secret | At least 32 random bytes; never reuse across environments |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Must match one allowed origin |
| `HEZQEN_ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated exact origins; HTTPS outside localhost |

Generate a secret with:

```bash
openssl rand -base64 32
```

Do not use the placeholder value from `.env.example` as a real secret.

## 3. Validate origin configuration

Payload validates that the configured site URL matches one of the allowed origins. Non-local origins must use HTTPS. Do not include paths, query strings or fragments in the origin list.

## 4. Protect the environment file

- Keep `.env` out of version control.
- Never place secrets in `NEXT_PUBLIC_*` variables.
- Use separate database credentials and secrets for local, staging and production.
- Rotate any credential that is accidentally committed or disclosed.
- Do not copy production data into local development unless it has been appropriately sanitized and authorized.

For the complete CMS setup and migration sequence, see [CMS_SETUP.md](../CMS_SETUP.md).
