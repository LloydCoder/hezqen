export interface AllowedOriginsInput {
  configuredOrigins?: string;
  deploymentHostname?: string;
  nodeEnv?: string;
}

function parseOrigin(value: string): string {
  const parsed = new URL(value);
  if (
    parsed.username ||
    parsed.password ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash ||
    (parsed.protocol !== "https:" && parsed.hostname !== "localhost")
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
  const configured = input.configuredOrigins
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];
  const deploymentOrigin = input.deploymentHostname
    ? parseDeploymentOrigin(input.deploymentHostname)
    : null;
  const defaults =
    configured.length === 0 && input.nodeEnv !== "production"
      ? ["http://localhost:3000"]
      : [];

  return [
    ...new Set(
      [...configured, ...(deploymentOrigin ? [deploymentOrigin] : []), ...defaults].map(
        parseOrigin,
      ),
    ),
  ];
}
