import { defineArrayMember, defineField, defineType } from "sanity";

export const exhibition = defineType({
  name: "exhibition", title: "Exhibition", type: "document",
  fields: [
    defineField({ name: "title", type: "localizedString", validation: (rule) => rule.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title.en" }, validation: (rule) => rule.required() }),
    defineField({ name: "type", type: "string", options: { list: ["solo", "group", "fair", "museum", "project"] } }),
    defineField({ name: "startDate", type: "date", validation: (rule) => rule.required() }), defineField({ name: "endDate", type: "date" }),
    defineField({ name: "venue", type: "string" }), defineField({ name: "city", type: "string" }), defineField({ name: "country", type: "string" }),
    defineField({ name: "shortDescription", type: "localizedText" }), defineField({ name: "description", type: "localizedPortableText" }),
    defineField({ name: "cover", type: "imageWithMetadata" }),
    defineField({ name: "gallery", type: "array", of: [defineArrayMember({ type: "imageWithMetadata" })] }),
    defineField({ name: "installationViews", type: "array", of: [defineArrayMember({ type: "imageWithMetadata" })] }),
    defineField({ name: "artworks", type: "array", of: [defineArrayMember({ type: "reference", to: [{ type: "artwork" }] })] }),
    defineField({ name: "series", title: "Collections", type: "array", of: [defineArrayMember({ type: "reference", to: [{ type: "series" }] })] }),
    defineField({ name: "externalLink", type: "url" }), defineField({ name: "cataloguePDF", type: "file" }),
    defineField({ name: "pressLinks", type: "array", of: [defineArrayMember({ type: "object", fields: [{ name: "label", type: "string" }, { name: "url", type: "url" }] })] }),
    defineField({ name: "seo", type: "seoFields" }),
  ],
  preview: { select: { title: "title.en", date: "startDate", city: "city", media: "cover" }, prepare: ({ title, date, city, media }) => ({ title, subtitle: [date?.slice(0, 4), city].filter(Boolean).join(" · "), media }) },
});
