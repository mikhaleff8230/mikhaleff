import { defineField, defineType } from "sanity";

export const archivePages = defineType({
  name: "archivePages", title: "Archive pages", type: "document",
  groups: [{ name: "works", title: "Works", default: true }, { name: "collections", title: "Collections" }, { name: "exhibitions", title: "Exhibitions" }, { name: "journal", title: "Journal" }],
  fields: [
    defineField({ name: "works", type: "archivePageSettings", group: "works" }),
    defineField({ name: "collections", type: "archivePageSettings", group: "collections" }),
    defineField({ name: "exhibitions", type: "archivePageSettings", group: "exhibitions" }),
    defineField({ name: "journal", type: "archivePageSettings", group: "journal" }),
  ],
  preview: { prepare: () => ({ title: "Archive pages" }) },
});
