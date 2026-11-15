import { APIError, type Access, type CollectionConfig, type Where } from "payload";

import { getActiveUserActor, hasActiveRole } from "../lib/access.ts";

const publishedArticleFilter: Where = {
  and: [{ _status: { equals: "published" } }, { workflowStatus: { equals: "published" } }],
};

const canReadArticles: Access = ({ req }) => {
  const actor = getActiveUserActor(req.user);
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
  hasActiveRole(req.user, ["administrator", "editor", "author"]);

const canUpdateArticles: Access = ({ req }) => {
  const actor = getActiveUserActor(req.user);
  if (!actor) return false;
  if (["administrator", "editor"].includes(actor.role ?? "")) return true;
  if (actor.role === "author") {
    const authorDraftScope: Where = {
      and: [
        { author: { equals: actor.id } },
        { workflowStatus: { in: ["pitch", "research", "draft"] } },
      ],
    };
    return authorDraftScope;
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
    beforeChange: [
      ({ data, originalDoc, operation, req }) => {
        if (operation !== "update") return data;
        const context = req.context as Record<string, unknown> | undefined;
        if (context?.hezqenSkipArticleRevisionIncrement === true) return data;

        const contentFields = ["title", "slug", "excerpt", "body", "division", "topics"];
        const changed = contentFields.some((field) => Object.hasOwn(data ?? {}, field));
        if (!changed) return data;

        const currentStatus = String(originalDoc?.workflowStatus ?? "draft");
        if (
          [
            "fact_check",
            "editorial_review",
            "approved",
            "scheduled",
            "published",
            "correction_required",
          ].includes(currentStatus)
        ) {
          throw new APIError(
            currentStatus === "published" || currentStatus === "correction_required"
              ? "Published content must enter the correction workflow before edits."
              : "Return the article to draft before editing its content.",
            409,
          );
        }

        const revision = Number(originalDoc?.revision ?? 1) + 1;
        return {
          ...data,
          revision,
          approvedBy: null,
          approvedAt: null,
          scheduledFor: null,
          factCheckComplete: false,
          disclosuresReviewed: false,
        };
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
        update: ({ req }) => hasActiveRole(req.user, ["administrator", "editor"]),
      },
    },
    {
      name: "assignedFactChecker",
      type: "relationship",
      relationTo: "users",
      access: {
        create: () => false,
        update: ({ req }) => hasActiveRole(req.user, ["administrator", "editor"]),
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
      name: "scheduledFor",
      type: "date",
      index: true,
      access: {
        create: () => false,
        update: () => false,
      },
    },
    {
      name: "correctionStatus",
      type: "select",
      defaultValue: "none",
      required: true,
      access: {
        create: () => false,
        update: () => false,
      },
      options: [
        { label: "None", value: "none" },
        { label: "Open", value: "open" },
        { label: "Resolved", value: "resolved" },
      ],
    },
    {
      name: "correctionReason",
      type: "textarea",
      access: {
        create: () => false,
        update: () => false,
      },
    },
    {
      name: "correctionPublicNote",
      type: "textarea",
      access: {
        create: () => false,
        update: () => false,
      },
    },
    {
      name: "correctionRequestedAt",
      type: "date",
      access: {
        create: () => false,
        update: () => false,
      },
    },
    {
      name: "correctionResolvedAt",
      type: "date",
      access: {
        create: () => false,
        update: () => false,
      },
    },
    {
      name: "correctionResolvedBy",
      type: "relationship",
      relationTo: "users",
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
