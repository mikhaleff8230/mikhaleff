import { defineArrayMember, defineField, defineType } from "sanity";

export const journal = defineType({
  name: "journal", title: "Journal", type: "document",
  fields: [
    defineField({ name: "title", type: "localizedString", validation: (rule) => rule.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title.0.value" }, validation: (rule) => rule.required() }),
    defineField({ name: "date", type: "datetime", validation: (rule) => rule.required() }),
    defineField({ name: "excerpt", type: "localizedText" }), defineField({ name: "content", type: "localizedPortableText" }),
    defineField({ name: "cover", type: "imageWithMetadata" }), defineField({ name: "gallery", type: "array", of: [defineArrayMember({ type: "imageWithMetadata" })] }),
    defineField({ name: "author", type: "string" }), defineField({ name: "category", type: "string" }),
    defineField({ name: "relatedArtworks", type: "array", of: [defineArrayMember({ type: "reference", to: [{ type: "artwork" }] })] }),
    defineField({ name: "relatedSeries", title: "Related collections", type: "array", of: [defineArrayMember({ type: "reference", to: [{ type: "series" }] })] }),
    defineField({ name: "seo", type: "seoFields" }),
  ], preview: { select: { title: "title.0.value", subtitle: "date", media: "cover" } },
});
