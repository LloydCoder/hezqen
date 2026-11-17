import { createHash, randomUUID } from "node:crypto";
import type { Endpoint, PayloadRequest } from "payload";

import { hasActiveRole } from "./access.ts";
import { resolveAllowedOrigins } from "./origins.ts";
import { withRequestContext } from "./request-context.ts";
import {
  canSendConfirmation,
  createConfirmationToken,
  createUnsubscribeToken,
  hashConfirmationToken,
  NEWSLETTER_CONSENT_VERSION,
  normalizeNewsletterEmail,
  normalizeNewsletterSignupSource,
  verifyUnsubscribeToken,
} from "../domain/newsletter/consent.ts";
import {
  sendNewsletterConfirmation,
  syncNewsletterContact,
  unsubscribeNewsletterContact,
} from "./resend-api.ts";

interface SubscriberRecord {
  id: string | number;
  email: string;
  status: "pending" | "confirmed" | "unsubscribed" | "suppressed";
  consentVersion: string;
  consentAt: string;
  signupSource: string;
  confirmedAt?: string | null;
  unsubscribedAt?: string | null;
  confirmationTokenHash?: string | null;
  confirmationExpiresAt?: string | null;
  confirmationSendCount?: number | null;
  confirmationWindowStartedAt?: string | null;
  lastConfirmationAttemptAt?: string | null;
  providerSyncStatus?: "pending" | "synced" | "blocked" | "failed";
  providerContactId?: string | null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

async function readJson(req: PayloadRequest): Promise<Record<string, unknown>> {
  try {
    return asRecord(await req.json?.());
  } catch {
    return {};
  }
}

function allowedOrigins(): string[] {
  return resolveAllowedOrigins({
    configuredOrigins: process.env.HEZQEN_ALLOWED_ORIGINS,
    deploymentHostname: process.env.VERCEL_URL,
    deploymentEnvironment: process.env.VERCEL_ENV,
    nodeEnv: process.env.NODE_ENV,
  });
}

function hasAllowedOrigin(req: PayloadRequest): boolean {
  const origin = req.headers.get("origin");
  return Boolean(origin && allowedOrigins().includes(origin));
}

function getSiteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configured) throw new Error("NEXT_PUBLIC_SITE_URL is not configured.");
  const origin = new URL(configured).origin;
  if (!allowedOrigins().includes(origin)) {
    throw new Error("The configured site origin is not allowed.");
  }
  return origin;
}

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

async function appendAuditEvent(
  req: PayloadRequest,
  input: {
    action: string;
    resourceId: string;
    outcome: "success" | "rejected" | "failure";
    after?: unknown;
  },
): Promise<void> {
  await withRequestContext(req, { hezqenAuditWrite: true }, () =>
    req.payload.create({
      collection: "audit-events",
      data: {
        eventId: randomUUID(),
        actorId: "public",
        actorRole: "reader",
        action: input.action,
        resource: "newsletter-subscriber",
        resourceId: input.resourceId,
        afterDigest: input.after === undefined ? undefined : digest(input.after),
        correlationId: req.headers.get("x-request-id")?.slice(0, 128) ?? randomUUID(),
        outcome: input.outcome,
      },
      overrideAccess: true,
      req,
    }),
  );
}

async function updateSubscriber(
  req: PayloadRequest,
  id: string | number,
  data: Record<string, unknown>,
): Promise<SubscriberRecord> {
  const updated = await withRequestContext(req, { hezqenNewsletterWrite: true }, () =>
    req.payload.update({
      collection: "newsletter-subscribers",
      id,
      data,
      overrideAccess: true,
      req,
    }),
  );
  return updated as unknown as SubscriberRecord;
}

function confirmationUrl(token: string): string {
  const url = new URL("/newsletter/confirm", getSiteOrigin());
  url.searchParams.set("token", token);
  return url.toString();
}

function unsubscribeUrl(subscriber: SubscriberRecord): string {
  if (!subscriber.confirmedAt) throw new Error("A confirmed subscriber timestamp is required.");
  const secret =
    process.env.HEZQEN_NEWSLETTER_UNSUBSCRIBE_SECRET ?? process.env.PAYLOAD_SECRET ?? "";
  const token = createUnsubscribeToken(String(subscriber.id), subscriber.confirmedAt, secret);
  const url = new URL("/newsletter/unsubscribe", getSiteOrigin());
  url.searchParams.set("token", token);
  return url.toString();
}

function genericSignupResponse(): Response {
  return Response.json(
    {
      ok: true,
      message: "If this address is eligible, a confirmation email will arrive shortly.",
    },
    { status: 202 },
  );
}

export const newsletterSubscribeEndpoint: Endpoint = {
  path: "/newsletter/subscribe",
  method: "post",
  handler: async (req) => {
    if (!hasAllowedOrigin(req)) {
      return Response.json(
        { ok: false, message: "Request origin is not allowed." },
        { status: 403 },
      );
    }

    const body = await readJson(req);
    if (typeof body.website === "string" && body.website.trim()) return genericSignupResponse();

    const email = normalizeNewsletterEmail(body.email);
    if (!email || body.consent !== true) {
      return Response.json(
        { ok: false, message: "Enter a valid email address and provide newsletter consent." },
        { status: 400 },
      );
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const source = normalizeNewsletterSignupSource(body.source);
    const existingResult = await req.payload.find({
      collection: "newsletter-subscribers",
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    });
    const existing = existingResult.docs[0] as unknown as SubscriberRecord | undefined;

    if (existing?.status === "confirmed" || existing?.status === "suppressed") {
      return genericSignupResponse();
    }

    const priorWindowStart = existing?.confirmationWindowStartedAt ?? null;
    const priorAttempt = existing?.lastConfirmationAttemptAt ?? null;
    const priorCount = existing?.confirmationSendCount ?? 0;
    const windowExpired =
      !priorWindowStart ||
      !Number.isFinite(Date.parse(priorWindowStart)) ||
      now.getTime() - Date.parse(priorWindowStart) >= 24 * 60 * 60 * 1000;
    const windowStartedAt = windowExpired ? nowIso : priorWindowStart;
    const sendCount = windowExpired ? 0 : priorCount;

    if (existing && !canSendConfirmation(sendCount, windowStartedAt, priorAttempt, now.getTime())) {
      return genericSignupResponse();
    }

    const token = createConfirmationToken(now.getTime());
    const writeData = {
      email,
      status: "pending" as const,
      consentVersion: NEWSLETTER_CONSENT_VERSION,
      consentAt: nowIso,
      signupSource: source,
      confirmedAt: null,
      unsubscribedAt: null,
      confirmationTokenHash: token.tokenHash,
      confirmationExpiresAt: token.expiresAt,
      // Count the attempt before contacting the provider so failed sends consume the daily budget.
      confirmationSendCount: sendCount + 1,
      confirmationWindowStartedAt: windowStartedAt,
      lastConfirmationAttemptAt: nowIso,
      providerSyncStatus: "pending" as const,
      providerContactId: null,
    };

    const subscriber = existing
      ? await updateSubscriber(req, existing.id, writeData)
      : ((await withRequestContext(req, { hezqenNewsletterWrite: true }, () =>
          req.payload.create({
            collection: "newsletter-subscribers",
            data: writeData,
            overrideAccess: true,
            req,
          }),
        )) as unknown as SubscriberRecord);

    await appendAuditEvent(req, {
      action: "newsletter.consent.requested",
      resourceId: String(subscriber.id),
      outcome: "success",
      after: {
        status: "pending",
        consentVersion: NEWSLETTER_CONSENT_VERSION,
        consentAt: nowIso,
        signupSource: source,
      },
    });

    try {
      await sendNewsletterConfirmation({
        email,
        confirmationUrl: confirmationUrl(token.token),
        idempotencyKey: `hezqen-newsletter-confirm/${subscriber.id}/${token.tokenHash}`,
      });
    } catch (error) {
      await appendAuditEvent(req, {
        action: "newsletter.confirmation.delivery_failed",
        resourceId: String(subscriber.id),
        outcome: "failure",
        after: { status: "pending", error: error instanceof Error ? error.name : "unknown" },
      });
      console.error(
        "[hezqen-newsletter] confirmation delivery failed",
        error instanceof Error ? error.name : "unknown",
      );
    }

    return genericSignupResponse();
  },
};

export const newsletterConfirmEndpoint: Endpoint = {
  path: "/newsletter/confirm",
  method: "post",
  handler: async (req) => {
    if (!hasAllowedOrigin(req)) {
      return Response.json(
        { ok: false, message: "Request origin is not allowed." },
        { status: 403 },
      );
    }
    const body = await readJson(req);
    const token = typeof body.token === "string" ? body.token : "";
    if (token.length < 32 || token.length > 128) {
      return Response.json(
        { ok: false, message: "This confirmation link is invalid or expired." },
        { status: 400 },
      );
    }

    const tokenHash = hashConfirmationToken(token);
    const result = await req.payload.find({
      collection: "newsletter-subscribers",
      where: {
        and: [{ confirmationTokenHash: { equals: tokenHash } }, { status: { equals: "pending" } }],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    });
    const subscriber = result.docs[0] as unknown as SubscriberRecord | undefined;
    if (
      !subscriber ||
      !subscriber.confirmationExpiresAt ||
      Date.parse(subscriber.confirmationExpiresAt) <= Date.now()
    ) {
      return Response.json(
        { ok: false, message: "This confirmation link is invalid or expired." },
        { status: 410 },
      );
    }

    const confirmedAt = new Date().toISOString();
    const confirmed = await updateSubscriber(req, subscriber.id, {
      status: "confirmed",
      confirmedAt,
      confirmationTokenHash: null,
      confirmationExpiresAt: null,
      providerSyncStatus: "pending",
    });
    await appendAuditEvent(req, {
      action: "newsletter.consent.confirmed",
      resourceId: String(confirmed.id),
      outcome: "success",
      after: { status: "confirmed", consentVersion: confirmed.consentVersion, confirmedAt },
    });

    try {
      const sync = await syncNewsletterContact({
        email: confirmed.email,
        consentAt: confirmed.consentAt,
        consentVersion: confirmed.consentVersion,
        signupSource: confirmed.signupSource,
        unsubscribeUrl: unsubscribeUrl(confirmed),
      });
      if (sync.status === "blocked") {
        await updateSubscriber(req, confirmed.id, {
          status: "suppressed",
          providerSyncStatus: "blocked",
          providerContactId: sync.contactId,
        });
        return Response.json({
          ok: true,
          status: "suppressed",
          message:
            "Your confirmation was recorded, but this address has an existing provider-wide unsubscribe preference.",
        });
      }
      await updateSubscriber(req, confirmed.id, {
        providerSyncStatus: "synced",
        providerContactId: sync.contactId,
        providerSyncedAt: new Date().toISOString(),
      });
      return Response.json({
        ok: true,
        status: "confirmed",
        message:
          "Your subscription is confirmed. You are now on the HEZQEN Intelligence Brief list.",
      });
    } catch (error) {
      await updateSubscriber(req, confirmed.id, { providerSyncStatus: "failed" });
      await appendAuditEvent(req, {
        action: "newsletter.provider_sync.failed",
        resourceId: String(confirmed.id),
        outcome: "failure",
        after: { status: "confirmed", error: error instanceof Error ? error.name : "unknown" },
      });
      console.error(
        "[hezqen-newsletter] provider sync failed",
        error instanceof Error ? error.name : "unknown",
      );
      return Response.json({
        ok: true,
        status: "sync-pending",
        message:
          "Your consent is confirmed. Delivery activation is being retried; you do not need to submit again.",
      });
    }
  },
};

export const newsletterUnsubscribeEndpoint: Endpoint = {
  path: "/newsletter/unsubscribe",
  method: "post",
  handler: async (req) => {
    if (!hasAllowedOrigin(req)) {
      return Response.json(
        { ok: false, message: "Request origin is not allowed." },
        { status: 403 },
      );
    }
    const body = await readJson(req);
    const token = typeof body.token === "string" ? body.token : "";
    const secret =
      process.env.HEZQEN_NEWSLETTER_UNSUBSCRIBE_SECRET ?? process.env.PAYLOAD_SECRET ?? "";
    const payload = verifyUnsubscribeToken(token, secret);
    if (!payload) {
      return Response.json(
        { ok: false, message: "This unsubscribe link is invalid." },
        { status: 400 },
      );
    }

    const result = await req.payload.find({
      collection: "newsletter-subscribers",
      where: {
        id: {
          equals: /^\\d+$/.test(payload.subscriberId)
            ? Number(payload.subscriberId)
            : payload.subscriberId,
        },
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    });
    const subscriber = result.docs[0] as unknown as SubscriberRecord | undefined;
    if (!subscriber || subscriber.confirmedAt !== payload.confirmedAt) {
      return Response.json(
        { ok: false, message: "This unsubscribe link is invalid or no longer active." },
        { status: 400 },
      );
    }
    if (subscriber.status === "unsubscribed") {
      return Response.json({ ok: true, message: "This address is already unsubscribed." });
    }
    if (subscriber.status !== "confirmed") {
      return Response.json(
        { ok: false, message: "This address is not currently subscribed." },
        { status: 409 },
      );
    }

    const unsubscribedAt = new Date().toISOString();
    await updateSubscriber(req, subscriber.id, {
      status: "unsubscribed",
      unsubscribedAt,
      providerSyncStatus: "pending",
    });
    await appendAuditEvent(req, {
      action: "newsletter.consent.withdrawn",
      resourceId: String(subscriber.id),
      outcome: "success",
      after: { status: "unsubscribed", unsubscribedAt },
    });

    try {
      await unsubscribeNewsletterContact({ email: subscriber.email });
      await updateSubscriber(req, subscriber.id, {
        providerSyncStatus: "synced",
        providerSyncedAt: new Date().toISOString(),
      });
    } catch (error) {
      await updateSubscriber(req, subscriber.id, { providerSyncStatus: "failed" });
      await appendAuditEvent(req, {
        action: "newsletter.provider_unsubscribe.failed",
        resourceId: String(subscriber.id),
        outcome: "failure",
        after: { status: "unsubscribed", error: error instanceof Error ? error.name : "unknown" },
      });
      console.error(
        "[hezqen-newsletter] provider unsubscribe failed",
        error instanceof Error ? error.name : "unknown",
      );
    }

    return Response.json({
      ok: true,
      message: "Your unsubscribe request has been recorded.",
    });
  },
};

export const newsletterSyncEndpoint: Endpoint = {
  path: "/newsletter/sync",
  method: "post",
  handler: async (req) => {
    if (!hasActiveRole(req.user, ["administrator"])) {
      return Response.json(
        { ok: false, message: "Administrator access is required." },
        { status: 403 },
      );
    }
    const result = await req.payload.find({
      collection: "newsletter-subscribers",
      where: {
        and: [
          { status: { in: ["confirmed", "unsubscribed"] } },
          { providerSyncStatus: { in: ["pending", "failed"] } },
        ],
      },
      limit: 50,
      depth: 0,
      overrideAccess: true,
      req,
    });
    let synced = 0;
    let failed = 0;
    for (const document of result.docs as unknown as SubscriberRecord[]) {
      try {
        if (document.status === "unsubscribed") {
          await unsubscribeNewsletterContact({ email: document.email });
        } else {
          const sync = await syncNewsletterContact({
            email: document.email,
            consentAt: document.consentAt,
            consentVersion: document.consentVersion,
            signupSource: document.signupSource,
            unsubscribeUrl: unsubscribeUrl(document),
          });
          if (sync.status === "blocked") {
            await updateSubscriber(req, document.id, {
              status: "suppressed",
              providerSyncStatus: "blocked",
              providerContactId: sync.contactId,
            });
            synced += 1;
            continue;
          }
          await updateSubscriber(req, document.id, {
            providerSyncStatus: "synced",
            providerContactId: sync.contactId,
            providerSyncedAt: new Date().toISOString(),
          });
        }
        if (document.status === "unsubscribed") {
          await updateSubscriber(req, document.id, {
            providerSyncStatus: "synced",
            providerSyncedAt: new Date().toISOString(),
          });
        }
        synced += 1;
      } catch {
        await updateSubscriber(req, document.id, { providerSyncStatus: "failed" });
        failed += 1;
      }
    }
    return Response.json({ ok: failed === 0, processed: result.docs.length, synced, failed });
  },
};
