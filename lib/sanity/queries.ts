export const languagesQuery = `*[_type == "language" && enabled == true] | order(order asc) {
  "code": code, nativeName, locale, slugPrefix, default
}`;

export const homepageQuery = `*[_type == "homepage"][0] {
  heroEyebrow, heroTitle, heroSubtitle,
  heroArtwork->{title, slug, year, medium, dimensions, mainImage, heroImage},
  heroImageOverride, statementText, statementArtwork->{mainImage}, statementImageOverride,
  selectedWorks[]->{title, slug, year, medium, dimensions, mainImage, galleryImage},
  featuredSeries->{title, slug, startYear, endYear, introduction, coverImage, heroImage},
  exhibitionsMode, selectedExhibitions[]->{title, slug, startDate, venue, city, country, cover},
  additionalSections, seo
}`;

export const exhibitionWorksQuery = `*[_type == "artwork" && hideFromArchive != true] | order(
  exhibitionFeatured desc, exhibitionOrder asc, year desc
) {
  _id, title, slug, year, medium, dimensions, mainImage, galleryImage,
  exhibitionFeatured, exhibitionOrder, exhibitionScale, exhibitionAlignment, exhibitionOffset
}`;

const localized = (field: string) => `coalesce(
  select($locale == "ru" => ${field}.ru, $locale == "zh" => ${field}.zh, ${field}.en),
  ${field}.en, ${field}.ru, ${field}.zh
)`;
const localizedFrom = (reference: string, field: string) => `coalesce(
  select($locale == "ru" => ${reference}->${field}.ru, $locale == "zh" => ${reference}->${field}.zh, ${reference}->${field}.en),
  ${reference}->${field}.en, ${reference}->${field}.ru, ${reference}->${field}.zh
)`;

export const artworksQuery = `*[_type == "artwork" && hideFromArchive != true] | order(artworkOrder asc, year desc) {
  "slug": slug.current,
  "title": ${localized("title")},
  "year": string(year),
  medium,
  "dimensions": select(defined(dimensions.width) && defined(dimensions.height) => string(dimensions.width) + " × " + string(dimensions.height) + " " + coalesce(dimensions.unit, "cm"), "—"),
  "widthCm": select(dimensions.unit == "in" => dimensions.width * 2.54, dimensions.unit == "mm" => dimensions.width / 10, dimensions.width),
  "heightCm": select(dimensions.unit == "in" => dimensions.height * 2.54, dimensions.unit == "mm" => dimensions.height / 10, dimensions.height),
  "imageSrc": coalesce(galleryImage.asset->url, mainImage.asset->url),
  "imageAlt": coalesce(${localized("galleryImage.alt")}, ${localized("mainImage.alt")}, ${localized("title")}),
  "primaryImageSrc": mainImage.asset->url,
  "primaryImageAlt": coalesce(${localized("mainImage.alt")}, ${localized("title")}),
  "primaryImageWidth": mainImage.asset->metadata.dimensions.width,
  "primaryImageHeight": mainImage.asset->metadata.dimensions.height,
  "detailImages": detailImages[]{
    _type, asset, crop, hotspot,
    "alt": coalesce(${localized("alt")}, ${localized("^.title")}, "Artwork detail")
  },
  "textureImages": textureImages[]{
    _type, asset, crop, hotspot,
    "alt": coalesce(${localized("alt")}, ${localized("^.title")}, "Artwork texture")
  },
  "interiorImages": interiorImages[]{
    _type, asset, crop, hotspot,
    "alt": coalesce(${localized("alt")}, ${localized("^.title")}, "Artwork in an interior")
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
  showPrice,
  price,
  currency,
  "description": coalesce(
    pt::text(${localized("description")}),
    ${localized("shortDescription")}
  )
}`;

export const interiorScenesQuery = `*[_type == "interiorScene" && enabled == true] | order(order asc) {
  "slug": slug.current,
  "title": ${localized("title")},
  sceneType,
  wallPhysicalWidthCm,
  wallPhysicalHeightCm,
  wallBounds,
  allowWallColor,
  "image": sceneImage{
    _type, asset, crop, hotspot,
    "alt": coalesce(${localized("alt")}, ${localized("^.title")}, "Interior scene")
  },
  "mobileImage": mobileSceneImage{
    _type, asset, crop, hotspot,
    "alt": coalesce(${localized("alt")}, ${localized("^.title")}, "Interior scene")
  }
}`;

export const seriesQuery = `*[_type == "series"] | order(order asc, startYear desc) {
  "slug": slug.current,
  "title": ${localized("title")},
  "statement": coalesce(${localized("subtitle")}, ${localized("introduction")}),
  "description": ${localized("introduction")},
  startYear, endYear,
  "imageSrc": coalesce(heroImage.asset->url, coverImage.asset->url),
  "imageAlt": coalesce(${localized("coverImage.alt")}, ${localized("title")}),
  "artworkSlugs": artworks[]->slug.current
}`;

export const exhibitionsQuery = `*[_type == "exhibition"] | order(startDate desc) {
  "slug": slug.current,
  "title": ${localized("title")}, type, startDate, endDate, venue, city, country,
  "introduction": ${localized("shortDescription")},
  "description": ${localized("shortDescription")},
  "imageSrc": coalesce(installationViews[0].asset->url, cover.asset->url),
  "imageAlt": coalesce(${localized("cover.alt")}, ${localized("title")}),
  "artworkSlugs": artworks[]->slug.current
}`;

export const journalQuery = `*[_type == "journal"] | order(date desc) {
  "slug": slug.current,
  "title": ${localized("title")}, category, date,
  "excerpt": ${localized("excerpt")},
  "body": coalesce((${localized("content")})[].children[].text, []),
  "imageSrc": cover.asset->url,
  "imageAlt": coalesce(${localized("cover.alt")}, ${localized("title")})
}`;

export const aboutQuery = `*[_type == "about"][0] {
  "quote": ${localized("quote")},
  "shortBio": ${localized("shortBio")},
  "biographyText": pt::text(${localized("fullBiography")}),
  "statementText": pt::text(${localized("artistStatement")}),
  "portraitSrc": portrait.asset->url,
  "portraitAlt": coalesce(${localized("portrait.alt")}, artistName),
  "studioSrc": studioImages[0].asset->url,
  "studioAlt": coalesce(${localized("studioImages[0].alt")}, "Artist studio")
}`;

export const siteSettingsQuery = `*[_type == "siteSettings"][0] {
  siteTitle, email, instagram, telegram, whatsapp, youtube, facebook, location,
  "siteDescription": ${localized("siteDescription")},
  "shareImage": defaultShareImage.asset->url,
  "navigation": navigationLabels[]{key, "label": select($locale == "ru" => label.ru, $locale == "zh" => label.zh, label.en)}
}`;

export const localizedHomepageQuery = `*[_type == "homepage"][0] {
  "heroEyebrow": ${localized("heroEyebrow")},
  "heroTitle": ${localized("heroTitle")},
  "heroSubtitle": ${localized("heroSubtitle")},
  "heroImageSrc": coalesce(heroImageOverride.asset->url, heroArtwork->heroImage.asset->url, heroArtwork->mainImage.asset->url),
  "heroImageAlt": coalesce(${localized("heroImageOverride.alt")}, ${localizedFrom("heroArtwork", "mainImage.alt")}, ${localizedFrom("heroArtwork", "title")}),
  "heroArtworkTitle": ${localizedFrom("heroArtwork", "title")},
  "heroArtworkYear": string(heroArtwork->year),
  "heroArtworkMedium": heroArtwork->medium,
  "heroArtworkDimensions": select(defined(heroArtwork->dimensions.width) => string(heroArtwork->dimensions.width) + " × " + string(heroArtwork->dimensions.height) + " " + coalesce(heroArtwork->dimensions.unit, "cm"), "—"),
  "statement": ${localized("statementText")},
  "selectedWorks": selectedWorks[]->{
    "slug": slug.current, "title": ${localized("title")}, "year": string(year), medium,
    "dimensions": select(defined(dimensions.width) => string(dimensions.width) + " × " + string(dimensions.height) + " " + coalesce(dimensions.unit, "cm"), "—"),
    "imageSrc": coalesce(galleryImage.asset->url, mainImage.asset->url),
    "imageAlt": coalesce(${localized("galleryImage.alt")}, ${localized("mainImage.alt")}, ${localized("title")})
  },
  "featuredSeries": featuredSeries->{
    "slug": slug.current, "title": ${localized("title")}, "description": ${localized("introduction")}, startYear, endYear,
    "imageSrc": coalesce(heroImage.asset->url, coverImage.asset->url), "imageAlt": coalesce(${localized("coverImage.alt")}, ${localized("title")})
  }
}`;
