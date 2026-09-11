import { defineArrayMember, defineField, defineType } from "sanity";

export const localizedText = defineType({
  name: "localizedText", title: "Localized text", type: "array",
  of: [defineArrayMember({ type: "object", name: "localizedTextValue", fields: [
    defineField({ name: "language", type: "reference", to: [{ type: "language" }], validation: (rule) => rule.required() }),
    defineField({ name: "value", type: "text", rows: 5, validation: (rule) => rule.required() }),
  ], preview: { select: { title: "value", subtitle: "language.nativeName" } } })],
});
