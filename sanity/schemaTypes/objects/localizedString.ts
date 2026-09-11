import { ALL_FIELDS_GROUP, defineField, defineType } from "sanity";

export const localizedString = defineType({
  name: "localizedString", title: "Localized string", type: "object",
  groups: [
    { name: "en", title: "EN", default: true }, { name: "ru", title: "RU" }, { name: "zh", title: "中文" },
    { ...ALL_FIELDS_GROUP, hidden: true },
  ],
  fields: [
    defineField({ name: "en", title: "English", type: "string", group: "en" }),
    defineField({ name: "ru", title: "Русский", type: "string", group: "ru" }),
    defineField({ name: "zh", title: "中文", type: "string", group: "zh" }),
  ],
});
