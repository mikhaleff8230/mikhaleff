import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionsIndex } from "@/components/editorial/collections-index";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { getArchivePage, getSeries } from "@/lib/content/repository";
import { isSupportedLocale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const page = await getArchivePage(locale, "collections");
  return buildLocalizedMetadata({ locale, path: "/collections", title: page.seoTitle || page.title, description: page.seoDescription || page.note || page.subtitle, image: page.seoImageSrc });
}

export default async function CollectionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const [collections, page] = await Promise.all([getSeries(locale), getArchivePage(locale, "collections")]);

  return (
    <main className="editorial-page collections-page">
      <SiteHeader locale={locale} />
      <header className="collections-hero">
        <div><p className="eyebrow">{page.eyebrow}</p><h1>{page.title}</h1></div>
        <p className="collections-hero__statement">{page.subtitle}</p>
        <p className="collections-hero__note">{page.note}</p>
      </header>
      <CollectionsIndex locale={locale} collections={collections} />
      <SiteFooter locale={locale} />
    </main>
  );
}
