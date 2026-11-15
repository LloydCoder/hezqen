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
import { resolveAllowedOrigins, resolvePayloadServerUrl } from "./lib/origins.ts";
import {
  editorialReviewEndpoint,
  editorialWorkflowEndpoint,
  scheduledPublicationEndpoint,
} from "./lib/editorial-endpoints.ts";
import { createResendEmailAdapter } from "./lib/resend-email-adapter.ts";
import { evidenceDownloadEndpoint, evidenceUploadEndpoint } from "./lib/evidence-endpoints.ts";
import {
  claimVerifyEndpoint,
  evidenceVerifyEndpoint,
} from "./lib/research-verification-endpoints.ts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const databaseUrl = process.env.DATABASE_URL;
const secret = process.env.PAYLOAD_SECRET;
const emailFrom = process.env.PAYLOAD_EMAIL_FROM ?? "HEZQEN <no-reply@tinlance.com>";
const emailFromMatch = /^(.*?)\s*<([^<>]+)>$/.exec(emailFrom);
const emailFromName = emailFromMatch?.[1]?.trim() || "HEZQEN";
const emailFromAddress = emailFromMatch?.[2]?.trim() || "no-reply@tinlance.com";
const allowedOrigins = resolveAllowedOrigins({
  configuredOrigins: process.env.HEZQEN_ALLOWED_ORIGINS,
  deploymentHostname: process.env.VERCEL_URL,
  deploymentEnvironment: process.env.VERCEL_ENV,
  nodeEnv: process.env.NODE_ENV,
  allowLocalRuntimeTest:
    process.env.CI === "true" && process.env.HEZQEN_LOCAL_RUNTIME_TEST === "true",
});
const serverURL = resolvePayloadServerUrl({
  configuredSiteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  payloadServerUrl: process.env.HEZQEN_PAYLOAD_SERVER_URL,
  deploymentHostname: process.env.VERCEL_URL,
  deploymentEnvironment: process.env.VERCEL_ENV,
  allowedOrigins,
  nodeEnv: process.env.NODE_ENV,
  allowLocalRuntimeTest:
    process.env.CI === "true" && process.env.HEZQEN_LOCAL_RUNTIME_TEST === "true",
});

if (
  allowedOrigins.length === 0 ||
  !serverURL ||
  !allowedOrigins.includes(new URL(serverURL).origin)
) {
  throw new Error("Payload server URL must match one of HEZQEN_ALLOWED_ORIGINS.");
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
  endpoints: [
    editorialWorkflowEndpoint,
    editorialReviewEndpoint,
    scheduledPublicationEndpoint,
    evidenceUploadEndpoint,
    evidenceDownloadEndpoint,
    evidenceVerifyEndpoint,
    claimVerifyEndpoint,
  ],
  email: process.env.RESEND_API_KEY
    ? createResendEmailAdapter({
        apiKey: process.env.RESEND_API_KEY,
        defaultFromAddress: emailFromAddress,
        defaultFromName: emailFromName,
      })
    : undefined,
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
