import { APIError, type Access, type CollectionConfig } from "payload";
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
    cookies: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    },
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "name", "role", "updatedAt"],
  },
  hooks: {
    beforeLogin: [
      ({ user }) => {
        if ((user as { active?: boolean }).active === false) {
          throw new APIError("This account is disabled.", 403);
        }
        return user;
      },
    ],
  },
  access: {
    admin: ({ req }) =>
      ["administrator", "editor", "author", "researcher", "fact_checker"].includes(
        actorFromRequest(req.user)?.role ?? "",
      ),
    create: isAdministrator,
    read: ({ req }) => {
      const actor = actorFromRequest(req.user);
      if (!actor) return false;
      return ["administrator", "editor"].includes(actor.role ?? "")
        ? true
        : { id: { equals: actor.id } };
    },
    update: ({ req }) => {
      const actor = actorFromRequest(req.user);
      if (!actor) return false;
      return actor.role === "administrator" ? true : { id: { equals: actor.id } };
    },
    delete: () => false,
  },
  fields: [
    {
      name: "email",
      type: "email",
      required: true,
      access: {
        read: ({ req, id }) => {
          const actor = actorFromRequest(req.user);
          return Boolean(
            actor && (["administrator", "editor"].includes(actor.role ?? "") || actor.id === id),
          );
        },
        update: ({ req }) => actorFromRequest(req.user)?.role === "administrator",
      },
    },
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
        read: ({ req }) =>
          ["administrator", "editor"].includes(actorFromRequest(req.user)?.role ?? ""),
        create: ({ req }) => actorFromRequest(req.user)?.role === "administrator",
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
        read: ({ req }) => actorFromRequest(req.user)?.role === "administrator",
        update: isAdministrator,
      },
    },
  ],
  timestamps: true,
};
