export interface AllowedOriginsInput {
  configuredOrigins?: string;
  deploymentHostname?: string;
  nodeEnv?: string;
  allowLocalRuntimeTest?: boolean;
}

export interface PayloadServerUrlInput {
  configuredSiteUrl?: string;
  deploymentHostname?: string;
  deploymentEnvironment?: string;
  allowedOrigins: string[];
  nodeEnv?: string;
  allowLocalRuntimeTest?: boolean;
}

function parseOrigin(value: string, allowLocalhostHttp: boolean): string {
  const parsed = new URL(value);
  if (
    parsed.username ||
    parsed.password ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash ||
    (parsed.protocol !== "https:" &&
      !(allowLocalhostHttp && parsed.protocol === "http:" && parsed.hostname === "localhost"))
  ) {
    throw new Error(
      "Allowed origins must contain only HTTPS origins (localhost is allowed for development).",
    );
  }
  return parsed.origin;
}

function parseDeploymentOrigin(hostname: string): string {
  const parsed = new URL(`https://${hostname}`);
  if (
    parsed.hostname !== hostname.toLowerCase() ||
    parsed.port ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error("VERCEL_URL must be an exact deployment hostname.");
  }
  return parsed.origin;
}

export function resolveAllowedOrigins(input: AllowedOriginsInput): string[] {
  const configured =
    input.configuredOrigins
      ?.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean) ?? [];
  const deploymentOrigin = input.deploymentHostname
    ? parseDeploymentOrigin(input.deploymentHostname)
    : null;
  const defaults =
    configured.length === 0 && input.nodeEnv !== "production" ? ["http://localhost:3000"] : [];

  return [
    ...new Set(
      [...configured, ...(deploymentOrigin ? [deploymentOrigin] : []), ...defaults].map((origin) =>
        parseOrigin(origin, input.nodeEnv !== "production" || input.allowLocalRuntimeTest === true),
      ),
    ),
  ];
}

export function resolvePayloadServerUrl(input: PayloadServerUrlInput): string | undefined {
  const allowLocalhostHttp =
    input.nodeEnv !== "production" || input.allowLocalRuntimeTest === true;
  const canonicalOrigin = input.configuredSiteUrl
    ? parseOrigin(input.configuredSiteUrl, allowLocalhostHttp)
    : undefined;

  if (input.nodeEnv === "production" && !canonicalOrigin) {
    throw new Error("NEXT_PUBLIC_SITE_URL is required in production.");
  }
  if (canonicalOrigin && !input.allowedOrigins.includes(canonicalOrigin)) {
    throw new Error("The canonical site origin must be allowed by HEZQEN_ALLOWED_ORIGINS.");
  }

  const previewOrigin =
    input.deploymentEnvironment === "preview" && input.deploymentHostname
      ? parseDeploymentOrigin(input.deploymentHostname)
      : undefined;
  const candidate = previewOrigin ?? canonicalOrigin ?? input.allowedOrigins[0];
  if (!candidate) return undefined;

  const origin = parseOrigin(candidate, allowLocalhostHttp);
  if (!input.allowedOrigins.includes(origin)) {
    throw new Error("Payload server URL must be allowed by HEZQEN_ALLOWED_ORIGINS.");
  }
  return origin;
}
