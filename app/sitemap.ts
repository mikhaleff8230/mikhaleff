import type { MetadataRoute } from "next";
import { fallbackLanguages } from "@/lib/i18n/config";
import { getArtworks, getExhibitions, getJournal, getSeries } from "@/lib/content/repository";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [artworks, collections, exhibitions, journal] = await Promise.all([
    getArtworks("en"), getSeries("en"), getExhibitions("en"), getJournal("en"),
  ]);
  const sections = ["", "/works", "/collections", "/exhibitions", "/about", "/journal", "/contact"];
  const details = [
    ...artworks.map(({ slug }) => `/works/${slug}`),
    ...collections.map(({ slug }) => `/collections/${slug}`),
    ...exhibitions.map(({ slug }) => `/exhibitions/${slug}`),
    ...journal.map(({ slug }) => `/journal/${slug}`),
  ];
  return [...sections, ...details].flatMap((path) => fallbackLanguages.map(({ code }) => ({
    url: `https://mikhaleff.art/${code}${path}`,
    lastModified: new Date(),
    changeFrequency: path ? "monthly" as const : "weekly" as const,
    priority: path ? 0.75 : code === "en" ? 1 : 0.9,
    alternates: { languages: Object.fromEntries(fallbackLanguages.map((language) => [language.code, `https://mikhaleff.art/${language.code}${path}`])) },
  })));
}