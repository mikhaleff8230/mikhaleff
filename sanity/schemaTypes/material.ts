import { defineField, defineType } from "sanity";

export const material = defineType({
  name: "material",
  title: "Material / Medium",
  type: "document",
  fields: [
    defineField({ name: "key", title: "System key", type: "slug", options: { source: "title.en", maxLength: 80 }, validation: (rule) => rule.required() }),
    defineField({ name: "title", title: "Display name", type: "localizedString", validation: (rule) => rule.required() }),
    defineField({ name: "order", type: "number", initialValue: 100 }),
  ],
  preview: { select: { title: "title.en", ru: "title.ru", zh: "title.zh" }, prepare: ({ title, ru, zh }) => ({ title: title || ru || zh || "Material", subtitle: [ru, zh].filter(Boolean).join(" · ") }) },
});