import { defineArrayMember, defineField, defineType } from "sanity";

export const about = defineType({
  name: "about", title: "About", type: "document",
  fields: [
    defineField({ name: "artistName", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "pageEyebrow", title: "Page eyebrow", type: "localizedString" }),
    defineField({ name: "pageTitle", title: "Page title", type: "localizedString" }),
    defineField({ name: "introduction", title: "Introductory text", type: "localizedText" }),
    defineField({ name: "readBiographyLabel", title: "Biography link label", type: "localizedString" }),
    defineField({ name: "studioTitle", title: "Studio section title", type: "localizedString" }),
    defineField({ name: "studioText", title: "Studio section text", type: "localizedText" }),
    defineField({ name: "portrait", type: "imageWithMetadata" }),
    defineField({ name: "studioImages", type: "array", of: [defineArrayMember({ type: "imageWithMetadata" })] }),
    defineField({ name: "shortBio", type: "localizedText" }), defineField({ name: "fullBiography", type: "localizedPortableText" }),
    defineField({ name: "artistStatement", type: "localizedPortableText" }), defineField({ name: "philosophy", type: "localizedPortableText" }),
    defineField({ name: "quote", type: "localizedText" }), defineField({ name: "cv", type: "localizedPortableText" }),
    defineField({ name: "education", type: "localizedPortableText" }), defineField({ name: "selectedExhibitions", type: "localizedPortableText" }),
    defineField({ name: "collections", type: "localizedPortableText" }), defineField({ name: "awards", type: "localizedPortableText" }),
    defineField({ name: "publications", type: "localizedPortableText" }), defineField({ name: "seo", type: "seoFields" }),
  ], preview: { prepare: () => ({ title: "About the artist" }) },
});
