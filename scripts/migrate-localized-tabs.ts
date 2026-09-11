import {getCliClient} from "sanity/cli";

const client = getCliClient({apiVersion: "2026-09-01"}).withConfig({
  perspective: "raw",
  useCdn: false,
});

const localizedTypes = new Map([
  ["localizedStringValue", "localizedString"],
  ["localizedTextValue", "localizedText"],
  ["localizedPortableTextValue", "localizedPortableText"],
]);

const languageCode = (value: unknown) => {
  if (!value || typeof value !== "object") return null;
  const reference = (value as {language?: {_ref?: string}}).language?._ref;
  if (reference === "language-en") return "en";
  if (reference === "language-ru") return "ru";
  if (reference === "language-zh") return "zh";
  return null;
};

const transform = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    const localizedEntry = value.find((entry) => {
      if (!entry || typeof entry !== "object") return false;
      return localizedTypes.has((entry as {_type?: string})._type ?? "");
    }) as {_type?: string} | undefined;

    if (localizedEntry?._type) {
      const next: Record<string, unknown> = {
        _type: localizedTypes.get(localizedEntry._type),
      };

      for (const entry of value) {
        const code = languageCode(entry);
        const localizedValue = entry && typeof entry === "object"
          ? (entry as {value?: unknown}).value
          : undefined;
        if (!code || localizedValue === undefined || localizedValue === null || localizedValue === "") continue;
        next[code] = transform(localizedValue);
      }
      return next;
    }

    return value.map(transform);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, transform(entry)]),
    );
  }

  return value;
};

const documents = await client.fetch<Array<Record<string, unknown>>>(`*[
  !(_id in path("_.**")) &&
  !(_type in ["sanity.imageAsset", "sanity.fileAsset"])
]`);

let changed = 0;
for (const document of documents) {
  const migrated = transform(document) as Record<string, unknown>;
  if (JSON.stringify(document) === JSON.stringify(migrated)) continue;

  const documentId = String(document._id);
  const fields = {...migrated};
  for (const key of ["_id", "_type", "_rev", "_createdAt", "_updatedAt"]) delete fields[key];

  await client.patch(documentId).set(fields).commit({visibility: "sync"});
  changed += 1;
  console.log(`Migrated ${documentId}`);
}

console.log(`Migration complete: ${changed} of ${documents.length} documents updated.`);
