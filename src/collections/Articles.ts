import type { Access, CollectionConfig } from "payload";

type Actor = { id: string | number; role?: string } | null;

function actorFromRequest(user: unknown): Actor {
  return user && typeof user === "object" && "id" in user ? (user as Actor) : null;
}

const isEditor: Access = ({ req }) =>
  ["administrator", "editor"].includes(actorFromRequest(req.user)?.role ?? "");

const publishedArticleFilter = {
  and: [{ _status: { equals: "published" } }, { workflowStatus: { equals: "published" } }],
};

const canReadArticles: Access = ({ req }) => {
  const actor = actorFromRequest(req.user);
  if (!actor) return publishedArticleFilter;
  if (["administrator", "editor"].includes(actor.role ?? "")) return true;
  return {
    or: [
      publishedArticleFilter,
      { author: { equals: actor.id } },
      { assignedEditor: { equals: actor.id } },
      { assignedFactChecker: { equals: actor.id } },
    ],
  };
};

const canCreateArticles: Access = ({ req }) =>
  ["administrator", "editor", "author"].includes(actorFromRequest(req.user)?.role ?? "");

const canUpdateArticles: Access = ({ req }) => {
  const actor = actorFromRequest(req.user);
  if (!actor) return false;
  if (["administrator", "editor"].includes(actor.role ?? "")) return true;
  if (actor.role === "author") {
    return {
      and: [
        { author: { equals: actor.id } },
        { workflowStatus: { in: ["pitch", "research", "draft"] } },
      ],
    };
  }
  return false;
};

export const Articles: CollectionConfig = {
  slug: "articles",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "division", "workflowStatus", "author", "updatedAt"],
    group: "Editorial",
  },
  versions: {
    drafts: {
      autosave: false,
    },
    maxPerDoc: 100,
  },
  access: {
    create: canCreateArticles,
    read: canReadArticles,
    readVersions: canReadArticles,
    update: canUpdateArticles,
    delete: () => false,
  },
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        if (operation === "create" && req.user) {
          return {
            ...data,
            author: req.user.id,
            workflowStatus: "draft",
            revision: 1,
          };
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      maxLength: 180,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "excerpt",
      type: "textarea",
      maxLength: 320,
    },
    {
      name: "body",
      type: "richText",
      required: true,
    },
    {
      name: "division",
      type: "select",
      required: true,
      options: [
        { label: "AI & Technology", value: "ai-technology" },
        { label: "Cybersecurity", value: "cybersecurity" },
        { label: "Cloud & Engineering", value: "cloud-engineering" },
        { label: "Business & Startups", value: "business-startups" },
      ],
    },
    {
      name: "topics",
      type: "relationship",
      relationTo: "topics",
      hasMany: true,
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
      required: true,
      access: {
        update: () => false,
      },
    },
    {
      name: "assignedEditor",
      type: "relationship",
      relationTo: "users",
      access: {
        create: () => false,
        update: isEditor,
      },
    },
    {
      name: "assignedFactChecker",
      type: "relationship",
      relationTo: "users",
      access: {
        create: () => false,
        update: isEditor,
      },
    },
    {
      name: "_status",
      type: "select",
      access: {
        create: () => false,
        update: () => false,
      },
    },
    {
      name: "workflowStatus",
      type: "select",
      required: true,
      defaultValue: "draft",
      index: true,
      access: {
        create: () => false,
        update: () => false,
      },
      options: [
        { label: "Pitch", value: "pitch" },
        { label: "Research", value: "research" },
        { label: "Draft", value: "draft" },
        { label: "Fact Check", value: "fact_check" },
        { label: "Editorial Review", value: "editorial_review" },
        { label: "Approved", value: "approved" },
        { label: "Scheduled", value: "scheduled" },
        { label: "Published", value: "published" },
        { label: "Correction Required", value: "correction_required" },
        { label: "Archived", value: "archived" },
      ],
    },
    {
      name: "factCheckComplete",
      type: "checkbox",
      defaultValue: false,
      access: {
        create: () => false,
        update: () => false,
      },
    },
    {
      name: "disclosuresReviewed",
      type: "checkbox",
      defaultValue: false,
      access: {
        create: () => false,
        update: () => false,
      },
    },
    {
      name: "approvedBy",
      type: "relationship",
      relationTo: "users",
      access: {
        create: () => false,
        update: () => false,
      },
    },
    {
      name: "approvedAt",
      type: "date",
      access: {
        create: () => false,
        update: () => false,
      },
    },
    {
      name: "publishedAt",
      type: "date",
      index: true,
      access: {
        create: () => false,
        update: () => false,
      },
    },
    {
      name: "revision",
      type: "number",
      required: true,
      defaultValue: 1,
      min: 1,
      access: {
        create: () => false,
        update: () => false,
      },
    },
  ],
  timestamps: true,
};
