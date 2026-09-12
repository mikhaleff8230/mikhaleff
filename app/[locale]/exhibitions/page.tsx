import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExhibitionsIndex } from "@/components/editorial/exhibitions-index";
import { PageIntro } from "@/components/editorial/page-intro";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { getArchivePage, getExhibitions } from "@/lib/content/repository";
import { isSupportedLocale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const page = await getArchivePage(locale, "exhibitions");
  return buildLocalizedMetadata({ locale, path: "/exhibitions", title: page.seoTitle || page.title, description: page.seoDescription || page.subtitle, image: page.seoImageSrc });
}

export default async function ExhibitionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const [exhibitions, page] = await Promise.all([getExhibitions(locale), getArchivePage(locale, "exhibitions")]);
  return (
    <main className="editorial-page">
      <SiteHeader locale={locale} />
      <PageIntro eyebrow={page.eyebrow} title={page.title} subtitle={page.subtitle} />
      <ExhibitionsIndex locale={locale} exhibitions={exhibitions} />
      <SiteFooter locale={locale} />
    </main>
  );
}
