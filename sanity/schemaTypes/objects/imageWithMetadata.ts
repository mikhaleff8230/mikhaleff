import { defineField, defineType } from "sanity";

export const imageWithMetadata = defineType({
  name: "imageWithMetadata", title: "Image", type: "image", options: { hotspot: true },
  fields: [
    defineField({ name: "alt", title: "Alt text", type: "localizedString", validation: (rule) => rule.required() }),
    defineField({ name: "caption", type: "localizedString" }),
    defineField({ name: "photographer", type: "string" }),
  ],
});
