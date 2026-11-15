import type { Access, CollectionConfig } from "payload";

type Actor = { role?: string } | null;

function roleFromRequest(user: unknown): string | undefined {
  return user && typeof user === "object" && "role" in user ? (user as Actor)?.role : undefined;
}

const canReadEvidence: Access = ({ req }) =>
  ["administrator", "editor", "researcher", "fact_checker"].includes(
    roleFromRequest(req.user) ?? "",
  );

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
