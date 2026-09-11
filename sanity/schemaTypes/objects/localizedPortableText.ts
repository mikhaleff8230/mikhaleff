import { ALL_FIELDS_GROUP, defineField, defineType } from "sanity";

export const localizedPortableText = defineType({
  name: "localizedPortableText", title: "Localized rich text", type: "object",
  groups: [
    { name: "en", title: "EN", default: true }, { name: "ru", title: "RU" }, { name: "zh", title: "中文" },
    { ...ALL_FIELDS_GROUP, hidden: true },
  ],
  fields: [
    defineField({ name: "en", title: "English", type: "array", group: "en", of: [{ type: "block" }, { type: "imageWithMetadata" }] }),
    defineField({ name: "ru", title: "Русский", type: "array", group: "ru", of: [{ type: "block" }, { type: "imageWithMetadata" }] }),
    defineField({ name: "zh", title: "中文", type: "array", group: "zh", of: [{ type: "block" }, { type: "imageWithMetadata" }] }),
  ],
});
