import { defineField, defineType } from "sanity";

export const contact = defineType({
  name: "contact", title: "Contact page", type: "document",
  fields: [
    defineField({ name: "heading", type: "localizedString" }), defineField({ name: "introduction", type: "localizedText" }),
    defineField({ name: "artwork", type: "reference", to: [{ type: "artwork" }] }),
    defineField({ name: "email", type: "string", validation: (rule) => rule.email() }), defineField({ name: "instagram", type: "url" }),
    defineField({ name: "location", title: "Legacy location", type: "localizedString", hidden: true, readOnly: true, description: "Preserved for compatibility. Edit Footer location in SITE → GLOBAL SETTINGS." }), defineField({ name: "seo", type: "seoFields" }),
  ], preview: { prepare: () => ({ title: "Contact page" }) },
});
