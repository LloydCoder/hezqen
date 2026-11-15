import { APIError, type Access, type CollectionConfig } from "payload";

import { hasActiveRole } from "../lib/access.ts";
import { hasTrustedRequestContext } from "../lib/request-context.ts";

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
    beforeDelete: [
      () => {
        throw new APIError("Audit events are append-only and cannot be deleted.", 403);
      },
    ],
    beforeChange: [
      ({ data, operation, req }) => {
        if (operation !== "create" || !hasTrustedRequestContext(req.context, "hezqenAuditWrite")) {
          throw new APIError("Audit events are append-only and server generated.", 403);
        }
        return data;
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
