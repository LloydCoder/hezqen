import { APIError, type Access, type CollectionConfig } from "payload";

import { hasActiveRole } from "../lib/access.ts";

const canReadAudit: Access = ({ req }) => hasActiveRole(req.user, ["administrator", "editor"]);

export const AuditEvents: CollectionConfig = {
  slug: "audit-events",
  admin: {
    useAsTitle: "eventId",
    defaultColumns: ["eventId", "actorId", "action", "resource", "createdAt"],
    group: "Operations",
  },
  access: {
    create: () => false,
    read: canReadAudit,
    update: () => false,
    delete: () => false,
  },
  hooks: {
    beforeChange: [
      ({ operation, req }) => {
        const context = req.context as Record<string, unknown> | undefined;
        if (operation !== "create" || context?.hezqenAuditWrite !== true) {
          throw new APIError("Audit events are append-only and server generated.", 403);
        }
      },
    ],
  },
  fields: [
    { name: "eventId", type: "text", required: true, unique: true },
    { name: "actorId", type: "text", required: true },
    { name: "actorRole", type: "text", required: true },
    { name: "action", type: "text", required: true },
    { name: "resource", type: "text", required: true },
    { name: "resourceId", type: "text", required: true },
    { name: "beforeDigest", type: "text" },
    { name: "afterDigest", type: "text" },
    { name: "correlationId", type: "text", index: true },
    {
      name: "outcome",
      type: "select",
      required: true,
      options: [
        { label: "Success", value: "success" },
        { label: "Rejected", value: "rejected" },
        { label: "Failure", value: "failure" },
      ],
    },
  ],
  timestamps: true,
};
