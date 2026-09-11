import { defineArrayMember, defineField, defineType } from "sanity";

export const homepage = defineType({
  name: "homepage", title: "Homepage", type: "document",
  groups: [{ name: "hero", title: "Hero", default: true }, { name: "content", title: "Content" }, { name: "seo", title: "SEO" }],
  fields: [
    defineField({ name: "heroArtwork", type: "reference", to: [{ type: "artwork" }], group: "hero", validation: (rule) => rule.required() }),
    defineField({ name: "heroImageOverride", type: "imageWithMetadata", group: "hero" }),
    defineField({ name: "heroEyebrow", type: "localizedString", group: "hero" }),
    defineField({ name: "heroTitle", type: "localizedString", group: "hero" }),
    defineField({ name: "heroSubtitle", type: "localizedString", group: "hero" }),
    defineField({ name: "statementText", type: "localizedText", group: "content" }),
    defineField({ name: "statementArtwork", type: "reference", to: [{ type: "artwork" }], group: "content" }),
    defineField({ name: "statementImageOverride", type: "imageWithMetadata", group: "content" }),
    defineField({ name: "selectedWorks", type: "array", group: "content", of: [defineArrayMember({ type: "reference", to: [{ type: "artwork" }] })] }),
    defineField({ name: "featuredSeries", title: "Featured collection", type: "reference", to: [{ type: "series" }], group: "content" }),
    defineField({ name: "exhibitionsMode", type: "string", group: "content", initialValue: "latest", options: { list: ["latest", "manual"] } }),
    defineField({ name: "selectedExhibitions", type: "array", group: "content", hidden: ({ parent }) => parent?.exhibitionsMode !== "manual", of: [defineArrayMember({ type: "reference", to: [{ type: "exhibition" }] })] }),
    defineField({ name: "additionalSections", type: "array", group: "content", of: [defineArrayMember({ type: "homepageSection" })] }),
    defineField({ name: "seo", type: "seoFields", group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Homepage" }) },
});
