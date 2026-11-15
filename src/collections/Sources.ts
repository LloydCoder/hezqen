import { APIError, type Access, type CollectionConfig } from "payload";

import { hasActiveRole } from "../lib/access.ts";

const canResearch: Access = ({ req }) =>
  hasActiveRole(req.user, ["administrator", "editor", "researcher", "fact_checker"]);

const canRead: Access = ({ req }) =>
  hasActiveRole(req.user, ["administrator", "editor", "researcher", "fact_checker"]);

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
    update: () => false,
    delete: () => false,
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
    {
      name: "notes",
      type: "textarea",
      access: {
        read: ({ req }) =>
          hasActiveRole(req.user, ["administrator", "editor", "researcher", "fact_checker"]),
      },
    },
  ],
  timestamps: true,
};
