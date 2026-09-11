import type { ArtworkCard, ArtworkExhibition, ArtworkVideo, ExhibitionEntry, HomepageContent, InteriorScene, JournalEntry, SeriesEntry, ImageAsset } from "@/types/content";
import { sanityClient, sanityConfigured } from "@/lib/sanity/client";
import { aboutQuery, artworksQuery, exhibitionsQuery, interiorScenesQuery, journalQuery, localizedHomepageQuery, seriesQuery, siteSettingsQuery } from "@/lib/sanity/queries";
import { aboutContent, fallbackExhibitions, fallbackJournal, fallbackSeries } from "@/lib/content/fallback-editorial";
import { fallbackArtworks, fallbackHomepage } from "@/lib/content/fallback-homepage";
import { imageUrl } from "@/lib/sanity/image";
import { fallbackInteriorScenes } from "@/lib/content/fallback-interior-scenes";

const fetchOptions = { next: { revalidate: 3600, tags: ["sanity-content"] } };

function image(src: string | undefined, alt: string | undefined, fallback: ImageAsset, width?: number, height?: number): ImageAsset {
  return src ? { src, alt: alt || fallback.alt, width, height } : fallback;
}

function status(value?: string): ArtworkCard["status"] {
  if (value === "private-collection" || value === "museum") return "Private collection";
  if (value === "sold" || value === "unavailable") return "Sold";
  return "Available";
}

type RawArtworkSummary = Omit<ArtworkCard, "image" | "primaryImage" | "detailImages" | "textureImages" | "interiorImages" | "exhibition" | "video" | "status"> & {
  imageSrc?: string;
  imageAlt?: string;
  availability?: string;
};

type RawArtwork = RawArtworkSummary & {
  primaryImageSrc?: string;
  primaryImageAlt?: string;
  primaryImageWidth?: number;
  primaryImageHeight?: number;
  detailImages?: RawSanityImage[];
  textureImages?: RawSanityImage[];
  interiorImages?: RawSanityImage[];
  exhibition?: Omit<ArtworkExhibition, "image"> & { image?: RawSanityImage };
  video?: Omit<ArtworkVideo, "poster"> & { poster?: RawSanityImage };
};

type RawSanityImage = {
  _type?: "image";
  asset?: { _ref?: string; _type?: "reference" };
  crop?: { top: number; bottom: number; left: number; right: number };
  hotspot?: { x: number; y: number; height: number; width: number };
  alt?: string;
};

function configuredCrop(source: RawSanityImage | undefined, width: number, height: number): ImageAsset | undefined {
  if (!source?.asset?._ref) return undefined;
  const src = imageUrl(source as Parameters<typeof imageUrl>[0]).width(width).height(height).fit("crop").url();
  return { src, alt: source.alt || "Artwork image", width, height };
}

function configuredCrops(sources: RawSanityImage[] | undefined, width: number, height: number) {
  return (sources || []).map((source) => configuredCrop(source, width, height)).filter((item): item is ImageAsset => Boolean(item));
}

export async function getArtworks(locale: string): Promise<readonly ArtworkCard[]> {
  if (!sanityConfigured) return fallbackArtworks;
  try {
    const entries = await sanityClient.fetch<RawArtwork[]>(artworksQuery, { locale }, fetchOptions);
    return entries.length ? entries.map((entry) => {
      const archiveImage = image(entry.imageSrc, entry.imageAlt, fallbackHomepage.hero.image);
      const videoPoster = configuredCrop(entry.video?.poster, 1920, 800);
      return {
        ...entry,
        status: status(entry.availability),
        image: archiveImage,
        primaryImage: image(
          entry.primaryImageSrc,
          entry.primaryImageAlt,
          archiveImage,
          entry.primaryImageWidth,
          entry.primaryImageHeight,
        ),
        detailImages: configuredCrops(entry.detailImages, 1440, 900),
        textureImages: configuredCrops(entry.textureImages, 1440, 900),
        interiorImages: configuredCrops(entry.interiorImages, 1920, 1080),
        exhibition: entry.exhibition ? {
          ...entry.exhibition,
          image: configuredCrop(entry.exhibition.image, 1920, 1080),
        } : undefined,
        video: entry.video && videoPoster ? { ...entry.video, poster: videoPoster } : undefined,
      };
    }) : fallbackArtworks;
  } catch { return fallbackArtworks; }
}

type RawInteriorScene = Omit<InteriorScene, "image" | "mobileImage"> & { image?: RawSanityImage; mobileImage?: RawSanityImage };

export async function getInteriorScenes(locale: string): Promise<readonly InteriorScene[]> {
  if (!sanityConfigured) return fallbackInteriorScenes;
  try {
    const entries = await sanityClient.fetch<RawInteriorScene[]>(interiorScenesQuery, { locale }, fetchOptions);
    return entries.reduce<InteriorScene[]>((scenes, entry) => {
      const sceneImage = configuredCrop(entry.image, 2200, 1400);
      if (!sceneImage) return scenes;
      const mobileImage = configuredCrop(entry.mobileImage, 1200, 1500);
      scenes.push({
        slug: entry.slug,
        title: entry.title,
        sceneType: entry.sceneType,
        wallPhysicalWidthCm: entry.wallPhysicalWidthCm,
        wallPhysicalHeightCm: entry.wallPhysicalHeightCm,
        wallBounds: entry.wallBounds,
        allowWallColor: entry.allowWallColor,
        image: sceneImage,
        ...(mobileImage ? { mobileImage } : {}),
      });
      return scenes;
    }, []);
  } catch { return fallbackInteriorScenes; }
}

type RawSeries = Omit<SeriesEntry, "cover" | "years"> & { startYear?: number; endYear?: number; imageSrc?: string; imageAlt?: string };

export async function getSeries(locale: string): Promise<readonly SeriesEntry[]> {
  if (!sanityConfigured) return fallbackSeries;
  try {
    const entries = await sanityClient.fetch<RawSeries[]>(seriesQuery, { locale }, fetchOptions);
    return entries.length ? entries.map((entry) => ({ ...entry, years: [entry.startYear, entry.endYear].filter(Boolean).join(" — "), cover: image(entry.imageSrc, entry.imageAlt, fallbackSeries[0].cover) })) : fallbackSeries;
  } catch { return fallbackSeries; }
}

type RawExhibition = Omit<ExhibitionEntry, "image" | "year" | "dates" | "format"> & { type?: string; startDate?: string; endDate?: string; imageSrc?: string; imageAlt?: string };

export async function getExhibitions(locale: string): Promise<readonly ExhibitionEntry[]> {
  if (!sanityConfigured) return fallbackExhibitions;
  try {
    const entries = await sanityClient.fetch<RawExhibition[]>(exhibitionsQuery, { locale }, fetchOptions);
    return entries.length ? entries.map((entry) => ({ ...entry, year: entry.startDate?.slice(0, 4) || "", dates: [entry.startDate, entry.endDate].filter(Boolean).join(" — "), format: entry.type === "solo" ? "Solo exhibition" : "Group exhibition", image: image(entry.imageSrc, entry.imageAlt, fallbackExhibitions[0].image) })) : fallbackExhibitions;
  } catch { return fallbackExhibitions; }
}

type RawJournal = Omit<JournalEntry, "image" | "date" | "category"> & { date?: string; category?: string; imageSrc?: string; imageAlt?: string };

export async function getJournal(locale: string): Promise<readonly JournalEntry[]> {
  if (!sanityConfigured) return fallbackJournal;
  try {
    const entries = await sanityClient.fetch<RawJournal[]>(journalQuery, { locale }, fetchOptions);
    const categories = new Set<JournalEntry["category"]>(["Studio note", "Conversation", "Essay", "News"]);
    return entries.length ? entries.map((entry) => ({ ...entry, category: categories.has(entry.category as JournalEntry["category"]) ? entry.category as JournalEntry["category"] : "News", date: entry.date ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(entry.date)) : "", body: entry.body?.filter(Boolean) || [], image: image(entry.imageSrc, entry.imageAlt, fallbackJournal[0].image) })) : fallbackJournal;
  } catch { return fallbackJournal; }
}

type RawAbout = { quote?: string; shortBio?: string; biographyText?: string; statementText?: string; portraitSrc?: string; portraitAlt?: string; studioSrc?: string; studioAlt?: string };

export async function getAbout(locale: string) {
  const fallbackPortrait = { src: "/studio/alexander-mikhaleff-studio.png", alt: "Alexander Mikhaleff in his studio" };
  if (!sanityConfigured) return { ...aboutContent, portrait: fallbackPortrait, studio: fallbackPortrait };
  try {
    const entry = await sanityClient.fetch<RawAbout | null>(aboutQuery, { locale }, fetchOptions);
    if (!entry) return { ...aboutContent, portrait: fallbackPortrait, studio: fallbackPortrait };
    const biography = entry.biographyText?.split(/\n{2,}/).filter(Boolean) || (entry.shortBio ? [entry.shortBio] : []);
    const statement = entry.statementText?.split(/\n{2,}/).filter(Boolean) || [];
    return { ...aboutContent, quote: entry.quote || aboutContent.quote, biography: biography.length ? biography : aboutContent.biography, statement: statement.length ? statement : aboutContent.statement, portrait: image(entry.portraitSrc, entry.portraitAlt, fallbackPortrait), studio: image(entry.studioSrc, entry.studioAlt, fallbackPortrait) };
  } catch { return { ...aboutContent, portrait: fallbackPortrait, studio: fallbackPortrait }; }
}

type RawHomepage = { heroEyebrow?: string; heroTitle?: string; heroSubtitle?: string; heroImageSrc?: string; heroImageAlt?: string; heroArtworkTitle?: string; heroArtworkYear?: string; heroArtworkMedium?: string; heroArtworkDimensions?: string; statement?: string; selectedWorks?: RawArtworkSummary[]; featuredSeries?: RawSeries };

export async function getHomepage(locale: string): Promise<HomepageContent> {
  if (!sanityConfigured) return fallbackHomepage;
  try {
    const entry = await sanityClient.fetch<RawHomepage | null>(localizedHomepageQuery, { locale }, fetchOptions);
    if (!entry?.heroImageSrc) return fallbackHomepage;
    const exhibitions = await getExhibitions(locale);
    const selectedWorks = entry.selectedWorks?.length ? entry.selectedWorks.map((work) => ({ ...work, status: status(work.availability), image: image(work.imageSrc, work.imageAlt, fallbackHomepage.hero.image) })) : [...fallbackHomepage.selectedWorks.items];
    const featured = entry.featuredSeries;
    return {
      ...fallbackHomepage,
      hero: { ...fallbackHomepage.hero, eyebrow: entry.heroEyebrow || fallbackHomepage.hero.eyebrow, title: (entry.heroTitle || fallbackHomepage.hero.title.join("\n")).split("\n"), subtitle: entry.heroSubtitle || fallbackHomepage.hero.subtitle, image: image(entry.heroImageSrc, entry.heroImageAlt, fallbackHomepage.hero.image), artwork: { title: entry.heroArtworkTitle || fallbackHomepage.hero.artwork.title, year: entry.heroArtworkYear || fallbackHomepage.hero.artwork.year, medium: entry.heroArtworkMedium || fallbackHomepage.hero.artwork.medium, dimensions: entry.heroArtworkDimensions || fallbackHomepage.hero.artwork.dimensions } },
      statement: { ...fallbackHomepage.statement, quote: entry.statement || fallbackHomepage.statement.quote },
      selectedWorks: { ...fallbackHomepage.selectedWorks, items: selectedWorks },
      featuredSeries: featured ? { ...fallbackHomepage.featuredSeries, title: featured.title, years: [featured.startYear, featured.endYear].filter(Boolean).join(" — "), description: featured.description, slug: featured.slug, image: image(featured.imageSrc, featured.imageAlt, fallbackHomepage.featuredSeries.image) } : fallbackHomepage.featuredSeries,
      exhibitions: exhibitions.length ? { ...fallbackHomepage.exhibitions, image: exhibitions[0].image, items: exhibitions.slice(0, 5).map((exhibition) => ({ year: exhibition.year, title: exhibition.title, location: `${exhibition.city}, ${exhibition.country}` })) } : fallbackHomepage.exhibitions,
    };
  } catch { return fallbackHomepage; }
}

export type SiteSettings = {
  siteTitle: string;
  email: string;
  instagram: string;
  telegram?: string;
  whatsapp?: string;
  youtube?: string;
  facebook?: string;
  location: string;
  siteDescription?: string;
  shareImage?: string;
  navigation: readonly { key: string; label: string }[];
};

const fallbackSettings: SiteSettings = { siteTitle: "MIKHALEFF", email: "hello@mikhaleff.art", instagram: "https://instagram.com", telegram: "", whatsapp: "", youtube: "", facebook: "", location: "Europe", navigation: [] };

export async function getSiteSettings(locale: string): Promise<SiteSettings> {
  if (!sanityConfigured) return fallbackSettings;
  try {
    const settings = await sanityClient.fetch<Partial<SiteSettings> | null>(siteSettingsQuery, { locale }, fetchOptions);
    return settings ? { ...fallbackSettings, ...settings, navigation: settings.navigation || [] } : fallbackSettings;
  } catch { return fallbackSettings; }
}
