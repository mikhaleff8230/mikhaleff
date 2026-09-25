import type { ArtworkCard, HomepageContent } from "@/types/content";

export const fallbackHomepage = {
  hero: {
    eyebrow: "Contemporary artist",
    title: ["Alexander", "Mikhaleff"],
    subtitle: "A journey into\nthe unconscious",
    image: { src: "/artworks/untitled-032.png", alt: "Abstract painting in charcoal, ivory and rust red", position: "54% 51%" },
    artwork: { title: "Untitled 032", year: "2026", medium: "Oil on canvas", dimensions: "200 × 160 cm" },
  },
  statement: {
    eyebrow: "Art as a state of consciousness",
    quote: "A long walk through the dunes of consciousness led me to an understanding of the nature of abstraction…",
    linkLabel: "About the artist",
    image: { src: "/artworks/untitled-028.png", alt: "Abstract artwork detail for the artist statement", position: "48% 52%" },
  },
  film: {
    enabled: true,
    poster: { src: "/studio/artist-studio-placeholder.png", alt: "The artist working in the studio", position: "50% 48%" },
    eyebrow: "The process",
    title: "Between Matter and Memory",
    caption: "A short film on art, process and perception.",
    linkLabel: "Watch full video",
  },
  selectedWorks: {
    eyebrow: "Selected works",
    linkLabel: "View all works",
    note: "Painting is a way\nto be closer to the real.",
    items: [
      { slug: "untitled-028", title: "Untitled 028", year: "2026", medium: "Oil on canvas", dimensions: "160 × 120 cm", image: { src: "/artworks/untitled-028.png", alt: "Ivory abstract painting with rust and graphite gestures", position: "45% 48%" } },
      { slug: "untitled-027", title: "Untitled 027", year: "2026", medium: "Mixed media", dimensions: "180 × 140 cm", image: { src: "/artworks/inner-landscapes.png", alt: "Dark abstract painting crossed by a red gesture", position: "68% 55%" } },
      { slug: "untitled-026", title: "Untitled 026", year: "2025", medium: "Oil on canvas", dimensions: "200 × 160 cm", image: { src: "/artworks/untitled-032.png", alt: "Textured charcoal and ivory abstract painting", position: "65% 38%" } },
      { slug: "untitled-025", title: "Untitled 025", year: "2025", medium: "Acrylic", dimensions: "150 × 110 cm", image: { src: "/artworks/untitled-028.png", alt: "Warm ivory abstract painting with black marks", position: "72% 47%" } },
      { slug: "untitled-024", title: "Untitled 024", year: "2025", medium: "Mixed media", dimensions: "140 × 110 cm", image: { src: "/artworks/inner-landscapes.png", alt: "Layered dark abstract work in rust, ochre and ivory", position: "83% 50%" } },
    ],
  },
  featuredSeries: {
    eyebrow: "Featured series", title: "Inner\nLandscapes", years: "2023 — 2024",
    description: "A continuous exploration of the space between the visible and the invisible.",
    linkLabel: "Explore series", slug: "inner-landscapes",
    image: { src: "/artworks/inner-landscapes.png", alt: "Inner Landscapes series artwork", position: "62% 50%" },
  },
  exhibitions: {
    eyebrow: "Exhibitions", title: "Recent Exhibitions", linkLabel: "View all exhibitions",
    note: "A continuing dialogue through exhibitions, across cities and cultures.",
    image: { src: "/artworks/untitled-028.png", alt: "Featured work from the exhibition programme", position: "52% 48%" },
    items: [
      { year: "2026", title: "Inner Landscapes", location: "Almaty, Kazakhstan" },
      { year: "2025", title: "States of Matter", location: "Dubai, UAE" },
      { year: "2024", title: "Fragments", location: "Milan, Italy" },
      { year: "2023", title: "Beyond the Form", location: "New York, USA" },
      { year: "2022", title: "Silent Structures", location: "Berlin, Germany" },
    ],
  },
  contact: {
    title: ["Art", "Beyond", "Form"], heading: "Get in Touch",
    eyebrow: "For inquiries, collaborations\nor exhibition opportunities", linkLabel: "Contact",
  },
} satisfies HomepageContent;

const fallbackArtworkEntries = [
  {
    slug: "untitled-032", title: fallbackHomepage.hero.artwork.title,
    year: fallbackHomepage.hero.artwork.year, medium: fallbackHomepage.hero.artwork.medium,
    dimensions: fallbackHomepage.hero.artwork.dimensions, image: fallbackHomepage.hero.image,
    series: "Inner Landscapes", status: "Available" as const,
    description: "An exploration of structure and freedom — the moment where form dissolves and a new order begins to emerge.",
  },
  {
    slug: "untitled-031", title: "Untitled 031", year: "2026", medium: "Oil on canvas",
    dimensions: "150 × 120 cm", image: { src: "/artworks/inner-landscapes.png", alt: "Abstract painting in charcoal, ivory and restrained rust", position: "54% 46%" },
    series: "Raw Matter", status: "Available" as const,
    description: "A compressed field of light and matter, opened by a single interrupted gesture.",
  },
  {
    slug: "untitled-030", title: "Untitled 030", year: "2025", medium: "Acrylic",
    dimensions: "130 × 90 cm", image: { src: "/artworks/untitled-028.png", alt: "Pale abstract composition with a dense graphite field", position: "22% 38%" },
    series: "Raw Matter", status: "Available" as const,
    description: "Pale mineral layers gather around a dark structure that remains deliberately unresolved.",
  },
  {
    slug: "untitled-029", title: "Untitled 029", year: "2025", medium: "Mixed media",
    dimensions: "130 × 90 cm", image: { src: "/artworks/untitled-032.png", alt: "Vertical abstract work with black and rust gestures", position: "78% 48%" },
    series: "Inner Landscapes", status: "Available" as const,
    description: "A vertical rhythm holds together fragments of erasure, pigment and memory.",
  },
  ...fallbackHomepage.selectedWorks.items.map((artwork, index) => ({
    ...artwork,
    series: index < 2 ? "Raw Matter" : index < 4 ? "Inner Landscapes" : "Fragments",
    status: (index === 1 ? "Private collection" : "Available") as "Available" | "Private collection",
    description: "Layers of pigment, gesture and silence hold a space between material presence and inner perception.",
  })),
  {
    slug: "untitled-023", title: "Untitled 023", year: "2022", medium: "Oil on canvas",
    dimensions: "180 × 140 cm", image: { src: "/artworks/untitled-028.png", alt: "Ivory and graphite abstract landscape", position: "84% 58%" },
    series: "States of Silence", status: "Private collection" as const,
    description: "A quiet horizontal structure shaped by abrasion, pause and the residue of repeated marks.",
  },
];

export const fallbackArtworks: readonly ArtworkCard[] = fallbackArtworkEntries.map((artwork, index, artworks) => ({
  ...artwork,
  widthCm: Number.parseFloat(artwork.dimensions.split("×")[0]),
  heightCm: Number.parseFloat(artwork.dimensions.split("×")[1]),
  viewInSpaceEnabled: true,
  preferredInteriorSceneSlug: "gallery",
  frameAllowed: true,
  trueScaleEnabled: true,
  artistComment: artwork.description,
  detailImages: [
    { ...artwork.image, alt: `${artwork.title}, detail 01`, position: "24% 38%" },
    { ...artwork.image, alt: `${artwork.title}, detail 02`, position: "58% 54%" },
    { ...artwork.image, alt: `${artwork.title}, detail 03`, position: "82% 34%" },
  ],
  exhibition: {
    slug: "inner-landscapes-almaty",
    title: "Inner Landscapes",
    startDate: "2026-01-01",
    venue: "Gallery programme",
    city: "Almaty",
    country: "Kazakhstan",
    image: {
      src: "/exhibitions/inner-landscapes-installation-placeholder.png",
      alt: "Inner Landscapes exhibition view",
    },
  },
  video: {
    poster: {
      src: "/studio/artist-studio-placeholder.png",
      alt: "The artist working in the studio",
      position: "50% 48%",
    },
    eyebrow: "The process",
    title: "Between Matter and Memory",
    caption: "A short film on art, process and perception.",
  },
  relatedArtworkSlugs: Array.from({ length: Math.min(5, artworks.length - 1) }, (_, offset) => artworks[(index + offset + 1) % artworks.length].slug),
}));
