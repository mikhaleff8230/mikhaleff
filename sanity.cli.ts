import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  project: {
    basePath: "/studio",
  },
  deployment: {
    appId: "h1276xaq45rqrnk08wt0rv5d",
  },
  typegen: {
    path: "./{app,components,lib}/**/*.{ts,tsx}",
    schema: "./schema.json",
    generates: "./sanity.types.ts",
    overloadClientMethods: false,
  },
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? "lqcc213n",
    dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
  },
});
