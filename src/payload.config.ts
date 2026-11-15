import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";

import { Articles } from "./collections/Articles";
import { AuditEvents } from "./collections/AuditEvents";
import { Claims } from "./collections/Claims";
import { Evidence } from "./collections/Evidence";
import { Sources } from "./collections/Sources";
import { Topics } from "./collections/Topics";
import { Users } from "./collections/Users";
import { resolveAllowedOrigins } from "./lib/origins.ts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const databaseUrl = process.env.DATABASE_URL;
const secret = process.env.PAYLOAD_SECRET;
const allowedOrigins = resolveAllowedOrigins({
  configuredOrigins: process.env.HEZQEN_ALLOWED_ORIGINS,
  deploymentHostname: process.env.VERCEL_URL,
  nodeEnv: process.env.NODE_ENV,
});
const serverURL = process.env.NEXT_PUBLIC_SITE_URL ?? allowedOrigins[0];

if (
  allowedOrigins.length === 0 ||
  !serverURL ||
  !allowedOrigins.includes(new URL(serverURL).origin)
) {
  throw new Error("NEXT_PUBLIC_SITE_URL must match one of HEZQEN_ALLOWED_ORIGINS.");
}

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run the HEZQEN CMS.");
}
if (!secret) {
  throw new Error("PAYLOAD_SECRET is required to run the HEZQEN CMS.");
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname, ".."),
      importMapFile: path.resolve(dirname, "../app/(payload)/admin/importMap.js"),
    },
  },
  collections: [Users, Articles, Topics, Sources, Evidence, Claims, AuditEvents],
  editor: lexicalEditor(),
  serverURL,
  csrf: allowedOrigins,
  cors: allowedOrigins,
  graphQL: {
    disable: true,
  },
  telemetry: false,
  debug: false,
  defaultDepth: 1,
  maxDepth: 3,
  secret,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUrl,
    },
    migrationDir: path.resolve(dirname, "migrations"),
    push: false,
  }),
});
