import type { Access, CollectionConfig } from "payload";

import { hasActiveRole } from "../lib/access.ts";

const canReadClaims: Access = ({ req }) =>
  hasActiveRole(req.user, ["administrator", "editor", "researcher", "fact_checker"]);

const canCreateClaims: Access = ({ req }) =>
  hasActiveRole(req.user, ["administrator", "editor", "researcher", "fact_checker"]);

export const Claims: CollectionConfig = {
  slug: "claims",
  admin: {
    useAsTitle: "claimText",
    defaultColumns: ["claimText", "verificationStatus", "updatedAt"],
    group: "Research",
  },
  access: {
    create: canCreateClaims,
    read: canReadClaims,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "claimText", type: "textarea", required: true },
    {
      name: "article",
      type: "relationship",
      relationTo: "articles",
    },
    {
      name: "sources",
      type: "relationship",
      relationTo: "sources",
      hasMany: true,
      required: true,
    },
    {
      name: "evidence",
      type: "relationship",
      relationTo: "evidence",
      hasMany: true,
      required: true,
    },
    {
      name: "verificationStatus",
      type: "select",
      required: true,
      defaultValue: "unverified",
      access: {
        create: () => false,
        update: () => false,
      },
      options: [
        { label: "Verified", value: "verified" },
        { label: "Corroborated", value: "corroborated" },
        { label: "Attributed", value: "attributed" },
        { label: "Disputed", value: "disputed" },
        { label: "Unverified", value: "unverified" },
        { label: "Corrected", value: "corrected" },
      ],
    },
    { name: "material", type: "checkbox", defaultValue: true },
    {
      name: "reviewedBy",
      type: "relationship",
      relationTo: "users",
      access: { create: () => false, update: () => false },
    },
    { name: "reviewedAt", type: "date", access: { update: () => false } },
  ],
  timestamps: true,
};
