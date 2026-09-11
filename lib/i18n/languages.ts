import { fallbackLanguages } from "@/lib/i18n/config";
import { sanityClient, sanityConfigured } from "@/lib/sanity/client";
import { languagesQuery } from "@/lib/sanity/queries";

export type PublicLanguage = { code: string; nativeName: string; locale: string; slugPrefix: string; default: boolean };

export async function getLanguages(): Promise<readonly PublicLanguage[]> {
  if (!sanityConfigured) return fallbackLanguages.map((item) => ({ ...item, slugPrefix: item.code }));
  try {
    const languages = await sanityClient.fetch<PublicLanguage[]>(languagesQuery, {}, { next: { revalidate: 3600 } });
    return languages.length ? languages : fallbackLanguages.map((item) => ({ ...item, slugPrefix: item.code }));
  } catch { return fallbackLanguages.map((item) => ({ ...item, slugPrefix: item.code })); }
}
