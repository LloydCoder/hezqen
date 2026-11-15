import type { Access, CollectionConfig } from "payload";

type Actor = { role?: string } | null;

function roleFromRequest(user: unknown): string | undefined {
  return user && typeof user === "object" && "role" in user
    ? (user as Actor)?.role
    : undefined;
}

const canManageTopics: Access = ({ req }) =>
  ["administrator", "editor"].includes(roleFromRequest(req.user) ?? "");

export const Topics: CollectionConfig = {
  slug: "topics",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "updatedAt"],
    group: "Editorial",
  },
  access: {
    create: canManageTopics,
    read: () => true,
    update: canManageTopics,
    delete: ({ req }) => roleFromRequest(req.user) === "administrator",
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "description", type: "textarea" },
  ],
  timestamps: true,
};
