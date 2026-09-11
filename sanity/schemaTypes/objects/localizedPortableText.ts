import { defineArrayMember, defineField, defineType } from "sanity";

export const localizedPortableText = defineType({
  name: "localizedPortableText", title: "Localized rich text", type: "array",
  of: [defineArrayMember({ type: "object", name: "localizedPortableTextValue", fields: [
    defineField({ name: "language", type: "reference", to: [{ type: "language" }], validation: (rule) => rule.required() }),
    defineField({ name: "value", type: "array", of: [{ type: "block" }, { type: "imageWithMetadata" }] }),
  ], preview: { select: { subtitle: "language.nativeName" }, prepare: ({ subtitle }) => ({ title: "Rich text", subtitle }) } })],
});
