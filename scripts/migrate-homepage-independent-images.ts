import { getCliClient } from "sanity/cli";

const client = getCliClient({apiVersion: "2026-09-01"}).withConfig({perspective: "raw", useCdn: false});
const homepages = await client.fetch<Array<{_id:string; heroImage?:unknown; statementImage?:unknown}>>(`*[_type == "homepage"]{
  _id,
  "heroImage": coalesce(heroImageOverride, heroArtwork->heroImage, heroArtwork->mainImage),
  "statementImage": coalesce(statementImageOverride, statementArtwork->mainImage),
}`);

for (const homepage of homepages) {
  const values: Record<string, unknown> = {};
  if (homepage.heroImage) values.heroImageOverride = homepage.heroImage;
  if (homepage.statementImage) values.statementImageOverride = homepage.statementImage;
  if (Object.keys(values).length) await client.patch(homepage._id).set(values).commit();
  console.log(`${homepage._id}: ${Object.keys(values).join(", ") || "no source images"}`);
}
