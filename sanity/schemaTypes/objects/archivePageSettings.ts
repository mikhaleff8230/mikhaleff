import { defineField, defineType } from "sanity";

export const archivePageSettings = defineType({
  name: "archivePageSettings", title: "Archive page settings", type: "object",
  fields: [
    defineField({ name: "eyebrow", type: "localizedString" }),
    defineField({ name: "title", type: "localizedString", validation: (rule) => rule.required() }),
    defineField({ name: "subtitle", type: "localizedText" }),
    defineField({ name: "note", type: "localizedText" }),
    defineField({ name: "ctaLabel", type: "localizedString" }),
    defineField({ name: "heroImage", type: "imageWithMetadata" }),
    defineField({ name: "seo", type: "seoFields" }),
  ],
});
