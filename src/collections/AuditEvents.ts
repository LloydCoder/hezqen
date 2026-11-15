import type { Access, CollectionConfig } from "payload";

type Actor = { role?: string } | null;

function roleFromRequest(user: unknown): string | undefined {
  return user && typeof user === "object" && "role" in user ? (user as Actor)?.role : undefined;
}

const canReadAudit: Access = ({ req }) =>
  ["administrator", "editor"].includes(roleFromRequest(req.user) ?? "");

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
