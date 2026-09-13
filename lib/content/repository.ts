import type { ArtworksQueryResult, InteriorScenesQueryResult, SeriesQueryResult, ExhibitionsQueryResult, JournalQueryResult, AboutQueryResult, SiteSettingsQueryResult, LocalizedHomepageQueryResult, ArchivePagesQueryResult, ContactPageQueryResult } from "@/sanity.types";
import type { ArtworkCard, ArtworkExhibition, ArtworkVideo, ExhibitionEntry, HomepageContent, InteriorScene, JournalEntry, SeriesEntry, ImageAsset, ContactPageContent } from "@/types/content";
import { sanityClient, sanityConfigured } from "@/lib/sanity/client";
import { aboutQuery, artworksQuery, exhibitionsQuery, interiorScenesQuery, journalQuery, localizedHomepageQuery, seriesQuery, siteSettingsQuery, archivePagesQuery, contactPageQuery } from "@/lib/sanity/queries";
import { aboutContent, fallbackExhibitions, fallbackJournal, fallbackSeries } from "@/lib/content/fallback-editorial";
import { fallbackArtworks, fallbackHomepage } from "@/lib/content/fallback-homepage";
import { fallbackInteriorScenes } from "@/lib/content/fallback-interior-scenes";

const fetchOptions = { cache: "no-store" as const };
const siteSettingsFetchOptions = fetchOptions;

function image(src: string | undefined, alt: string | undefined, fallback: ImageAsset, width?: number, height?: number): ImageAsset {
  return src ? { src, alt: alt || fallback.alt, width, height } : fallback;
}

function status(value: string | undefined, locale: string): ArtworkCard["status"] {
  const key = value === "private-collection" || value === "museum" ? "private" : value === "sold" || value === "unavailable" ? "sold" : value === "reserved" ? "reserved" : "available";
  const labels = {
    en: { available: "Available", reserved: "Reserved", private: "Private collection", sold: "Sold" },
    ru: { available: "Доступна", reserved: "Зарезервирована", private: "Частная коллекция", sold: "Продана" },
    zh: { available: "可购", reserved: "已预订", private: "私人收藏", sold: "已售" },
  } as const;
  return (labels[locale as keyof typeof labels] || labels.en)[key] as ArtworkCard["status"];
}

type RawArtworkSummary = Omit<ArtworkCard, "image" | "primaryImage" | "detailImages" | "textureImages" | "exhibition" | "video" | "status"> & {
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
  exhibition?: Omit<ArtworkExhibition, "image"> & { image?: RawSanityImage };
  video?: Omit<ArtworkVideo, "poster"> & { poster?: RawSanityImage };
};

type RawSanityImage = {
  _type?: "image";
  asset?: { _ref?: string; _type?: "reference" };
  crop?: { top: number; bottom: number; left: number; right: number };
  hotspot?: { x: number; y: number; height: number; width: number };
  alt?: string;
  src?: string;
  width?: number;
  height?: number;
};

function configuredImage(source: RawSanityImage | undefined): ImageAsset | undefined {
  if (!source?.src) return undefined;
  return {
    src: source.src,
    alt: source.alt || "Artwork image",
    ...(source.width ? { width: source.width } : {}),
    ...(source.height ? { height: source.height } : {}),
  };
}

function configuredImages(sources: RawSanityImage[] | undefined): ImageAsset[] {
  return (sources || []).flatMap<ImageAsset>((source) => {
    const nextImage = configuredImage(source);
    return nextImage ? [nextImage] : [];
  });
}

export async function getArtworks(locale: string): Promise<readonly ArtworkCard[]> {
  if (!sanityConfigured) return fallbackArtworks;
  try {
    const entries = await sanityClient.fetch<ArtworksQueryResult>(artworksQuery, { locale }, fetchOptions) as unknown as RawArtwork[];
    return entries.length ? entries.map((entry) => {
      const archiveImage = image(entry.imageSrc, entry.imageAlt, fallbackHomepage.hero.image, entry.primaryImageWidth, entry.primaryImageHeight);
      const videoPoster = configuredImage(entry.video?.poster);
      return {
        ...entry,
        status: status(entry.availability, locale),
        image: archiveImage,
        primaryImage: image(
          entry.primaryImageSrc,
          entry.primaryImageAlt,
          archiveImage,
          entry.primaryImageWidth,
          entry.primaryImageHeight,
        ),
        detailImages: configuredImages(entry.detailImages),
        textureImages: configuredImages(entry.textureImages),
        exhibition: entry.exhibition ? {
          ...entry.exhibition,
          image: configuredImage(entry.exhibition.image),
        } : undefined,
        video: entry.video ? { ...entry.video, poster: videoPoster || archiveImage } : undefined,
      };
    }) : fallbackArtworks;
  } catch (error) {
    console.error("[sanity] Failed to load artworks", error);
    return fallbackArtworks;
  }
}

type RawInteriorScene = Omit<InteriorScene, "image" | "mobileImage"> & { image?: RawSanityImage; mobileImage?: RawSanityImage };

export async function getInteriorScenes(locale: string): Promise<readonly InteriorScene[]> {
  if (!sanityConfigured) return fallbackInteriorScenes;
  try {
    const entries = await sanityClient.fetch<InteriorScenesQueryResult>(interiorScenesQuery, { locale }, fetchOptions) as unknown as RawInteriorScene[];
    return entries.reduce<InteriorScene[]>((scenes, entry) => {
      const sceneImage = configuredImage(entry.image);
      if (!sceneImage) return scenes;
      const mobileImage = configuredImage(entry.mobileImage);
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
    const entries = await sanityClient.fetch<SeriesQueryResult>(seriesQuery, { locale }, fetchOptions) as unknown as RawSeries[];
    return entries.length ? entries.map((entry) => ({ ...entry, years: [entry.startYear, entry.endYear].filter(Boolean).join(" — "), cover: image(entry.imageSrc, entry.imageAlt, fallbackSeries[0].cover) })) : fallbackSeries;
  } catch { return fallbackSeries; }
}

type RawExhibition = Omit<ExhibitionEntry, "image" | "year" | "dates" | "format"> & { type?: string; startDate?: string; endDate?: string; imageSrc?: string; imageAlt?: string };

export async function getExhibitions(locale: string): Promise<readonly ExhibitionEntry[]> {
  if (!sanityConfigured) return fallbackExhibitions;
  try {
    const entries = await sanityClient.fetch<ExhibitionsQueryResult>(exhibitionsQuery, { locale }, fetchOptions) as unknown as RawExhibition[];
    const formatLabels = locale === "ru" ? { solo: "Персональная выставка", group: "Групповая выставка" } : locale === "zh" ? { solo: "个展", group: "群展" } : { solo: "Solo exhibition", group: "Group exhibition" };
    return entries.length ? entries.map((entry) => ({ ...entry, year: entry.startDate?.slice(0, 4) || "", dates: [entry.startDate, entry.endDate].filter(Boolean).join(" — "), format: entry.type === "solo" ? formatLabels.solo : formatLabels.group, image: image(entry.imageSrc, entry.imageAlt, fallbackExhibitions[0].image) })) : fallbackExhibitions;
  } catch { return fallbackExhibitions; }
}

type RawJournal = Omit<JournalEntry, "image" | "date" | "category" | "body"> & { date?: string; category?: string; bodyText?: string; imageSrc?: string; imageAlt?: string };

export async function getJournal(locale: string): Promise<readonly JournalEntry[]> {
  if (!sanityConfigured) return fallbackJournal;
  try {
    const entries = await sanityClient.fetch<JournalQueryResult>(journalQuery, { locale }, fetchOptions) as unknown as RawJournal[];
    const categoryLabels = {
      en: { "Studio note": "Studio note", Conversation: "Conversation", Essay: "Essay", News: "News" },
      ru: { "Studio note": "Из студии", Conversation: "Разговор", Essay: "Эссе", News: "Новости" },
      zh: { "Studio note": "工作室札记", Conversation: "对话", Essay: "随笔", News: "新闻" },
    } as const;
    const categoryCopy = categoryLabels[locale as keyof typeof categoryLabels] || categoryLabels.en;
    return entries.length ? entries.map((entry) => {
      const key = entry.category && entry.category in categoryCopy ? entry.category as keyof typeof categoryCopy : "News";
      return { ...entry, category: categoryCopy[key], date: entry.date ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(entry.date)) : "", body: entry.bodyText?.split(/\n{2,}/).filter(Boolean) || [], image: image(entry.imageSrc, entry.imageAlt, fallbackJournal[0].image) };
    }) : fallbackJournal;
  } catch { return fallbackJournal; }
}

type RawAbout = {
  artistName?: string; pageEyebrow?: string; pageTitle?: string; introduction?: string; readBiographyLabel?: string;
  studioTitle?: string; studioText?: string; quote?: string; shortBio?: string; biographyText?: string;
  statementText?: string; cvText?: string; pressText?: string; portraitSrc?: string; portraitAlt?: string;
  studioSrc?: string; studioAlt?: string; seoTitle?: string; seoDescription?: string; seoImageSrc?: string;
};

export async function getAbout(locale: string) {
  const fallbackPortrait = { src: "/studio/alexander-mikhaleff-studio.png", alt: "Alexander Mikhaleff in his studio" };
  const defaults = {
    ...aboutContent,
    artistName: "Alexander Mikhaleff",
    pageEyebrow: "/ About",
    pageTitle: "About\nthe Artist",
    introduction: "My work is a continuous exploration of the space between the visible and the invisible. Through abstraction I seek to express states, emotions and structures that exist beyond rational perception.",
    readBiographyLabel: "Read full biography",
    studioTitle: "Between matter\nand memory",
    studioText: "The studio is treated as a field of attention: a place where gesture, accident and revision are allowed to remain visible.",
    cvItems: aboutContent.cv.map(([year, event]) => `${year} — ${event}`),
    pressItems: aboutContent.press.map(([publication, title, year]) => `${year} — ${publication}: ${title}`),
    portrait: fallbackPortrait,
    studio: fallbackPortrait,
    seoTitle: undefined as string | undefined,
    seoDescription: undefined as string | undefined,
    seoImageSrc: undefined as string | undefined,
  };
  if (!sanityConfigured) return defaults;
  try {
    const entry = await sanityClient.fetch<AboutQueryResult>(aboutQuery, { locale }, fetchOptions) as unknown as RawAbout | null;
    if (!entry) return defaults;
    const biography = entry.biographyText?.split(/\n{2,}/).filter(Boolean) || (entry.shortBio ? [entry.shortBio] : []);
    const statement = entry.statementText?.split(/\n{2,}/).filter(Boolean) || [];
    const cvItems = entry.cvText?.split(/\n+/).map((item) => item.trim()).filter(Boolean) || [];
    const pressItems = entry.pressText?.split(/\n+/).map((item) => item.trim()).filter(Boolean) || [];
    return {
      ...defaults,
      artistName: entry.artistName || defaults.artistName,
      pageEyebrow: entry.pageEyebrow || defaults.pageEyebrow,
      pageTitle: entry.pageTitle || defaults.pageTitle,
      introduction: entry.introduction || entry.shortBio || defaults.introduction,
      readBiographyLabel: entry.readBiographyLabel || defaults.readBiographyLabel,
      studioTitle: entry.studioTitle || defaults.studioTitle,
      studioText: entry.studioText || defaults.studioText,
      quote: entry.quote || defaults.quote,
      biography: biography.length ? biography : defaults.biography,
      statement: statement.length ? statement : defaults.statement,
      cvItems: cvItems.length ? cvItems : defaults.cvItems,
      pressItems: pressItems.length ? pressItems : defaults.pressItems,
      portrait: image(entry.portraitSrc, entry.portraitAlt, fallbackPortrait),
      studio: image(entry.studioSrc, entry.studioAlt, fallbackPortrait),
      seoTitle: entry.seoTitle,
      seoDescription: entry.seoDescription,
      seoImageSrc: entry.seoImageSrc,
    };
  } catch (error) {
    console.error("[sanity] Failed to load About", error);
    return defaults;
  }
}
type RawHomepage = { heroEyebrow?: string; heroTitle?: string; heroSubtitle?: string; heroImageSrc?: string; heroImageAlt?: string; heroArtworkTitle?: string; heroArtworkYear?: string; heroArtworkMedium?: string; heroArtworkDimensions?: string; statementEyebrow?: string; statement?: string; statementLinkLabel?: string; statementImageSrc?: string; statementImageAlt?: string; selectedWorksEyebrow?: string; selectedWorksLinkLabel?: string; selectedWorksNote?: string; selectedWorks?: RawArtworkSummary[]; featuredEyebrow?: string; featuredLinkLabel?: string; featuredSeries?: RawSeries; exhibitionsMode?: "latest" | "manual"; selectedExhibitionSlugs?: string[]; exhibitionsEyebrow?: string; exhibitionsTitle?: string; exhibitionsNote?: string; exhibitionsLinkLabel?: string; exhibitionsImageSrc?: string; exhibitionsImageAlt?: string; contactTitle?: string; contactHeading?: string; contactEyebrow?: string; contactLinkLabel?: string; seoTitle?: string; seoDescription?: string; seoImageSrc?: string };

export async function getHomepage(locale: string): Promise<HomepageContent> {
  if (!sanityConfigured) return fallbackHomepage;
  try {
    const entry = await sanityClient.fetch<LocalizedHomepageQueryResult>(localizedHomepageQuery, { locale }, fetchOptions) as unknown as RawHomepage | null;
    if (!entry?.heroImageSrc) return fallbackHomepage;
    const allExhibitions = await getExhibitions(locale);
    const exhibitions = entry.exhibitionsMode === "manual" && entry.selectedExhibitionSlugs?.length
      ? entry.selectedExhibitionSlugs.map((slug) => allExhibitions.find((item) => item.slug === slug)).filter((item): item is (typeof allExhibitions)[number] => Boolean(item))
      : allExhibitions;
    const selectedWorks = entry.selectedWorks?.length ? entry.selectedWorks.map((work) => ({ ...work, status: status(work.availability, locale), image: image(work.imageSrc, work.imageAlt, fallbackHomepage.hero.image) })) : [...fallbackHomepage.selectedWorks.items];
    const featured = entry.featuredSeries;
    return {
      ...fallbackHomepage,
      seoTitle: entry.seoTitle || undefined,
      seoDescription: entry.seoDescription || undefined,
      seoImageSrc: entry.seoImageSrc || undefined,
      hero: { ...fallbackHomepage.hero, eyebrow: entry.heroEyebrow || fallbackHomepage.hero.eyebrow, title: (entry.heroTitle || fallbackHomepage.hero.title.join("\n")).split("\n"), subtitle: entry.heroSubtitle || fallbackHomepage.hero.subtitle, image: image(entry.heroImageSrc, entry.heroImageAlt, fallbackHomepage.hero.image), artwork: { title: entry.heroArtworkTitle || fallbackHomepage.hero.artwork.title, year: entry.heroArtworkYear || fallbackHomepage.hero.artwork.year, medium: entry.heroArtworkMedium || fallbackHomepage.hero.artwork.medium, dimensions: entry.heroArtworkDimensions || fallbackHomepage.hero.artwork.dimensions } },
      statement: { ...fallbackHomepage.statement, eyebrow: entry.statementEyebrow || fallbackHomepage.statement.eyebrow, quote: entry.statement || fallbackHomepage.statement.quote, linkLabel: entry.statementLinkLabel || fallbackHomepage.statement.linkLabel, image: image(entry.statementImageSrc, entry.statementImageAlt, fallbackHomepage.statement.image) },
      selectedWorks: { ...fallbackHomepage.selectedWorks, eyebrow: entry.selectedWorksEyebrow || fallbackHomepage.selectedWorks.eyebrow, linkLabel: entry.selectedWorksLinkLabel || fallbackHomepage.selectedWorks.linkLabel, note: entry.selectedWorksNote || fallbackHomepage.selectedWorks.note, items: selectedWorks },
      featuredSeries: featured ? { ...fallbackHomepage.featuredSeries, eyebrow: entry.featuredEyebrow || fallbackHomepage.featuredSeries.eyebrow, linkLabel: entry.featuredLinkLabel || fallbackHomepage.featuredSeries.linkLabel, title: featured.title, years: [featured.startYear, featured.endYear].filter(Boolean).join(" — "), description: featured.description, slug: featured.slug, image: image(featured.imageSrc, featured.imageAlt, fallbackHomepage.featuredSeries.image) } : fallbackHomepage.featuredSeries,
      exhibitions: exhibitions.length ? { ...fallbackHomepage.exhibitions, eyebrow: entry.exhibitionsEyebrow || fallbackHomepage.exhibitions.eyebrow, title: entry.exhibitionsTitle || fallbackHomepage.exhibitions.title, note: entry.exhibitionsNote || fallbackHomepage.exhibitions.note, linkLabel: entry.exhibitionsLinkLabel || fallbackHomepage.exhibitions.linkLabel, image: image(entry.exhibitionsImageSrc, entry.exhibitionsImageAlt, exhibitions[0].image), items: exhibitions.slice(0, 5).map((exhibition) => ({ year: exhibition.year, title: exhibition.title, location: `${exhibition.city}, ${exhibition.country}` })) } : fallbackHomepage.exhibitions,
      contact: { ...fallbackHomepage.contact, title: (entry.contactTitle || fallbackHomepage.contact.title.join("\n")).split("\n"), heading: entry.contactHeading || fallbackHomepage.contact.heading, eyebrow: entry.contactEyebrow || fallbackHomepage.contact.eyebrow, linkLabel: entry.contactLinkLabel || fallbackHomepage.contact.linkLabel },
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
    const settings = await sanityClient.fetch<SiteSettingsQueryResult>(siteSettingsQuery, { locale }, siteSettingsFetchOptions) as unknown as Partial<SiteSettings> | null;
    return settings ? { ...fallbackSettings, ...settings, navigation: settings.navigation || [] } : fallbackSettings;
  } catch { return fallbackSettings; }
}


export type ArchivePageKey = "works" | "collections" | "exhibitions" | "journal";
export type ArchivePageContent = {
  eyebrow: string; title: string; subtitle: string; note?: string; ctaLabel?: string;
  image?: ImageAsset; seoTitle?: string; seoDescription?: string; seoImageSrc?: string; canonical?: string; noindex?: boolean;
};

const archiveDefaults: Record<ArchivePageKey, ArchivePageContent> = {
  works: { eyebrow: "/ Works", title: "Paintings", subtitle: "Fragments of a larger consciousness", note: "Each painting is a trace of a state — a moment between structure and freedom, form and formlessness.", ctaLabel: "Explore the works", image: fallbackHomepage.hero.image },
  collections: { eyebrow: "/ Collections", title: "Collections", subtitle: "Different states. One continuous exploration.", note: "Each collection is a chapter in an ongoing search — a reflection of inner landscapes, material experiments and evolving states of perception." },
  exhibitions: { eyebrow: "/ Exhibitions", title: "Exhibitions", subtitle: "Solo and group exhibitions. A continuing dialogue." },
  journal: { eyebrow: "/ Journal", title: "Journal", subtitle: "Studio notes, conversations and fragments of process." },
};

export async function getArchivePage(locale: string, page: ArchivePageKey): Promise<ArchivePageContent> {
  if (!sanityConfigured) return archiveDefaults[page];
  try {
    const result = await sanityClient.fetch<ArchivePagesQueryResult>(archivePagesQuery, { locale }, fetchOptions);
    const entry = result?.[page];
    if (!entry) return archiveDefaults[page];
    const defaults = archiveDefaults[page];
    return {
      eyebrow: entry.eyebrow || defaults.eyebrow,
      title: entry.title || defaults.title,
      subtitle: entry.subtitle || defaults.subtitle,
      note: entry.note || defaults.note,
      ctaLabel: entry.ctaLabel || defaults.ctaLabel,
      image: entry.imageSrc ? { src: entry.imageSrc, alt: entry.imageAlt || entry.title || defaults.title } : defaults.image,
      seoTitle: entry.seoTitle || undefined, seoDescription: entry.seoDescription || undefined, seoImageSrc: entry.seoImageSrc || undefined,
      canonical: entry.canonical || undefined, noindex: entry.noindex || undefined,
    };
  } catch (error) {
    console.error(`[sanity] Failed to load archive page ${page}`, error);
    return archiveDefaults[page];
  }
}

export async function getContactPage(locale: string): Promise<ContactPageContent> {
  const fallback: ContactPageContent = {
    eyebrow: "/ Contact",
    displayTitle: "Art\nBeyond\nForm",
    heading: "Get in Touch",
    introduction: "For inquiries, collaborations and exhibition opportunities.",
    image: fallbackHomepage.hero.image,
  };
  if (!sanityConfigured) return fallback;
  try {
    const entry = await sanityClient.fetch<ContactPageQueryResult>(contactPageQuery, { locale }, fetchOptions) as unknown as (Omit<ContactPageContent, "image"> & { image?: RawSanityImage }) | null;
    if (!entry) return fallback;
    return { ...fallback, ...entry, image: configuredImage(entry.image) || fallback.image };
  } catch (error) {
    console.error("[sanity] Failed to load contact page", error);
    return fallback;
  }
}