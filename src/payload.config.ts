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

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const isProductionBuild = process.env.NEXT_PHASE === "phase-production-build";

const databaseUrl =
  process.env.DATABASE_URL ??
  (isProductionBuild ? "postgres://build:build@127.0.0.1:5432/build" : undefined);
const secret =
  process.env.PAYLOAD_SECRET ??
  (isProductionBuild ? "hezqen-build-only-secret-never-use-at-runtime" : undefined);
const allowedOrigins =
  process.env.HEZQEN_ALLOWED_ORIGINS?.split(",").map((origin) => origin.trim()).filter(Boolean) ??
  (isProductionBuild ? ["https://hezqen.tinlance.com"] : ["http://localhost:3000"]);

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
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Articles, Topics, Sources, Evidence, Claims, AuditEvents],
  editor: lexicalEditor(),
  serverURL: process.env.NEXT_PUBLIC_SITE_URL ?? allowedOrigins[0],
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
    push: false,
  }),
});
