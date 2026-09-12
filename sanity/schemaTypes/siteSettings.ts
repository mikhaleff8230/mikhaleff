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
    defineField({ name: "location", title: "Footer location / country", type: "localizedString", description: "Single global location shown in the footer for every language." }),
    defineField({ name: "defaultShareImage", type: "imageWithMetadata" }),
    defineField({
      name: "navigationLabels", title: "Navigation translations", type: "array",
      of: [{
        type: "object", name: "navigationLabel",
        fields: [
          defineField({ name: "key", type: "string", readOnly: true, options: { list: ["works", "collections", "exhibitions", "about", "journal", "contact"] } }),
          defineField({ name: "label", type: "localizedString" }),
        ],
        preview: { select: { title: "label.en", subtitle: "key" } },
      }],
    }),
    defineField({ name: "globalSeo", title: "Default SEO", type: "seoFields" }),
  ], preview: { prepare: () => ({ title: "Site settings" }) },
});
