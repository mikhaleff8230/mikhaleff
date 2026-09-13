import { defineQuery } from "next-sanity";

export const languagesQuery = defineQuery(`*[_type == "language" && enabled == true] | order(order asc) {
  "code": code, nativeName, locale, slugPrefix, default
}`);

export const homepageQuery = defineQuery(`*[_type == "homepage"][0] {
  heroEyebrow, heroTitle, heroSubtitle,
  heroArtwork->{title, slug, year, medium, dimensions, mainImage, heroImage},
  heroImageOverride, statementText, statementImageOverride,
  selectedWorks[]->{title, slug, year, medium, dimensions, mainImage, galleryImage},
  featuredSeries->{title, slug, startYear, endYear, introduction, coverImage, heroImage},
  exhibitionsMode, selectedExhibitions[]->{title, slug, startDate, venue, city, country, cover},
  additionalSections, seo
}`);

export const exhibitionWorksQuery = defineQuery(`*[_type == "artwork" && hideFromArchive != true] | order(
  exhibitionFeatured desc, exhibitionOrder asc, year desc
) {
  _id, title, slug, year, medium, dimensions, mainImage, galleryImage,
  exhibitionFeatured, exhibitionOrder, exhibitionScale, exhibitionAlignment, exhibitionOffset
}`);

const localized = (field: string) => `coalesce(
  select($locale == "ru" => ${field}.ru, $locale == "zh" => ${field}.zh, ${field}.en),
  ${field}.en, ${field}.ru, ${field}.zh
)`;
const localizedFrom = (reference: string, field: string) => `coalesce(
  select($locale == "ru" => ${reference}->${field}.ru, $locale == "zh" => ${reference}->${field}.zh, ${reference}->${field}.en),
  ${reference}->${field}.en, ${reference}->${field}.ru, ${reference}->${field}.zh
)`;

export const artworksQuery = defineQuery(`*[_type == "artwork" && hideFromArchive != true] | order(artworkOrder asc, year desc) {
  "slug": slug.current,
  "title": ${localized("title")},
  "year": string(year),
  "medium": coalesce(
    select($locale == "ru" => mediumRef->title.ru, $locale == "zh" => mediumRef->title.zh, mediumRef->title.en),
    mediumRef->title.en, mediumRef->title.ru, mediumRef->title.zh, medium
  ),
  "dimensions": select(defined(dimensions.width) && defined(dimensions.height) => string(dimensions.width) + " × " + string(dimensions.height) + " " + coalesce(dimensions.unit, "cm"), "—"),
  "widthCm": select(dimensions.unit == "in" => dimensions.width * 2.54, dimensions.unit == "mm" => dimensions.width / 10, dimensions.width),
  "heightCm": select(dimensions.unit == "in" => dimensions.height * 2.54, dimensions.unit == "mm" => dimensions.height / 10, dimensions.height),
  "imageSrc": mainImage.asset->url,
  "imageAlt": coalesce(${localized("mainImage.alt")}, ${localized("title")}),
  "primaryImageSrc": mainImage.asset->url,
  "primaryImageAlt": coalesce(${localized("mainImage.alt")}, ${localized("title")}),
  "primaryImageWidth": mainImage.asset->metadata.dimensions.width,
  "primaryImageHeight": mainImage.asset->metadata.dimensions.height,
  "detailImages": detailImages[]{
    _type, asset, crop, hotspot,
    "src": asset->url,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height,
    "alt": coalesce(${localized("alt")}, ${localized("^.title")}, "Artwork detail")
  },
  "textureImages": textureImages[]{
    _type, asset, crop, hotspot,
    "src": asset->url,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height,
    "alt": coalesce(${localized("alt")}, ${localized("^.title")}, "Artwork texture")
  },
  "artistComment": ${localized("artistComment")},
  "relatedArtworkSlugs": relatedArtworks[]->slug.current,
  viewInSpaceEnabled,
  "preferredInteriorSceneSlug": preferredInteriorScene->slug.current,
  frameAllowed,
  trueScaleEnabled,
  "video": select(
    defined(videoFile.asset) || defined(videoExternalUrl) || defined(videoPoster.asset) => {
      "src": coalesce(videoFile.asset->url, videoExternalUrl),
      "poster": videoPoster{
        _type, asset, crop, hotspot,
        "src": asset->url,
        "width": asset->metadata.dimensions.width,
        "height": asset->metadata.dimensions.height,
        "alt": coalesce(${localized("alt")}, ${localized("^.videoTitle")}, "Studio film")
      },
      "eyebrow": ${localized("videoEyebrow")},
      "title": ${localized("videoTitle")},
      "caption": ${localized("videoCaption")}
    }
  ),
  "exhibition": exhibitions[0]->{
    "slug": slug.current,
    "title": ${localized("title")},
    startDate, venue, city, country,
    "image": coalesce(installationViews[0], cover){
      _type, asset, crop, hotspot,
      "alt": coalesce(${localized("alt")}, ${localized("^.title")}, "Exhibition view")
    }
  },
  "series": ${localizedFrom("series", "title")},
  availability,
  exhibitionFeatured, exhibitionOrder, exhibitionScale, exhibitionAlignment, exhibitionOffset,
  showPrice,
  "price": coalesce(
    select($locale == "ru" => prices.rub, $locale == "zh" => prices.cny, prices.usd),
    select($locale == "ru" && currency == "RUB" => price, $locale == "zh" && currency == "CNY" => price, $locale == "en" && currency == "USD" => price)
  ),
  "currency": select($locale == "ru" => "RUB", $locale == "zh" => "CNY", "USD"),
  "description": coalesce(
    pt::text(${localized("description")}),
    ${localized("shortDescription")}
  )
}`);

export const interiorScenesQuery = defineQuery(`*[_type == "interiorScene" && enabled == true] | order(order asc) {
  "slug": slug.current,
  "title": ${localized("title")},
  sceneType,
  wallPhysicalWidthCm,
  wallPhysicalHeightCm,
  wallBounds,
  allowWallColor,
  "image": sceneImage{
    _type, asset, crop, hotspot,
    "src": asset->url,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height,
    "alt": coalesce(${localized("alt")}, ${localized("^.title")}, "Interior scene")
  },
  "mobileImage": mobileSceneImage{
    _type, asset, crop, hotspot,
    "src": asset->url,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height,
    "alt": coalesce(${localized("alt")}, ${localized("^.title")}, "Interior scene")
  }
}`);

export const seriesQuery = defineQuery(`*[_type == "series"] | order(order asc, startYear desc) {
  "slug": slug.current,
  "title": ${localized("title")},
  "statement": coalesce(${localized("subtitle")}, ${localized("introduction")}),
  "description": coalesce(pt::text(${localized("description")}), ${localized("introduction")}),
  startYear, endYear,
  "imageSrc": coalesce(heroImage.asset->url, coverImage.asset->url),
  "imageAlt": coalesce(${localized("coverImage.alt")}, ${localized("title")}),
  "artworkSlugs": *[_type == "artwork" && references(^._id) && hideFromArchive != true] | order(artworkOrder asc, year desc).slug.current,
  "seoTitle": ${localized("seo.title")},
  "seoDescription": ${localized("seo.description")},
  "seoImageSrc": seo.ogImage.asset->url
}`);

export const exhibitionsQuery = defineQuery(`*[_type == "exhibition"] | order(startDate desc) {
  "slug": slug.current,
  "title": ${localized("title")}, type, startDate, endDate, venue, city, country,
  "introduction": ${localized("shortDescription")},
  "description": coalesce(pt::text(${localized("description")}), ${localized("shortDescription")}),
  "imageSrc": coalesce(installationViews[0].asset->url, cover.asset->url),
  "imageAlt": coalesce(${localized("cover.alt")}, ${localized("title")}),
  "artworkSlugs": *[_type == "artwork" && references(^._id) && hideFromArchive != true] | order(artworkOrder asc, year desc).slug.current,
  "seoTitle": ${localized("seo.title")},
  "seoDescription": ${localized("seo.description")},
  "seoImageSrc": seo.ogImage.asset->url
}`);

export const journalQuery = defineQuery(`*[_type == "journal"] | order(date desc) {
  "slug": slug.current,
  "title": ${localized("title")}, category, date,
  "excerpt": ${localized("excerpt")},
  "bodyText": pt::text(${localized("content")}),
  "imageSrc": cover.asset->url,
  "imageAlt": coalesce(${localized("cover.alt")}, ${localized("title")}),
  "seoTitle": ${localized("seo.title")},
  "seoDescription": ${localized("seo.description")},
  "seoImageSrc": seo.ogImage.asset->url
}`);

export const aboutQuery = defineQuery(`*[_type == "about"][0] {
  artistName,
  "pageEyebrow": ${localized("pageEyebrow")},
  "pageTitle": ${localized("pageTitle")},
  "introduction": ${localized("introduction")},
  "readBiographyLabel": ${localized("readBiographyLabel")},
  "studioTitle": ${localized("studioTitle")},
  "studioText": ${localized("studioText")},
  "quote": ${localized("quote")},
  "shortBio": ${localized("shortBio")},
  "biographyText": pt::text(${localized("fullBiography")}),
  "statementText": pt::text(${localized("artistStatement")}),
  "cvText": pt::text(${localized("cv")}),
  "pressText": pt::text(${localized("publications")}),
  "portraitSrc": portrait.asset->url,
  "portraitAlt": coalesce(${localized("portrait.alt")}, artistName),
  "studioSrc": studioImages[0].asset->url,
  "studioAlt": coalesce(${localized("studioImages[0].alt")}, "Artist studio"),
  "seoTitle": ${localized("seo.title")},
  "seoDescription": ${localized("seo.description")},
  "seoImageSrc": seo.ogImage.asset->url
}`);


export const contactPageQuery = defineQuery(`*[_type == "contact"][0] {
  "eyebrow": ${localized("eyebrow")},
  "displayTitle": ${localized("displayTitle")},
  "heading": ${localized("heading")},
  "introduction": ${localized("introduction")},
  "image": coalesce(backgroundImage, artwork->mainImage) {
    _type, asset, crop, hotspot,
    "src": asset->url,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height,
    "alt": coalesce(${localized("alt")}, "Contact artwork")
  },
  "seoTitle": ${localized("seo.title")},
  "seoDescription": ${localized("seo.description")},
  "seoImageSrc": seo.ogImage.asset->url
}`);
export const siteSettingsQuery = defineQuery(`*[_type == "siteSettings"][0] {
  siteTitle, email, instagram, telegram, whatsapp, youtube, facebook,
  "location": ${localized("location")},
  "siteDescription": ${localized("siteDescription")},
  "shareImage": defaultShareImage.asset->url,
  "navigation": navigationLabels[]{key, "label": select($locale == "ru" => label.ru, $locale == "zh" => label.zh, label.en)}
}`);

export const localizedHomepageQuery = defineQuery(`*[_type == "homepage"][0] {
  "heroEyebrow": ${localized("heroEyebrow")},
  "heroTitle": ${localized("heroTitle")},
  "heroSubtitle": ${localized("heroSubtitle")},
  "heroImageSrc": heroImageOverride.asset->url,
  "heroImageAlt": coalesce(${localized("heroImageOverride.alt")}, "Homepage hero"),
  "heroArtworkTitle": ${localizedFrom("heroArtwork", "title")},
  "heroArtworkYear": string(heroArtwork->year),
  "heroArtworkMedium": coalesce(select($locale == "ru" => heroArtwork->mediumRef->title.ru, $locale == "zh" => heroArtwork->mediumRef->title.zh, heroArtwork->mediumRef->title.en), heroArtwork->mediumRef->title.en, heroArtwork->mediumRef->title.ru, heroArtwork->mediumRef->title.zh, heroArtwork->medium),
  "heroArtworkDimensions": select(defined(heroArtwork->dimensions.width) => string(heroArtwork->dimensions.width) + " × " + string(heroArtwork->dimensions.height) + " " + coalesce(heroArtwork->dimensions.unit, "cm"), "—"),
  "statementEyebrow": ${localized("statementEyebrow")},
  "statement": ${localized("statementText")},
  "statementLinkLabel": ${localized("statementLinkLabel")},
  "selectedWorksEyebrow": ${localized("selectedWorksEyebrow")},
  "selectedWorksLinkLabel": ${localized("selectedWorksLinkLabel")},
  "selectedWorksNote": ${localized("selectedWorksNote")},
  "featuredEyebrow": ${localized("featuredEyebrow")},
  "featuredLinkLabel": ${localized("featuredLinkLabel")},
  exhibitionsMode,
  "selectedExhibitionSlugs": selectedExhibitions[]->slug.current,
  "exhibitionsEyebrow": ${localized("exhibitionsEyebrow")},
  "exhibitionsTitle": ${localized("exhibitionsTitle")},
  "exhibitionsNote": ${localized("exhibitionsNote")},
  "exhibitionsLinkLabel": ${localized("exhibitionsLinkLabel")},
  "exhibitionsImageSrc": exhibitionsImage.asset->url,
  "exhibitionsImageAlt": coalesce(${localized("exhibitionsImage.alt")}, "Exhibitions"),
  "contactTitle": ${localized("contactTitle")},
  "contactHeading": ${localized("contactHeading")},
  "contactEyebrow": ${localized("contactEyebrow")},
  "contactLinkLabel": ${localized("contactLinkLabel")},
  "seoTitle": ${localized("seo.title")},
  "seoDescription": ${localized("seo.description")},
  "seoImageSrc": seo.ogImage.asset->url,
  "statementImageSrc": statementImageOverride.asset->url,
  "statementImageAlt": coalesce(${localized("statementImageOverride.alt")}, "Artist statement"),
  "selectedWorks": selectedWorks[]->{
    "slug": slug.current, "title": ${localized("title")}, "year": string(year), "medium": coalesce(select($locale == "ru" => mediumRef->title.ru, $locale == "zh" => mediumRef->title.zh, mediumRef->title.en), mediumRef->title.en, mediumRef->title.ru, mediumRef->title.zh, medium),
    "dimensions": select(defined(dimensions.width) => string(dimensions.width) + " × " + string(dimensions.height) + " " + coalesce(dimensions.unit, "cm"), "—"),
    "imageSrc": mainImage.asset->url,
    "imageAlt": coalesce(${localized("mainImage.alt")}, ${localized("title")})
  },
  "featuredSeries": featuredSeries->{
    "slug": slug.current, "title": ${localized("title")}, "description": ${localized("introduction")}, startYear, endYear,
    "imageSrc": coalesce(heroImage.asset->url, coverImage.asset->url), "imageAlt": coalesce(${localized("coverImage.alt")}, ${localized("title")})
  }
}`);

export const archivePagesQuery = defineQuery(`*[_type == "archivePages"][0] {
  "works": works {
    "eyebrow": ${localized("eyebrow")}, "title": ${localized("title")}, "subtitle": ${localized("subtitle")},
    "note": ${localized("note")}, "ctaLabel": ${localized("ctaLabel")},
    "imageSrc": heroImage.asset->url, "imageAlt": coalesce(${localized("heroImage.alt")}, ${localized("title")}),
    "seoTitle": ${localized("seo.title")}, "seoDescription": ${localized("seo.description")},
    "seoImageSrc": seo.ogImage.asset->url, "canonical": seo.canonicalOverride, "noindex": seo.noindex
  },
  "collections": collections {
    "eyebrow": ${localized("eyebrow")}, "title": ${localized("title")}, "subtitle": ${localized("subtitle")},
    "note": ${localized("note")}, "ctaLabel": ${localized("ctaLabel")},
    "imageSrc": heroImage.asset->url, "imageAlt": coalesce(${localized("heroImage.alt")}, ${localized("title")}),
    "seoTitle": ${localized("seo.title")}, "seoDescription": ${localized("seo.description")},
    "seoImageSrc": seo.ogImage.asset->url, "canonical": seo.canonicalOverride, "noindex": seo.noindex
  },
  "exhibitions": exhibitions {
    "eyebrow": ${localized("eyebrow")}, "title": ${localized("title")}, "subtitle": ${localized("subtitle")},
    "note": ${localized("note")}, "ctaLabel": ${localized("ctaLabel")},
    "imageSrc": heroImage.asset->url, "imageAlt": coalesce(${localized("heroImage.alt")}, ${localized("title")}),
    "seoTitle": ${localized("seo.title")}, "seoDescription": ${localized("seo.description")},
    "seoImageSrc": seo.ogImage.asset->url, "canonical": seo.canonicalOverride, "noindex": seo.noindex
  },
  "journal": journal {
    "eyebrow": ${localized("eyebrow")}, "title": ${localized("title")}, "subtitle": ${localized("subtitle")},
    "note": ${localized("note")}, "ctaLabel": ${localized("ctaLabel")},
    "imageSrc": heroImage.asset->url, "imageAlt": coalesce(${localized("heroImage.alt")}, ${localized("title")}),
    "seoTitle": ${localized("seo.title")}, "seoDescription": ${localized("seo.description")},
    "seoImageSrc": seo.ogImage.asset->url, "canonical": seo.canonicalOverride, "noindex": seo.noindex
  }
}`);
