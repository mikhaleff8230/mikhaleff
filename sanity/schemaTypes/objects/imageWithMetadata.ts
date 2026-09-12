import { defineField, defineType } from "sanity";

export const imageWithMetadata = defineType({
  name: "imageWithMetadata", title: "Image", type: "image", options: { hotspot: true },
  fields: [
    defineField({ name: "alt", title: "Alt text", type: "localizedString", description: "Recommended for accessibility. If empty, the artwork or page title is used." }),
    defineField({ name: "caption", type: "localizedString" }),
    defineField({ name: "photographer", type: "string" }),
  ],
});
