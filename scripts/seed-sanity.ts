import {createReadStream} from "node:fs";
import path from "node:path";
import {getCliClient} from "sanity/cli";
import {fallbackArtworks, fallbackHomepage} from "../lib/content/fallback-homepage";
import {aboutContent, fallbackExhibitions, fallbackJournal, fallbackSeries} from "../lib/content/fallback-editorial";
import {fallbackInteriorScenes} from "../lib/content/fallback-interior-scenes";

const client = getCliClient({apiVersion: "2026-09-01"});
const languageRef = {_type: "reference", _ref: "language-en"};
const assetRefs = new Map<string, string>();
const localizedString = (value: string) => [{_key: "en", _type: "localizedStringValue", language: languageRef, value}];
const localizedText = (value: string) => [{_key: "en", _type: "localizedTextValue", language: languageRef, value}];
const blocks = (paragraphs: readonly string[]) => paragraphs.map((text, index) => ({
  _key: `p-${index + 1}`, _type: "block", style: "normal", markDefs: [],
  children: [{_key: `s-${index + 1}`, _type: "span", marks: [], text}],
}));
const localizedPortableText = (paragraphs: readonly string[]) => [{
  _key: "en", _type: "localizedPortableTextValue", language: languageRef, value: blocks(paragraphs),
}];
const ref = (id: string) => ({_type: "reference", _ref: id});
const keyedRef = (id: string, key = id) => ({_key: key, ...ref(id)});
const slug = (current: string) => ({_type: "slug", current});
const documentId = (type: string, value: string) => `${type}-${value}`;
const seriesIdByTitle = new Map(fallbackSeries.map((entry) => [entry.title, documentId("series", entry.slug)]));

async function uploadedAsset(source: string) {
  const existing = assetRefs.get(source);
  if (existing) return existing;
  const absolute = path.join(process.cwd(), "public", source.replace(/^\//, ""));
  const filename = path.basename(absolute);
  const stored = await client.fetch<string | null>(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]._id`,
    {filename},
  );
  if (stored) { assetRefs.set(source, stored); return stored; }
  const asset = await client.assets.upload("image", createReadStream(absolute), {filename});
  assetRefs.set(source, asset._id);
  return asset._id;
}
async function image(source: string, alt: string) {
  return {_type: "image", asset: ref(await uploadedAsset(source)), alt: localizedString(alt)};
}
const availability = (status?: string) => status === "Private collection" ? "private-collection" : status === "Sold" ? "sold" : "available";
const dateRanges: Record<string, [string, string]> = {
  "inner-landscapes-almaty": ["2026-09-14", "2026-11-24"],
  "states-of-matter-dubai": ["2025-03-06", "2025-04-18"],
  "fragments-milan": ["2024-05-21", "2024-06-30"],
  "beyond-the-form-new-york": ["2023-11-09", "2023-12-17"],
  "silent-structures-berlin": ["2022-02-12", "2022-03-27"],
};
const journalDates: Record<string, string> = {
  "painting-as-a-threshold": "2026-08-18T10:00:00Z",
  "notes-from-the-studio-01": "2026-06-02T10:00:00Z",
  "in-conversation-material-memory": "2026-02-11T10:00:00Z",
};

async function seed() {
  const existingCount = await client.fetch<number>("count(*[!(_id in path('_.**'))])");
  if (existingCount > 0 && !process.argv.includes("--force")) {
    throw new Error(`Dataset is not empty (${existingCount} documents). Re-run with --force only when replacement is intended.`);
  }

  for (const document of [
    {_id: "language-en", _type: "language", name: "English", nativeName: "English", code: "en", locale: "en", slugPrefix: "en", enabled: true, default: true, order: 1},
    {_id: "language-ru", _type: "language", name: "Russian", nativeName: "Русский", code: "ru", locale: "ru", slugPrefix: "ru", enabled: true, default: false, order: 2},
    {_id: "language-zh", _type: "language", name: "Chinese", nativeName: "中文", code: "zh", locale: "zh", slugPrefix: "zh", enabled: true, default: false, order: 3},
  ]) await client.createOrReplace(document);

  for (const [index, scene] of fallbackInteriorScenes.entries()) {
    await client.createOrReplace({
      _id: documentId("interiorScene", scene.slug), _type: "interiorScene", title: localizedString(scene.title),
      slug: slug(scene.slug), enabled: true, order: index + 1, sceneType: scene.sceneType,
      sceneImage: await image(scene.image.src, scene.image.alt), wallPhysicalWidthCm: scene.wallPhysicalWidthCm,
      wallPhysicalHeightCm: scene.wallPhysicalHeightCm, wallBounds: scene.wallBounds, allowWallColor: scene.allowWallColor ?? false,
    });
  }

  for (const [index, collection] of fallbackSeries.entries()) {
    const [startYear, endYear] = collection.years.split("—").map((value) => Number.parseInt(value.trim(), 10));
    await client.createOrReplace({
      _id: documentId("series", collection.slug), _type: "series", title: localizedString(collection.title),
      slug: slug(collection.slug), subtitle: localizedString(collection.statement), introduction: localizedText(collection.description),
      description: localizedPortableText([collection.description]), startYear, endYear,
      status: index === 0 ? "ongoing" : "complete", coverImage: await image(collection.cover.src, collection.cover.alt),
      heroImage: await image(collection.cover.src, collection.cover.alt),
      artworks: [],
      featured: index === 1, homepageFeature: index === 1, order: index + 1,
    });
  }

  const exhibitionByArtwork = new Map<string, string>();
  for (const exhibition of fallbackExhibitions) {
    const [startDate, endDate] = dateRanges[exhibition.slug];
    for (const artworkSlug of exhibition.artworkSlugs) if (!exhibitionByArtwork.has(artworkSlug)) exhibitionByArtwork.set(artworkSlug, exhibition.slug);
    const exhibitionImage = await image(exhibition.image.src, exhibition.image.alt);
    await client.createOrReplace({
      _id: documentId("exhibition", exhibition.slug), _type: "exhibition", title: localizedString(exhibition.title),
      slug: slug(exhibition.slug), type: exhibition.format === "Solo exhibition" ? "solo" : "group", startDate, endDate,
      venue: exhibition.venue, city: exhibition.city, country: exhibition.country,
      shortDescription: localizedText(exhibition.introduction), description: localizedPortableText([exhibition.description]),
      cover: exhibitionImage, installationViews: [{...exhibitionImage, _key: "installation-1"}],
      artworks: [],
    });
  }

  for (const [index, artwork] of fallbackArtworks.entries()) {
    const width = artwork.widthCm ?? Number.parseFloat(artwork.dimensions.split("×")[0]);
    const height = artwork.heightCm ?? Number.parseFloat(artwork.dimensions.split("×")[1]);
    const mainImage = await image(artwork.image.src, artwork.image.alt);
    const detailImages = await Promise.all((artwork.detailImages ?? []).map(async (item, detailIndex) => ({
      ...await image(item.src, item.alt), _key: `detail-${detailIndex + 1}`,
    })));
    const interiorImages = await Promise.all((artwork.interiorImages ?? []).map(async (item, interiorIndex) => ({
      ...await image(item.src, item.alt), _key: `interior-${interiorIndex + 1}`,
    })));
    const exhibitionSlug = exhibitionByArtwork.get(artwork.slug);
    const seriesId = artwork.series ? seriesIdByTitle.get(artwork.series) : undefined;
    await client.createOrReplace({
      _id: documentId("artwork", artwork.slug), _type: "artwork", title: localizedString(artwork.title), slug: slug(artwork.slug),
      internalId: artwork.slug.toUpperCase(), inventoryNumber: artwork.slug.toUpperCase(), year: Number.parseInt(artwork.year, 10),
      ...(seriesId ? {series: ref(seriesId)} : {}), medium: artwork.medium, category: "Painting",
      orientation: width === height ? "square" : width > height ? "landscape" : "portrait",
      dimensions: {_type: "dimensions", width, height, unit: "cm"}, availability: availability(artwork.status), showPrice: false,
      mainImage, galleryImage: mainImage, detailImages, interiorImages,
      ...(artwork.video ? {
        videoPoster: await image(artwork.video.poster.src, artwork.video.poster.alt),
        videoEyebrow: localizedString(artwork.video.eyebrow ?? "The process"),
        videoTitle: localizedString(artwork.video.title ?? "Between Matter and Memory"),
        videoCaption: localizedText(artwork.video.caption ?? "A short film on art, process and perception."),
      } : {}),
      shortDescription: localizedText(artwork.description ?? ""), description: localizedPortableText([artwork.description ?? ""]),
      artistComment: localizedText(artwork.artistComment ?? artwork.description ?? ""),
      exhibitions: exhibitionSlug ? [keyedRef(documentId("exhibition", exhibitionSlug))] : [],
      relatedArtworks: [],
      featured: index < 5, showOnHomepage: fallbackHomepage.selectedWorks.items.some((item) => item.slug === artwork.slug),
      homepageOrder: index + 1, artworkOrder: index + 1, hideFromArchive: false,
      viewInSpaceEnabled: artwork.viewInSpaceEnabled ?? true,
      preferredInteriorScene: ref(documentId("interiorScene", artwork.preferredInteriorSceneSlug ?? "gallery")),
      frameAllowed: artwork.frameAllowed ?? true, trueScaleEnabled: artwork.trueScaleEnabled ?? true,
      exhibitionFeatured: index < 6, exhibitionOrder: index + 1, exhibitionAlignment: "auto",
    });
  }

  for (const collection of fallbackSeries) await client.patch(documentId("series", collection.slug)).set({
    artworks: collection.artworkSlugs.map((value) => keyedRef(documentId("artwork", value))),
  }).commit();
  for (const exhibition of fallbackExhibitions) await client.patch(documentId("exhibition", exhibition.slug)).set({
    artworks: exhibition.artworkSlugs.map((value) => keyedRef(documentId("artwork", value))),
  }).commit();
  for (const artwork of fallbackArtworks) await client.patch(documentId("artwork", artwork.slug)).set({
    relatedArtworks: (artwork.relatedArtworkSlugs ?? []).map((value) => keyedRef(documentId("artwork", value))),
  }).commit();

  for (const [index, entry] of fallbackJournal.entries()) {
    await client.createOrReplace({
      _id: documentId("journal", entry.slug), _type: "journal", title: localizedString(entry.title), slug: slug(entry.slug),
      date: journalDates[entry.slug], excerpt: localizedText(entry.excerpt), content: localizedPortableText(entry.body),
      cover: await image(entry.image.src, entry.image.alt), author: "Alexander Mikhaleff", category: entry.category,
      relatedArtworks: [keyedRef(documentId("artwork", fallbackArtworks[index % fallbackArtworks.length].slug))],
    });
  }

  const heroArtworkId = documentId("artwork", "untitled-032");
  await client.createOrReplace({
    _id: "homepage", _type: "homepage", heroArtwork: ref(heroArtworkId),
    heroEyebrow: localizedString(fallbackHomepage.hero.eyebrow), heroTitle: localizedString(fallbackHomepage.hero.title.join("\n")),
    heroSubtitle: localizedString(fallbackHomepage.hero.subtitle), statementText: localizedText(fallbackHomepage.statement.quote),
    statementArtwork: ref(heroArtworkId), selectedWorks: fallbackHomepage.selectedWorks.items.map((item) => keyedRef(documentId("artwork", item.slug))),
    featuredSeries: ref(documentId("series", fallbackHomepage.featuredSeries.slug)), exhibitionsMode: "latest",
  });
  await client.createOrReplace({
    _id: "about", _type: "about", artistName: "Alexander Mikhaleff",
    portrait: await image("/studio/alexander-mikhaleff-studio.png", "Alexander Mikhaleff in his studio"),
    studioImages: [{...await image("/studio/artist-studio-placeholder.png", "Alexander Mikhaleff studio"), _key: "studio-1"}],
    shortBio: localizedText(aboutContent.biography[0]), fullBiography: localizedPortableText(aboutContent.biography),
    artistStatement: localizedPortableText(aboutContent.statement), quote: localizedText(aboutContent.quote),
    cv: localizedPortableText(aboutContent.cv.map(([year, event]) => `${year} — ${event}`)),
  });
  await client.createOrReplace({
    _id: "contact", _type: "contact", heading: localizedString("Get in Touch"),
    introduction: localizedText("For inquiries, collaborations or exhibition opportunities."), artwork: ref(heroArtworkId),
    email: "hello@mikhaleff.art", instagram: "https://instagram.com", location: localizedString("Europe"),
  });
  const navigation = ["Works", "Collections", "Exhibitions", "About", "Journal", "Contact"];
  await client.createOrReplace({
    _id: "siteSettings", _type: "siteSettings", siteTitle: "MIKHALEFF",
    siteDescription: localizedText("Official website of contemporary artist Alexander Mikhaleff."),
    email: "hello@mikhaleff.art", instagram: "https://instagram.com", location: "Europe",
    navigationLabels: navigation.map((label) => ({_key: label.toLowerCase(), key: label.toLowerCase(), label: localizedString(label)})),
  });
  const total = await client.fetch<number>("count(*[!(_id in path('_.**'))])");
  console.log(`Sanity seed complete: ${total} documents, ${assetRefs.size} source images uploaded.`);
}
seed().catch((error) => { console.error(error); process.exitCode = 1; });
