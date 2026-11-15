import { APIError, type Access, type CollectionConfig } from "payload";

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
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        const context = req.context as Record<string, unknown> | undefined;
        if (operation === "create") {
          if (
            data?.verificationStatus !== undefined &&
            data.verificationStatus !== "unverified"
          ) {
            throw new APIError("New claims must begin as unverified.", 403);
          }
          if (data?.material === false || data?.reviewedBy != null || data?.reviewedAt != null) {
            throw new APIError("Claim verification metadata is server managed.", 403);
          }
        }
        if (operation === "update") {
          if (context?.hezqenClaimVerification !== true) {
            throw new APIError("Claims are immutable outside the verification workflow.", 403);
          }
          const allowedFields = ["verificationStatus", "reviewedBy", "reviewedAt", "updatedAt"];
          if (Object.keys(data ?? {}).some((field) => !allowedFields.includes(field))) {
            throw new APIError("Only claim verification metadata may be updated.", 403);
          }
        }
        return data;
      },
    ],
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
    { name: "material", type: "checkbox", defaultValue: true, access: { create: () => false, update: () => false } },
    {
      name: "reviewedBy",
      type: "relationship",
      relationTo: "users",
      access: { create: () => false, update: () => false },
    },
    { name: "reviewedAt", type: "date", access: { create: () => false, update: () => false } },
  ],
  timestamps: true,
};
