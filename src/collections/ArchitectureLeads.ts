import { APIError, type Access, type CollectionConfig } from "payload";

import { hasActiveRole } from "../lib/access.ts";
import { hasTrustedRequestContext } from "../lib/request-context.ts";

const canReadLeads: Access = ({ req }) => hasActiveRole(req.user, ["administrator", "editor"]);

export const ArchitectureLeads: CollectionConfig = {
  slug: "architecture-leads",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "company", "projectType", "status", "createdAt"],
    group: "Audience",
  },
  access: {
    create: () => false,
    read: canReadLeads,
    update: canReadLeads,
    delete: () => false,
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        if (
          operation === "create" &&
          !hasTrustedRequestContext(req.context, "hezqenLeadWrite")
        ) {
          throw new APIError("Architecture-review requests are server-managed.", 403);
        }
        if (
          operation === "update" &&
          !hasActiveRole(req.user, ["administrator", "editor"])
        ) {
          throw new APIError("Only editors can update lead workflow status.", 403);
        }
        return data;
      },
    ],
    beforeDelete: [
      () => {
        throw new APIError("Architecture-review records cannot be deleted.", 403);
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true, maxLength: 120 },
    { name: "email", type: "email", required: true, index: true },
    { name: "company", type: "text", maxLength: 120 },
    { name: "calculatorContext", type: "text", maxLength: 120 },
    { name: "role", type: "text", maxLength: 80 },
    {
      name: "projectType",
      type: "select",
      required: true,
      options: [
        { label: "AI infrastructure", value: "ai-infrastructure" },
        { label: "Cloud architecture", value: "cloud-architecture" },
        { label: "Cybersecurity", value: "cybersecurity" },
        { label: "AI agents and automation", value: "ai-agents" },
        { label: "Performance and cost review", value: "performance-cost" },
        { label: "Other", value: "other" },
      ],
    },
    { name: "challenge", type: "textarea", required: true, maxLength: 2000 },
    {
      name: "budgetRange",
      type: "select",
      options: [
        { label: "Not specified", value: "unspecified" },
        { label: "Under $5,000", value: "under-5000" },
        { label: "$5,000–$15,000", value: "5000-15000" },
        { label: "$15,000–$50,000", value: "15000-50000" },
        { label: "$50,000+", value: "50000-plus" },
      ],
    },
    {
      name: "timeline",
      type: "select",
      required: true,
      options: [
        { label: "Exploring", value: "exploring" },
        { label: "Within 30 days", value: "0-30-days" },
        { label: "1–3 months", value: "1-3-months" },
        { label: "3–6 months", value: "3-6-months" },
        { label: "More than 6 months", value: "6-plus-months" },
      ],
    },
    {
      name: "source",
      type: "select",
      required: true,
      defaultValue: "unknown",
      options: [
        { label: "Article", value: "article" },
        { label: "Labs", value: "labs" },
        { label: "Contact", value: "contact" },
        { label: "Unknown", value: "unknown" },
      ],
    },
    { name: "contactConsent", type: "checkbox", required: true, defaultValue: false },
    { name: "privacyNoticeVersion", type: "text", required: true },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "new",
      options: [
        { label: "New", value: "new" },
        { label: "Qualified", value: "qualified" },
        { label: "Contacted", value: "contacted" },
        { label: "Converted", value: "converted" },
        { label: "Closed", value: "closed" },
        { label: "Spam", value: "spam" },
      ],
    },
    {
      name: "notificationStatus",
      type: "select",
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Sent", value: "sent" },
        { label: "Failed", value: "failed" },
      ],
    },
    {
      name: "confirmationEmailStatus",
      type: "select",
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Sent", value: "sent" },
        { label: "Failed", value: "failed" },
      ],
    },
    {
      name: "confirmationEmailLastError",
      type: "text",
      access: {
        read: ({ req }) => hasActiveRole(req.user, ["administrator"]),
        create: () => false,
        update: () => false,
      },
    },
    {
      name: "notificationLastError",
      type: "text",
      access: { read: ({ req }) => hasActiveRole(req.user, ["administrator"]), create: () => false, update: () => false },
    },
    {
      name: "notes",
      type: "textarea",
      access: { read: canReadLeads, create: canReadLeads, update: canReadLeads },
    },
  ],
  timestamps: true,
};
