import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings", title: "Site settings", type: "document",
  fields: [
    defineField({ name: "siteTitle", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "siteDescription", type: "localizedText" }),
    defineField({ name: "email", type: "string", validation: (rule) => rule.email() }),
    defineField({ name: "instagram", type: "url" }),
    defineField({ name: "telegram", title: "Telegram URL", type: "url" }),
    defineField({ name: "whatsapp", title: "WhatsApp URL", type: "url" }),
    defineField({ name: "youtube", title: "YouTube URL", type: "url" }),
    defineField({ name: "facebook", title: "Facebook URL", type: "url" }),
    defineField({ name: "location", type: "string", initialValue: "Europe" }),
    defineField({ name: "defaultShareImage", type: "imageWithMetadata" }),
    defineField({ name: "navigationLabels", type: "array", of: [{ type: "object", fields: [{ name: "key", type: "string" }, { name: "label", type: "localizedString" }] }] }),
    defineField({ name: "globalSeo", title: "Default SEO", type: "seoFields" }),
  ], preview: { prepare: () => ({ title: "Site settings" }) },
});
