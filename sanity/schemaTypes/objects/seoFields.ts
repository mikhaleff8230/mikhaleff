import { defineField, defineType } from "sanity";

export const seoFields = defineType({
  name: "seoFields", title: "SEO", type: "object", options: { collapsible: true },
  fields: [
    defineField({ name: "title", title: "SEO title", type: "localizedString", description: "Falls back to the page title." }),
    defineField({ name: "description", title: "SEO description", type: "localizedText" }),
    defineField({ name: "ogImage", title: "Social image", type: "imageWithMetadata" }),
    defineField({ name: "canonicalOverride", type: "url" }),
    defineField({ name: "noindex", type: "boolean", initialValue: false }),
  ],
});
