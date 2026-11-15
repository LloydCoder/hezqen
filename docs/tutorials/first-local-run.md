# First local run

This tutorial takes you from a fresh checkout to the HEZQEN public application shell. It assumes you already have Node.js, pnpm and PostgreSQL installed.

## Prerequisites

- Node.js `^24.22.3 || >=26.13.1`
- pnpm `12.21.0`
- PostgreSQL 18 running locally
- A local database and database user for HEZQEN

Do not use staging or production credentials.

## 1. Install dependencies

From the repository root:

```bash
corepack enable
pnpm install --frozen-lockfile
```

## 2. Configure the environment

```bash
cp .env.example .env
```

Edit `.env` and set:

- `DATABASE_URL` to your local PostgreSQL database.
- `PAYLOAD_SECRET` to a unique secret containing at least 32 random bytes.
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.
- `HEZQEN_ALLOWED_ORIGINS=http://localhost:3000`.

For example, generate a secret with `openssl rand -base64 32` and paste the output into `.env`. Do not commit this file.

## 3. Start the application

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The public shell includes the homepage, About, Editorial Standards, division routes and Labs calculators. Payload CMS integration is present, but the initial database migration and operational admin setup are separate gates. Follow [CMS setup](../CMS_SETUP.md) before attempting to use the admin interface.

## 4. Run the checks

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
```

For the full CI-equivalent validation, also run `pnpm audit --audit-level moderate` and `pnpm build`.

## Expected result

The public application shell should render at localhost:3000. A successful local startup does not establish that the CMS schema is migrated, editorial publishing is operational, or production infrastructure is ready.
