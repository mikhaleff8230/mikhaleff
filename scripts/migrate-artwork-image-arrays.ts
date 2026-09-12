import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-09-01" }).withConfig({
  perspective: "raw",
  useCdn: false,
});

const fields = ["detailImages", "textureImages", "interiorImages"] as const;
const documents = await client.fetch<Array<Record<string, unknown> & { _id: string }>>(
  `*[_type == "artwork"]{_id, detailImages, textureImages, interiorImages}`,
);

const updates = documents.flatMap((document) => {
  const patch: Record<string, unknown> = {};

  for (const field of fields) {
    const images = document[field];
    if (!Array.isArray(images)) continue;
    const normalized = images.map((image) =>
      image && typeof image === "object" && (image as { _type?: string })._type === "image"
        ? { ...image, _type: "imageWithMetadata" }
        : image,
    );
    if (normalized.some((image, index) => image !== images[index])) patch[field] = normalized;
  }

  return Object.keys(patch).length ? [{ id: document._id, patch }] : [];
});

console.log(`Artwork documents requiring migration: ${updates.length}`);
for (const update of updates) console.log(`- ${update.id}: ${Object.keys(update.patch).join(", ")}`);

if (process.env.ARTWORK_IMAGE_MIGRATION_APPLY === "1" && updates.length) {
  let transaction = client.transaction();
  for (const update of updates) transaction = transaction.patch(update.id, (patch) => patch.set(update.patch));
  await transaction.commit();
  console.log(`Migrated ${updates.length} artwork documents.`);
} else {
  console.log("Dry run only. Set ARTWORK_IMAGE_MIGRATION_APPLY=1 to apply.");
}
