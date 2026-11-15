import type { Access, CollectionConfig } from "payload";

type Actor = { id: string | number; role?: string } | null;

function actorFromRequest(user: unknown): Actor {
  return user && typeof user === "object" && "id" in user
    ? (user as Actor)
    : null;
}

const canReadClaims: Access = ({ req }) =>
  ["administrator", "editor", "researcher", "fact_checker"].includes(
    actorFromRequest(req.user)?.role ?? "",
  );

const canCreateClaims: Access = ({ req }) =>
  ["administrator", "editor", "researcher", "fact_checker"].includes(
    actorFromRequest(req.user)?.role ?? "",
  );

const canUpdateClaims: Access = ({ req }) => {
  const actor = actorFromRequest(req.user);
  return actor && ["administrator", "editor", "fact_checker"].includes(actor.role ?? "");
};

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
    update: canUpdateClaims,
    delete: ({ req }) => actorFromRequest(req.user)?.role === "administrator",
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
    { name: "reviewedBy", type: "relationship", relationTo: "users", access: { update: () => false } },
    { name: "reviewedAt", type: "date", access: { update: () => false } },
  ],
  timestamps: true,
};
