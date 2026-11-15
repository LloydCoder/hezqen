# Configuration Reference

HEZQEN reads its application configuration from environment variables. The repository provides `.env.example` as a local template.

| Variable | Example | Required | Description |
|---|---|---:|---|
| `DATABASE_URL` | `postgres://hezqen:replace-me@localhost:5432/hezqen` | Yes | PostgreSQL connection string used by Payload |
| `PAYLOAD_SECRET` | `replace-with-at-least-32-random-bytes` | Yes | Payload secret; replace with a unique high-entropy value |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Yes | Canonical application origin |
| `HEZQEN_ALLOWED_ORIGINS` | `http://localhost:3000` | Yes | Comma-separated CORS/CSRF origin allowlist |

## Validation rules

- `DATABASE_URL` must point to the intended HEZQEN database.
- `PAYLOAD_SECRET` must be supplied explicitly; there is no production fallback.
- `HEZQEN_ALLOWED_ORIGINS` accepts exact origins, not arbitrary paths.
- Non-local origins must use HTTPS.
- `NEXT_PUBLIC_SITE_URL` must match an entry in `HEZQEN_ALLOWED_ORIGINS`.
- Production must set all values explicitly and use distinct production credentials.
- Never commit `.env` or expose private values through `NEXT_PUBLIC_*`.

## Local example

```dotenv
DATABASE_URL=postgres://hezqen:local-password@localhost:5432/hezqen
PAYLOAD_SECRET=replace-with-a-unique-random-secret-of-at-least-32-bytes
NEXT_PUBLIC_SITE_URL=http://localhost:3000
HEZQEN_ALLOWED_ORIGINS=http://localhost:3000
```

This is an illustrative local configuration. The database user, password and secret must be created for your own environment.

## Related commands

- `pnpm dev`: start the development server.
- `pnpm build`: generate the Payload import map and types, then build Next.js.
- `pnpm payload`: invoke the local Payload CLI wrapper.
- `pnpm bootstrap:admin`: create the first administrator only after the database schema is migrated and the explicit bootstrap confirmation variables are set.

See [CMS setup](../CMS_SETUP.md) for migration and administrator requirements.
