import type { Metadata } from "next";
import { getLanguages } from "@/lib/i18n/languages";

export async function buildLocalizedMetadata({ locale, path = "", title, description, image = "/artworks/untitled-032.png" }: { locale: string; path?: string; title: string; description: string; image?: string }): Promise<Metadata> {
  const languages = await getLanguages();
  const languageLinks = Object.fromEntries(languages.map((language) => [language.code, `/${language.slugPrefix || language.code}${path}`]));
  languageLinks["x-default"] = `/en${path}`;
  return {
    title,
    description,
    alternates: { canonical: `/${locale}${path}`, languages: languageLinks },
    openGraph: { type: "website", title, description, url: `/${locale}${path}`, images: [{ url: image }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
