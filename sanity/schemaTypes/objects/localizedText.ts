import { ALL_FIELDS_GROUP, defineField, defineType } from "sanity";

export const localizedText = defineType({
  name: "localizedText", title: "Localized text", type: "object",
  groups: [
    { name: "en", title: "EN", default: true }, { name: "ru", title: "RU" }, { name: "zh", title: "中文" },
    { ...ALL_FIELDS_GROUP, hidden: true },
  ],
  fields: [
    defineField({ name: "en", title: "English", type: "text", rows: 5, group: "en" }),
    defineField({ name: "ru", title: "Русский", type: "text", rows: 5, group: "ru" }),
    defineField({ name: "zh", title: "中文", type: "text", rows: 5, group: "zh" }),
  ],
});
