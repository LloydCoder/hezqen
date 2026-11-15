import type { Access, CollectionConfig } from "payload";

import { hasActiveRole } from "../lib/access.ts";

const canReadEvidence: Access = ({ req }) =>
  hasActiveRole(req.user, ["administrator", "editor", "researcher", "fact_checker"]);

export const Evidence: CollectionConfig = {
  slug: "evidence",
  admin: {
    useAsTitle: "evidenceId",
    defaultColumns: ["evidenceId", "source", "verificationStatus", "retrievedAt"],
    group: "Research",
  },
  access: {
    create: () => false,
    read: canReadEvidence,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "evidenceId", type: "text", required: true, unique: true, index: true },
    {
      name: "source",
      type: "relationship",
      relationTo: "sources",
      required: true,
    },
    { name: "collectionMethod", type: "text", required: true },
    { name: "retrievedAt", type: "date", required: true },
    { name: "contentType", type: "text", required: true },
    { name: "byteSize", type: "number", required: true, min: 0 },
    { name: "sha256", type: "text", required: true, minLength: 64, maxLength: 64 },
    { name: "storageRef", type: "text", required: true },
    { name: "objectVersion", type: "text" },
    {
      name: "verificationStatus",
      type: "select",
      required: true,
      defaultValue: "captured",
      options: [
        { label: "Captured", value: "captured" },
        { label: "Preserved", value: "preserved" },
        { label: "Verified", value: "verified" },
        { label: "Rejected", value: "rejected" },
      ],
    },
  ],
  timestamps: true,
};
