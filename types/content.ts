export type ImageAsset = {
  src: string;
  alt: string;
  position?: string;
  width?: number;
  height?: number;
};

export type ArtworkExhibition = {
  slug: string;
  title: string;
  startDate?: string;
  venue: string;
  city: string;
  country: string;
  image?: ImageAsset;
};

export type ArtworkVideo = {
  src?: string;
  poster: ImageAsset;
  eyebrow?: string;
  title?: string;
  caption?: string;
};

export type InteriorScene = {
  slug: string;
  title: string;
  sceneType: "gallery" | "living" | "minimal" | "dark" | "classic" | "custom";
  image: ImageAsset;
  mobileImage?: ImageAsset;
  wallPhysicalWidthCm?: number;
  wallPhysicalHeightCm?: number;
  wallBounds: { x: number; y: number; width: number; height: number };
  allowWallColor?: boolean;
};

export type ArtworkCard = {
  slug: string;
  title: string;
  year: string;
  medium: string;
  dimensions: string;
  image: ImageAsset;
  primaryImage?: ImageAsset;
  detailImages?: readonly ImageAsset[];
  textureImages?: readonly ImageAsset[];
  artistComment?: string;
  relatedArtworkSlugs?: readonly string[];
  exhibition?: ArtworkExhibition;
  video?: ArtworkVideo;
  widthCm?: number;
  heightCm?: number;
  viewInSpaceEnabled?: boolean;
  preferredInteriorSceneSlug?: string;
  frameAllowed?: boolean;
  trueScaleEnabled?: boolean;
  series?: string;
  status?: "Available" | "Private collection" | "Sold";
  showPrice?: boolean;
  price?: number;
  currency?: string;
  description?: string;
};

export type SeriesEntry = {
  slug: string;
  title: string;
  years: string;
  statement: string;
  description: string;
  cover: ImageAsset;
  artworkSlugs: readonly string[];
};

export type ExhibitionEntry = {
  slug: string;
  title: string;
  year: string;
  dates: string;
  venue: string;
  city: string;
  country: string;
  format: "Solo exhibition" | "Group exhibition";
  introduction: string;
  description: string;
  image: ImageAsset;
  artworkSlugs: readonly string[];
};

export type JournalEntry = {
  slug: string;
  title: string;
  category: "Studio note" | "Conversation" | "Essay" | "News";
  date: string;
  excerpt: string;
  body: readonly string[];
  image: ImageAsset;
};

export type HomepageContent = {
  hero: {
    eyebrow: string;
    title: readonly string[];
    subtitle: string;
    image: ImageAsset;
    artwork: Omit<ArtworkCard, "slug" | "image">;
  };
  statement: { eyebrow: string; quote: string; linkLabel: string; image: ImageAsset };
  selectedWorks: { eyebrow: string; linkLabel: string; note: string; items: readonly ArtworkCard[] };
  featuredSeries: {
    eyebrow: string; title: string; years: string; description: string;
    linkLabel: string; slug: string; image: ImageAsset;
  };
  exhibitions: {
    eyebrow: string; title: string; linkLabel: string; note: string;
    image: ImageAsset;
    items: readonly { year: string; title: string; location: string }[];
  };
  contact: { title: readonly string[]; heading: string; eyebrow: string; linkLabel: string };
};
