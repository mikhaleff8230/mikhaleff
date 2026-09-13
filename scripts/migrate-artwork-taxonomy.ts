import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-09-12" });
const materials = [
  { _id: "material-acrylic", key: { _type: "slug", current: "acrylic" }, title: { _type: "localizedString", en: "Acrylic", ru: "Акрил", zh: "丙烯" }, order: 10 },
  { _id: "material-mixed-media", key: { _type: "slug", current: "mixed-media" }, title: { _type: "localizedString", en: "Mixed media", ru: "Смешанная техника", zh: "综合材料" }, order: 20 },
  { _id: "material-oil-on-canvas", key: { _type: "slug", current: "oil-on-canvas" }, title: { _type: "localizedString", en: "Oil on canvas", ru: "Масло на холсте", zh: "布面油画" }, order: 30 },
];
for (const material of materials) await client.createIfNotExists({ _type: "material", ...material });
const artworks = await client.fetch<Array<{_id:string; medium?:string; price?:number; currency?:string}>>(`*[_type == "artwork"]{_id, medium, price, currency}`);
const materialId = (value = "") => /акрил|acrylic/i.test(value) ? "material-acrylic" : /mixed|смеш/i.test(value) ? "material-mixed-media" : /oil|масл/i.test(value) ? "material-oil-on-canvas" : undefined;
for (const artwork of artworks) {
  const patch: Record<string, unknown> = {};
  const ref = materialId(artwork.medium);
  if (ref) patch.mediumRef = { _type: "reference", _ref: ref };
  if (typeof artwork.price === "number" && artwork.currency) patch[`prices.${artwork.currency.toLowerCase()}`] = artwork.price;
  if (Object.keys(patch).length) await client.patch(artwork._id).set(patch).commit();
}
console.log(`Migrated ${artworks.length} artwork records and ${materials.length} material dictionaries.`);