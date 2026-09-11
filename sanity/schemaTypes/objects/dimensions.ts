import { defineField, defineType } from "sanity";

export const dimensions = defineType({
  name: "dimensions", title: "Dimensions", type: "object",
  fields: [
    defineField({ name: "width", type: "number", validation: (rule) => rule.positive() }),
    defineField({ name: "height", type: "number", validation: (rule) => rule.positive() }),
    defineField({ name: "depth", type: "number", validation: (rule) => rule.positive() }),
    defineField({ name: "unit", type: "string", initialValue: "cm", options: { list: ["cm", "in"] } }),
  ],
});
