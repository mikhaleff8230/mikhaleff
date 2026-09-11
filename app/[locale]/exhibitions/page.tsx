import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExhibitionsIndex } from "@/components/editorial/exhibitions-index";
import { PageIntro } from "@/components/editorial/page-intro";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { getExhibitions } from "@/lib/content/repository";
import { isSupportedLocale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildLocalizedMetadata({ locale, path: "/exhibitions", title: "Exhibitions", description: "Selected solo and group exhibitions of Alexander Mikhaleff." });
}

export default async function ExhibitionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const exhibitions = await getExhibitions(locale);
  return (
    <main className="editorial-page">
      <SiteHeader locale={locale} />
      <PageIntro eyebrow="/ Exhibitions" title="Exhibitions" subtitle={"Solo and group exhibitions.\nA continuing dialogue."} />
      <ExhibitionsIndex locale={locale} exhibitions={exhibitions} />
      <SiteFooter locale={locale} />
    </main>
  );
}
