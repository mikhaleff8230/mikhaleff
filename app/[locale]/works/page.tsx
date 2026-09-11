import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { WorksArchive } from "@/components/artwork/works-archive";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { getArtworks } from "@/lib/content/repository";
import { isSupportedLocale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; return buildLocalizedMetadata({ locale, path: "/works", title: "Works", description: "Painting archive by contemporary artist Alexander Mikhaleff. Explore in Exhibition, Grid or List view." }); }

export default async function WorksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const artworks = await getArtworks(locale);
  return (
    <main className="archive-page">
      <SiteHeader locale={locale} />
      <header className="archive-hero">
        <div className="archive-hero__art"><Image src="/artworks/untitled-032.png" alt="Abstract painting fragment" fill priority sizes="70vw" style={{ objectPosition: "56% 50%" }} /></div>
        <div className="archive-hero__veil" />
        <div className="archive-hero__title"><p className="eyebrow">/ Works</p><h1>Paintings</h1><p>Fragments<br />of a larger<br />consciousness</p></div>
        <div className="archive-hero__aside"><p>Each painting is a trace of a state — a moment between structure and freedom, form and formlessness.</p><a className="text-link" href="#works-archive">Explore the works <span>→</span></a></div>
      </header>
      <div id="works-archive"><WorksArchive locale={locale} artworks={artworks} /></div>
      <SiteFooter locale={locale} />
    </main>
  );
}
