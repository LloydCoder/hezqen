import type { Access, CollectionConfig } from "payload";

type Actor = { id: string | number; role?: string } | null;

function actorFromRequest(user: unknown): Actor {
  return user && typeof user === "object" && "id" in user ? (user as Actor) : null;
}

const isAdministrator: Access = ({ req }) => actorFromRequest(req.user)?.role === "administrator";

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    tokenExpiration: 3600,
    maxLoginAttempts: 5,
    lockTime: 600_000,
    useSessions: true,
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "name", "role", "updatedAt"],
  },
  access: {
    admin: ({ req }) =>
      ["administrator", "editor"].includes(actorFromRequest(req.user)?.role ?? ""),
    create: isAdministrator,
    read: ({ req }) => {
      const actor = actorFromRequest(req.user);
      if (!actor) return false;
      return actor.role === "administrator" ? true : { id: { equals: actor.id } };
    },
    update: ({ req }) => {
      const actor = actorFromRequest(req.user);
      if (!actor) return false;
      return actor.role === "administrator" ? true : { id: { equals: actor.id } };
    },
    delete: isAdministrator,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "author",
      access: {
        create: isAdministrator,
        update: isAdministrator,
      },
      options: [
        { label: "Reader", value: "reader" },
        { label: "Author", value: "author" },
        { label: "Researcher", value: "researcher" },
        { label: "Fact Checker", value: "fact_checker" },
        { label: "Editor", value: "editor" },
        { label: "Administrator", value: "administrator" },
      ],
    },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      access: {
        update: isAdministrator,
      },
    },
  ],
  timestamps: true,
};
