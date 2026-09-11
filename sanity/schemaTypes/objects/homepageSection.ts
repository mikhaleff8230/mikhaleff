import { defineArrayMember, defineField, defineType } from "sanity";

export const homepageSection = defineType({
  name: "homepageSection", title: "Homepage section", type: "object",
  fields: [
    defineField({ name: "kind", type: "string", options: { list: [
      { title: "Image", value: "image" }, { title: "Text", value: "text" },
      { title: "Quote", value: "quote" }, { title: "Artworks", value: "artworks" },
      { title: "Collection", value: "series" }, { title: "Exhibition", value: "exhibition" },
      { title: "Full-screen artwork", value: "fullscreenArtwork" },
      { title: "Editorial split", value: "editorialSplit" },
    ] }, validation: (rule) => rule.required() }),
    defineField({ name: "heading", type: "localizedString" }),
    defineField({ name: "body", type: "localizedPortableText" }),
    defineField({ name: "image", type: "imageWithMetadata" }),
    defineField({ name: "artworks", type: "array", of: [defineArrayMember({ type: "reference", to: [{ type: "artwork" }] })] }),
    defineField({ name: "series", title: "Collection", type: "reference", to: [{ type: "series" }] }),
    defineField({ name: "exhibition", type: "reference", to: [{ type: "exhibition" }] }),
  ], preview: { select: { title: "heading.0.value", subtitle: "kind", media: "image" } },
});
