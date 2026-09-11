import { defineField, defineType } from "sanity";

export const language = defineType({
  name: "language", title: "Language", type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "nativeName", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "code", type: "string", validation: (rule) => rule.required().regex(/^[a-z]{2,3}$/) }),
    defineField({ name: "locale", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slugPrefix", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "enabled", type: "boolean", initialValue: true }),
    defineField({ name: "default", type: "boolean", description: "Only one language may be the default.", initialValue: false, validation: (rule) => rule.custom(async (value, context) => {
      if (!value || !context.document?._id) return true;
      const id = context.document._id.replace(/^drafts\./, "");
      const otherDefaults = await context.getClient({ apiVersion: "2026-09-01" }).fetch<number>(`count(*[_type == "language" && default == true && !(_id in [$id, $draftId])])`, { id, draftId: `drafts.${id}` });
      return otherDefaults === 0 || "Only one language can be the default.";
    }) }),
    defineField({ name: "order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Menu order", name: "menuOrder", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "nativeName", subtitle: "code" } },
});
