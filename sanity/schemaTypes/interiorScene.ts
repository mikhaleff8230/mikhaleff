import { defineField, defineType } from "sanity";

export const interiorScene = defineType({
  name: "interiorScene",
  title: "View in Space scene",
  type: "document",
  fields: [
    defineField({ name: "title", type: "localizedString", validation: (rule) => rule.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title.en" }, validation: (rule) => rule.required() }),
    defineField({ name: "enabled", type: "boolean", initialValue: true }),
    defineField({ name: "order", type: "number" }),
    defineField({ name: "sceneImage", type: "imageWithMetadata", validation: (rule) => rule.required() }),
    defineField({ name: "mobileSceneImage", type: "imageWithMetadata" }),
    defineField({ name: "sceneType", type: "string", options: { list: ["gallery", "living", "minimal", "dark", "classic", "custom"] }, initialValue: "gallery" }),
    defineField({ name: "wallPhysicalWidthCm", type: "number", validation: (rule) => rule.positive() }),
    defineField({ name: "wallPhysicalHeightCm", type: "number", validation: (rule) => rule.positive() }),
    defineField({ name: "allowWallColor", type: "boolean", initialValue: false }),
    defineField({ name: "wallBounds", type: "object", validation: (rule) => rule.required(), fields: [
      { name: "x", type: "number", initialValue: 0.2, validation: (rule) => rule.min(0).max(1) },
      { name: "y", type: "number", initialValue: 0.16, validation: (rule) => rule.min(0).max(1) },
      { name: "width", type: "number", initialValue: 0.55, validation: (rule) => rule.min(0.05).max(1) },
      { name: "height", type: "number", initialValue: 0.52, validation: (rule) => rule.min(0.05).max(1) },
    ] }),
  ],
  preview: { select: { title: "title.en", subtitle: "sceneType", media: "sceneImage" } },
});
