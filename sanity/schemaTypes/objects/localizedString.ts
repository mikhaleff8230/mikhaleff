import { defineArrayMember, defineField, defineType } from "sanity";

export const localizedString = defineType({
  name: "localizedString", title: "Localized string", type: "array",
  of: [defineArrayMember({ type: "object", name: "localizedStringValue", fields: [
    defineField({ name: "language", type: "reference", to: [{ type: "language" }], validation: (rule) => rule.required() }),
    defineField({ name: "value", type: "string", validation: (rule) => rule.required() }),
  ], preview: { select: { title: "value", subtitle: "language.nativeName" } } })],
});
