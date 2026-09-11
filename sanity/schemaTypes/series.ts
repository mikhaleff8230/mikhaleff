import { defineArrayMember, defineField, defineType } from "sanity";

export const series = defineType({
  name: "series", title: "Collection", type: "document",
  fields: [
    defineField({ name: "title", type: "localizedString", validation: (rule) => rule.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title.0.value" }, validation: (rule) => rule.required() }),
    defineField({ name: "subtitle", type: "localizedString" }),
    defineField({ name: "introduction", type: "localizedText" }),
    defineField({ name: "description", type: "localizedPortableText" }),
    defineField({ name: "startYear", type: "number" }), defineField({ name: "endYear", type: "number" }),
    defineField({ name: "status", type: "string", options: { list: ["ongoing", "complete", "archive"] } }),
    defineField({ name: "coverImage", type: "imageWithMetadata", validation: (rule) => rule.required() }),
    defineField({ name: "heroImage", type: "imageWithMetadata" }),
    defineField({ name: "detailImages", type: "array", of: [defineArrayMember({ type: "imageWithMetadata" })] }),
    defineField({ name: "artworks", type: "array", of: [defineArrayMember({ type: "reference", to: [{ type: "artwork" }] })] }),
    defineField({ name: "featured", type: "boolean", initialValue: false }), defineField({ name: "order", type: "number" }),
    defineField({ name: "homepageFeature", type: "boolean", initialValue: false }), defineField({ name: "seo", type: "seoFields" }),
  ],
  preview: { select: { title: "title.0.value", start: "startYear", end: "endYear", media: "coverImage" }, prepare: ({ title, start, end, media }) => ({ title, subtitle: [start, end].filter(Boolean).join("–"), media }) },
});
