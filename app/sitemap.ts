import type { MetadataRoute } from "next";
import { fallbackLanguages } from "@/lib/i18n/config";
import { fallbackArtworks } from "@/lib/content/fallback-homepage";
import { fallbackExhibitions, fallbackJournal, fallbackSeries } from "@/lib/content/fallback-editorial";

export default function sitemap(): MetadataRoute.Sitemap {
  const sections = ["", "/works", "/collections", "/exhibitions", "/about", "/journal", "/contact"];
  const details = [
    ...fallbackArtworks.map(({ slug }) => `/works/${slug}`),
    ...fallbackSeries.map(({ slug }) => `/collections/${slug}`),
    ...fallbackExhibitions.map(({ slug }) => `/exhibitions/${slug}`),
    ...fallbackJournal.map(({ slug }) => `/journal/${slug}`),
  ];
  return [...sections, ...details].flatMap((path) => fallbackLanguages.map(({ code }) => ({
    url: `https://mikhaleff.art/${code}${path}`,
    lastModified: new Date(),
    changeFrequency: path ? "monthly" as const : "weekly" as const,
    priority: path ? 0.75 : code === "en" ? 1 : 0.9,
    alternates: { languages: Object.fromEntries(fallbackLanguages.map((language) => [language.code, `https://mikhaleff.art/${language.code}${path}`])) },
  })));
}
