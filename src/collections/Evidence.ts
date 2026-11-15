import { APIError, type Access, type CollectionConfig } from "payload";

import { hasActiveRole } from "../lib/access.ts";
import { hasTrustedRequestContext } from "../lib/request-context.ts";

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
  hooks: {
    beforeDelete: [
      () => {
        throw new APIError("Evidence records cannot be deleted.", 403);
      },
    ],
    beforeChange: [
      ({ data, operation, req }) => {
        if (operation === "create" && !hasTrustedRequestContext(req.context, "hezqenEvidencePreservation")) {
          throw new APIError(
            "Evidence can only be created through the preservation endpoint.",
            403,
          );
        }
        if (operation === "update") {
          if (!hasTrustedRequestContext(req.context, "hezqenEvidenceVerification")) {
            throw new APIError("Evidence metadata is immutable outside human verification.", 403);
          }
          const allowedFields = ["verificationStatus", "updatedAt"];
          if (Object.keys(data ?? {}).some((field) => !allowedFields.includes(field))) {
            throw new APIError("Only evidence verification status may be updated.", 403);
          }
        }
        return data;
      },
    ],
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
