import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { WorksArchive } from "@/components/artwork/works-archive";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { getArchivePage, getArtworks } from "@/lib/content/repository";
import { isSupportedLocale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; const page = await getArchivePage(locale, "works"); return buildLocalizedMetadata({ locale, path: "/works", title: page.seoTitle || page.title, description: page.seoDescription || page.note || page.subtitle, image: page.seoImageSrc || page.image?.src }); }

export default async function WorksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const [artworks, page] = await Promise.all([getArtworks(locale), getArchivePage(locale, "works")]);
  return (
    <main className="archive-page">
      <SiteHeader locale={locale} />
      <header className="archive-hero">
        <div className="archive-hero__art">{page.image && <Image src={page.image.src} alt={page.image.alt} fill priority sizes="70vw" style={{ objectPosition: page.image.position }} />}</div>
        <div className="archive-hero__veil" />
        <div className="archive-hero__title"><p className="eyebrow">{page.eyebrow}</p><h1>{page.title}</h1><p>{page.subtitle}</p></div>
        <div className="archive-hero__aside"><p>{page.note}</p><a className="text-link" href="#works-archive">{page.ctaLabel} <span>→</span></a></div>
      </header>
      <div id="works-archive"><WorksArchive locale={locale} artworks={artworks} /></div>
      <SiteFooter locale={locale} />
    </main>
  );
}
