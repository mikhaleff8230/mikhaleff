import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

export default defineConfig({
  name: "mikhaleff-studio", title: "MIKHALEFF STUDIO",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? "lqcc213n",
  dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
  plugins: [structureTool({ structure }), visionTool()],
  schema: { types: schemaTypes },
  document: {
    newDocumentOptions: (previous) => previous.filter((item) => !["homepage", "about", "contact", "archivePages", "siteSettings"].includes(item.templateId)),
    actions: (previous, context) => ["homepage", "about", "contact", "archivePages", "siteSettings"].includes(context.schemaType)
      ? previous.filter(({ action }) => action && ["publish", "discardChanges", "restore"].includes(action))
      : previous,
  },
});
