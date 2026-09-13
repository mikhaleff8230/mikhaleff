import { getCliClient } from "sanity/cli";
const client = getCliClient({ apiVersion: "2026-09-12" });
const result = await client.fetch(`{
  "counts": {
    "artworks": count(*[_type == "artwork"]),
    "materials": count(*[_type == "material"]),
    "series": count(*[_type == "series"]),
    "exhibitions": count(*[_type == "exhibition"]),
    "journal": count(*[_type == "journal"]),
    "interiorScenes": count(*[_type == "interiorScene" && enabled == true])
  },
  "singletons": {
    "siteSettings": defined(*[_id == "siteSettings"][0]),
    "homepage": defined(*[_id == "homepage"][0]),
    "about": defined(*[_id == "about"][0]),
    "contact": defined(*[_id == "contact"][0]),
    "archivePages": defined(*[_id == "archivePages"][0])
  },
  "invalid": {
    "artworkMissingCore": count(*[_type == "artwork" && (!defined(title.en) || !defined(slug.current) || !defined(mainImage.asset))]),
    "artworkMissingMaterialRef": count(*[_type == "artwork" && !defined(mediumRef._ref)]),
    "badDetailImageTypes": count(*[_type == "artwork" && count(detailImages[_type != "imageWithMetadata"]) > 0]),
    "badTextureImageTypes": count(*[_type == "artwork" && count(textureImages[_type != "imageWithMetadata"]) > 0]),
    "brokenSeriesRefs": count(*[_type == "artwork" && defined(series._ref) && !defined(series->._id)]),
    "brokenExhibitionRefs": count(*[_type == "artwork" && count(exhibitions[defined(_ref) && !defined(@->._id)]) > 0]),
    "localizedPriceMismatch": count(*[_type == "artwork" && showPrice == true && !defined(prices.usd) && !defined(prices.rub) && !defined(prices.cny) && !defined(price)])
  },
  "features": {
    "exhibitionArtworks": count(*[_type == "artwork" && exhibitionFeatured == true && hideFromArchive != true]),
    "artworksWithVideo": count(*[_type == "artwork" && defined(videoFile.asset)]),
    "artworksWithDetailImages": count(*[_type == "artwork" && count(detailImages) > 0])
  },
  "aboutReady": defined(*[_id == "about"][0].pageTitle.en),
  "contactReady": defined(*[_id == "contact"][0].displayTitle.en)
}`);
console.log(JSON.stringify(result, null, 2));
const invalid = Object.values(result.invalid as Record<string, number>).reduce((sum, value) => sum + value, 0);
if (invalid > 0) process.exitCode = 1;