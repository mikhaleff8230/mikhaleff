import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  project: {
    basePath: "/studio",
  },
  deployment: {
    appId: "h1276xaq45rqrnk08wt0rv5d",
  },
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "replace-me",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  },
});
