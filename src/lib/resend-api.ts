const RESEND_API_BASE = "https://api.resend.com";
const DEFAULT_NEWSLETTER_TEMPLATE_ID = "95fa201c-ffea-4f42-a4b4-d0495c9271d0";
const DEFAULT_NEWSLETTER_TOPIC_ID = "afe7e941-1bab-44c9-8687-d17dce151b14";

export class ResendApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ResendApiError";
  }
}

export interface ResendApiOptions {
  apiKey?: string;
  fetchImpl?: typeof fetch;
  newsletterTemplateId?: string;
  newsletterTopicId?: string;
  newsletterFrom?: string;
  transactionalFrom?: string;
}

export interface NewsletterContactInput {
  email: string;
  consentAt: string;
  consentVersion: string;
  signupSource: string;
  unsubscribeUrl: string;
}

export interface ResendContactSyncResult {
  status: "synced" | "blocked";
  contactId: string | null;
}

function requiredApiKey(options: ResendApiOptions): string {
  const apiKey = options.apiKey ?? process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured.");
  return apiKey;
}

function fetcher(options: ResendApiOptions): typeof fetch {
  return options.fetchImpl ?? fetch;
}

function apiHeaders(apiKey: string): HeadersInit {
  return {
    authorization: `Bearer ${apiKey}`,
    "content-type": "application/json",
  };
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  try {
    const value = (await response.json()) as unknown;
    return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

async function requestResend(
  options: ResendApiOptions,
  path: string,
  method: "GET" | "POST" | "PATCH",
  body?: Record<string, unknown>,
): Promise<{ response: Response; data: Record<string, unknown> }> {
  const apiKey = requiredApiKey(options);
  const response = await fetcher(options)(`${RESEND_API_BASE}${path}`, {
    method,
    headers: apiHeaders(apiKey),
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(10_000),
  });
  return { response, data: await readJson(response) };
}

function contactIdFrom(data: Record<string, unknown>): string | null {
  const nested =
    data.data && typeof data.data === "object" ? (data.data as Record<string, unknown>) : data;
  return typeof nested.id === "string" ? nested.id : null;
}

export async function sendNewsletterConfirmation(
  input: { email: string; confirmationUrl: string; idempotencyKey: string },
  options: ResendApiOptions = {},
): Promise<string | null> {
  const apiKey = requiredApiKey(options);
  const templateId =
    options.newsletterTemplateId ??
    process.env.HEZQEN_NEWSLETTER_CONFIRMATION_TEMPLATE_ID ??
    DEFAULT_NEWSLETTER_TEMPLATE_ID;
  const from =
    options.newsletterFrom ??
    process.env.HEZQEN_NEWSLETTER_FROM ??
    "HEZQEN <newsletter@tinlance.com>";
  const response = await fetcher(options)(`${RESEND_API_BASE}/emails`, {
    method: "POST",
    headers: {
      ...apiHeaders(apiKey),
      "idempotency-key": input.idempotencyKey,
    },
    body: JSON.stringify({
      from,
      to: [input.email],
      template: {
        id: templateId,
        variables: { CONFIRMATION_URL: input.confirmationUrl },
      },
    }),
    signal: AbortSignal.timeout(10_000),
  });
  const data = await readJson(response);
  if (!response.ok) {
    throw new ResendApiError(
      `Newsletter confirmation delivery failed (HTTP ${response.status}).`,
      response.status,
    );
  }
  return typeof data.id === "string" ? data.id : null;
}

export async function syncNewsletterContact(
  input: NewsletterContactInput,
  options: ResendApiOptions = {},
): Promise<ResendContactSyncResult> {
  const topicId =
    options.newsletterTopicId ??
    process.env.HEZQEN_NEWSLETTER_TOPIC_ID ??
    DEFAULT_NEWSLETTER_TOPIC_ID;
  const properties = {
    hezqen_newsletter_status: "confirmed",
    hezqen_newsletter_consent_at: input.consentAt,
    hezqen_newsletter_consent_version: input.consentVersion,
    hezqen_newsletter_signup_source: input.signupSource,
    hezqen_newsletter_unsubscribe_url: input.unsubscribeUrl,
  };
  const created = await requestResend(options, "/contacts", "POST", {
    email: input.email,
    unsubscribed: false,
    properties,
    topics: [{ id: topicId, subscription: "opt_in" }],
  });

  if (created.response.ok) {
    return { status: "synced", contactId: contactIdFrom(created.data) };
  }
  if (created.response.status !== 409) {
    throw new ResendApiError(
      `Resend contact creation failed (HTTP ${created.response.status}).`,
      created.response.status,
    );
  }

  const existing = await requestResend(
    options,
    `/contacts/${encodeURIComponent(input.email)}`,
    "GET",
  );
  if (!existing.response.ok) {
    throw new ResendApiError(
      `Resend contact lookup failed (HTTP ${existing.response.status}).`,
      existing.response.status,
    );
  }
  const contact =
    existing.data.data && typeof existing.data.data === "object"
      ? (existing.data.data as Record<string, unknown>)
      : existing.data;
  const contactId = typeof contact.id === "string" ? contact.id : null;
  if (contact.unsubscribed === true) return { status: "blocked", contactId };

  const updated = await requestResend(
    options,
    `/contacts/${encodeURIComponent(input.email)}`,
    "PATCH",
    { properties },
  );
  if (!updated.response.ok) {
    throw new ResendApiError(
      `Resend contact update failed (HTTP ${updated.response.status}).`,
      updated.response.status,
    );
  }

  const topicUpdate = await requestResend(
    options,
    `/contacts/${encodeURIComponent(input.email)}/topics`,
    "PATCH",
    { topics: [{ id: topicId, subscription: "opt_in" }] },
  );
  if (!topicUpdate.response.ok) {
    throw new ResendApiError(
      `Resend topic subscription update failed (HTTP ${topicUpdate.response.status}).`,
      topicUpdate.response.status,
    );
  }
  return { status: "synced", contactId };
}

export async function unsubscribeNewsletterContact(
  input: { email: string },
  options: ResendApiOptions = {},
): Promise<void> {
  const topicId =
    options.newsletterTopicId ??
    process.env.HEZQEN_NEWSLETTER_TOPIC_ID ??
    DEFAULT_NEWSLETTER_TOPIC_ID;
  const response = await requestResend(
    options,
    `/contacts/${encodeURIComponent(input.email)}/topics`,
    "PATCH",
    { topics: [{ id: topicId, subscription: "opt_out" }] },
  );
  if (response.response.status === 404) return;
  if (!response.response.ok) {
    throw new ResendApiError(
      `Resend topic unsubscribe failed (HTTP ${response.response.status}).`,
      response.response.status,
    );
  }
}

export async function sendTransactionalEmail(
  input: {
    to: string;
    subject: string;
    html: string;
    text: string;
    idempotencyKey: string;
    replyTo?: string;
  },
  options: ResendApiOptions = {},
): Promise<string | null> {
  const apiKey = requiredApiKey(options);
  const from =
    options.transactionalFrom ??
    process.env.HEZQEN_TRANSACTIONAL_FROM ??
    "HEZQEN <hello@tinlance.com>";
  const response = await fetcher(options)(`${RESEND_API_BASE}/emails`, {
    method: "POST",
    headers: {
      ...apiHeaders(apiKey),
      "idempotency-key": input.idempotencyKey,
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
    }),
    signal: AbortSignal.timeout(10_000),
  });
  const data = await readJson(response);
  if (!response.ok) {
    throw new ResendApiError(
      `Transactional email delivery failed (HTTP ${response.status}).`,
      response.status,
    );
  }
  return typeof data.id === "string" ? data.id : null;
}
