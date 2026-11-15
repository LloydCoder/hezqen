import type { Access, CollectionConfig } from "payload";

import { hasActiveRole } from "../lib/access.ts";

const canManageTopics: Access = ({ req }) => hasActiveRole(req.user, ["administrator", "editor"]);

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
    delete: () => false,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "description", type: "textarea" },
  ],
  timestamps: true,
};
