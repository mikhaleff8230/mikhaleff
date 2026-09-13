import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Homepage } from "@/components/home/homepage";
import { getHomepage } from "@/lib/content/repository";
import { fallbackLanguages, isSupportedLocale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return fallbackLanguages.map(({ code }) => ({ locale: code }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const content = await getHomepage(locale);
  return buildLocalizedMetadata({ locale, title: content.seoTitle || content.hero.title.join(" "), description: content.seoDescription || content.hero.subtitle, image: content.seoImageSrc || content.hero.image.src });
}

export default async function LocalizedHomepage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const content = await getHomepage(locale);
  return <Homepage locale={locale} content={content} />;
}
