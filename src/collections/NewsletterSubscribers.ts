import { APIError, type Access, type CollectionConfig } from "payload";

import { hasActiveRole } from "../lib/access.ts";
import { hasTrustedRequestContext } from "../lib/request-context.ts";

const canReadAudience: Access = ({ req }) => hasActiveRole(req.user, ["administrator", "editor"]);

export const NewsletterSubscribers: CollectionConfig = {
  slug: "newsletter-subscribers",
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "status", "consentAt", "confirmedAt", "providerSyncStatus"],
    group: "Audience",
  },
  access: {
    create: () => false,
    read: canReadAudience,
    update: () => false,
    delete: () => false,
  },
  hooks: {
    beforeChange: [
      ({ operation, req }) => {
        if (
          !["create", "update"].includes(operation) ||
          !hasTrustedRequestContext(req.context, "hezqenNewsletterWrite")
        ) {
          throw new APIError("Newsletter consent records are server-managed.", 403);
        }
      },
    ],
    beforeDelete: [
      () => {
        throw new APIError("Newsletter consent records cannot be deleted.", 403);
      },
    ],
  },
  fields: [
    { name: "email", type: "email", required: true, unique: true, index: true },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending confirmation", value: "pending" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Unsubscribed", value: "unsubscribed" },
        { label: "Suppressed", value: "suppressed" },
      ],
    },
    { name: "consentVersion", type: "text", required: true },
    { name: "consentAt", type: "date", required: true },
    {
      name: "signupSource",
      type: "select",
      required: true,
      defaultValue: "unknown",
      options: [
        { label: "Footer", value: "footer" },
        { label: "Article", value: "article" },
        { label: "Labs", value: "labs" },
        { label: "Contact", value: "contact" },
        { label: "Unknown", value: "unknown" },
      ],
    },
    { name: "confirmedAt", type: "date" },
    { name: "unsubscribedAt", type: "date" },
    {
      name: "confirmationTokenHash",
      type: "text",
      unique: true,
      index: true,
      admin: { hidden: true },
      access: { read: () => false, create: () => false, update: () => false },
    },
    {
      name: "confirmationExpiresAt",
      type: "date",
      admin: { hidden: true },
      access: { read: () => false, create: () => false, update: () => false },
    },
    {
      name: "confirmationSendCount",
      type: "number",
      defaultValue: 0,
      admin: { hidden: true },
      access: { read: () => false, create: () => false, update: () => false },
    },
    {
      name: "confirmationWindowStartedAt",
      type: "date",
      admin: { hidden: true },
      access: { read: () => false, create: () => false, update: () => false },
    },
    {
      name: "lastConfirmationAttemptAt",
      type: "date",
      admin: { hidden: true },
      access: { read: () => false, create: () => false, update: () => false },
    },
    {
      name: "providerSyncStatus",
      type: "select",
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Synced", value: "synced" },
        { label: "Blocked by provider suppression", value: "blocked" },
        { label: "Failed", value: "failed" },
      ],
    },
    {
      name: "providerContactId",
      type: "text",
      admin: { hidden: true },
      access: { read: () => false, create: () => false, update: () => false },
    },
    { name: "providerSyncedAt", type: "date" },
  ],
  timestamps: true,
};
