import type { Endpoint, PayloadRequest } from "payload";

import { resolveAllowedOrigins } from "./origins.ts";
import { withRequestContext } from "./request-context.ts";

const PRIVACY_NOTICE_VERSION = "2026-11-17";

const projectTypes = new Set([
  "ai-infrastructure",
  "cloud-architecture",
  "cybersecurity",
  "ai-agents",
  "performance-cost",
  "other",
]);
const timelines = new Set([
  "exploring",
  "0-30-days",
  "1-3-months",
  "3-6-months",
  "6-plus-months",
]);
const budgets = new Set([
  "unspecified",
  "under-5000",
  "5000-15000",
  "15000-50000",
  "50000-plus",
]);
const sources = new Set(["article", "labs", "contact", "unknown"]);

type LeadInput = {
  name: string;
  email: string;
  company?: string;
  role?: string;
  projectType: string;
  challenge: string;
  budgetRange: string;
  timeline: string;
  source: string;
  calculatorContext?: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function allowedOrigins(): string[] {
  return resolveAllowedOrigins({
    configuredOrigins: process.env.HEZQEN_ALLOWED_ORIGINS,
    deploymentHostname: process.env.VERCEL_URL,
    deploymentEnvironment: process.env.VERCEL_ENV,
    nodeEnv: process.env.NODE_ENV,
  });
}

function validEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function parseLead(value: unknown): LeadInput | null {
  const body = asRecord(value);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const role = typeof body.role === "string" ? body.role.trim() : "";
  const projectType = typeof body.projectType === "string" ? body.projectType : "";
  const challenge =
    typeof body.challenge === "string" ? body.challenge.trim() : "";
  const budgetRange =
    typeof body.budgetRange === "string" ? body.budgetRange : "";
  const timeline = typeof body.timeline === "string" ? body.timeline : "";
  const source = typeof body.source === "string" ? body.source : "unknown";
  const calculator =
    typeof body.calculator === "string" ? body.calculator.trim() : "";

  if (
    !name ||
    name.length > 120 ||
    !validEmail(email) ||
    company.length > 120 ||
    role.length > 80 ||
    !projectTypes.has(projectType) ||
    challenge.length < 10 ||
    challenge.length > 2000 ||
    !budgets.has(budgetRange) ||
    !timelines.has(timeline) ||
    !sources.has(source) ||
    calculator.length > 120 ||
    body.contactConsent !== true
  ) {
    return null;
  }

  return {
    name,
    email,
    company: company || undefined,
    role: role || undefined,
    projectType,
    challenge,
    budgetRange,
    timeline,
    source,
    calculatorContext: calculator || undefined,
  };
}

export const architectureReviewEndpoint: Endpoint = {
  path: "/architecture-review",
  method: "post",
  handler: async (req: PayloadRequest) => {
    const origin = req.headers.get("origin");
    if (!origin || !allowedOrigins().includes(origin)) {
      return Response.json(
        { ok: false, message: "Request origin is not allowed." },
        { status: 403 },
      );
    }

    let raw: unknown;
    try {
      raw = await req.json?.();
    } catch {
      return Response.json(
        { ok: false, message: "Invalid request body." },
        { status: 400 },
      );
    }
    const body = asRecord(raw);
    if (typeof body.website === "string" && body.website.trim()) {
      return Response.json(
        { ok: true, message: "Your request has been received." },
        { status: 202 },
      );
    }
    const lead = parseLead(body);
    if (!lead) {
      return Response.json(
        {
          ok: false,
          message: "Check the required fields and consent, then try again.",
        },
        { status: 400 },
      );
    }

    let transactionId: string | number | null = null;
    try {
      transactionId = await req.payload.db.beginTransaction();
      if (!transactionId) {
        return Response.json(
          {
            ok: false,
            message: "Secure request processing is temporarily unavailable.",
          },
          { status: 503 },
        );
      }
      req.transactionID = transactionId;
      const created = await withRequestContext(
        req,
        { hezqenLeadWrite: true },
        () =>
          req.payload.create({
            collection: "architecture-leads",
            data: {
              ...lead,
              contactConsent: true,
              privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
              status: "new",
              notificationStatus: "pending",
              confirmationEmailStatus: "pending",
            },
            overrideAccess: true,
            req,
          }),
      );
      await withRequestContext(req, { hezqenAuditWrite: true }, () =>
        req.payload.create({
          collection: "audit-events",
          data: {
            eventId: crypto.randomUUID(),
            actorId: "public",
            actorRole: "reader",
            action: "architecture_review.requested",
            resource: "architecture-lead",
            resourceId: String(created.id),
            correlationId:
              req.headers.get("x-request-id")?.slice(0, 128) ??
              crypto.randomUUID(),
            outcome: "success",
          },
          overrideAccess: true,
          req,
        }),
      );
      await req.payload.db.commitTransaction(transactionId);
      delete req.transactionID;
      transactionId = null;
      return Response.json(
        {
          ok: true,
          message:
            "Your request has been received. The Tinlance team will review it and follow up.",
        },
        { status: 201 },
      );
    } catch (error) {
      if (transactionId) {
        try {
          await req.payload.db.rollbackTransaction(transactionId);
        } catch {
          console.error(
            "[hezqen-architecture-review] transaction rollback failed",
          );
        }
        delete req.transactionID;
      }
      console.error(
        "[hezqen-architecture-review] request persistence failed",
        error instanceof Error ? error.name : "unknown",
      );
      return Response.json(
        {
          ok: false,
          message: "We could not submit the request. Please try again later.",
        },
        { status: 503 },
      );
    }
  },
};
