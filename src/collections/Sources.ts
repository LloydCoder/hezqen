import type { Access, CollectionConfig } from "payload";

type Actor = { role?: string } | null;

function roleFromRequest(user: unknown): string | undefined {
  return user && typeof user === "object" && "role" in user
    ? (user as Actor)?.role
    : undefined;
}

const canResearch: Access = ({ req }) =>
  ["administrator", "editor", "researcher", "fact_checker"].includes(
    roleFromRequest(req.user) ?? "",
  );

const canRead: Access = ({ req }) =>
  Boolean(req.user) &&
  ["administrator", "editor", "researcher", "fact_checker"].includes(
    roleFromRequest(req.user) ?? "",
  );

export const Sources: CollectionConfig = {
  slug: "sources",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "publisher", "sourceType", "retrievedAt"],
    group: "Research",
  },
  access: {
    create: canResearch,
    read: canRead,
    update: canResearch,
    delete: ({ req }) => roleFromRequest(req.user) === "administrator",
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "canonicalUrl", type: "text", required: true, index: true },
    { name: "publisher", type: "text", required: true },
    { name: "author", type: "text" },
    { name: "publishedAt", type: "date" },
    { name: "retrievedAt", type: "date", required: true },
    {
      name: "sourceType",
      type: "select",
      required: true,
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Dataset", value: "dataset" },
        { label: "Official Documentation", value: "official_documentation" },
      ],
    },
    { name: "notes", type: "textarea", access: { read: canResearch } },
  ],
  timestamps: true,
};
