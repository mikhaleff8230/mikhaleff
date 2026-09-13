import { defineField, defineType } from "sanity";

export const contact = defineType({
  name: "contact", title: "Contact page", type: "document",
  groups: [{ name: "content", title: "Content", default: true }, { name: "media", title: "Media" }, { name: "seo", title: "SEO" }],
  fields: [
    defineField({ name: "eyebrow", type: "localizedString", group: "content" }),
    defineField({ name: "displayTitle", title: "Large artwork statement", type: "localizedString", group: "content", description: "Use line breaks to control the large title." }),
    defineField({ name: "heading", title: "Form heading", type: "localizedString", group: "content" }),
    defineField({ name: "introduction", type: "localizedText", group: "content" }),
    defineField({ name: "backgroundImage", title: "Page artwork image", type: "imageWithMetadata", group: "media", description: "Independent image for the contact page." }),
    defineField({ name: "artwork", title: "Fallback artwork image", type: "reference", to: [{ type: "artwork" }], group: "media" }),
    defineField({ name: "email", title: "Legacy email", type: "string", hidden: true, readOnly: true }),
    defineField({ name: "instagram", title: "Legacy Instagram", type: "url", hidden: true, readOnly: true }),
    defineField({ name: "location", title: "Legacy location", type: "localizedString", hidden: true, readOnly: true }),
    defineField({ name: "seo", type: "seoFields", group: "seo" }),
  ], preview: { prepare: () => ({ title: "Contact page" }) },
});