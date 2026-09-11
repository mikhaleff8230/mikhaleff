import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  project: {
    basePath: "/studio",
  },
  deployment: {
    appId: "h1276xaq45rqrnk08wt0rv5d",
  },
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? "lqcc213n",
    dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
  },
});
