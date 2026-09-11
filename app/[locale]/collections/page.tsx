import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionsIndex } from "@/components/editorial/collections-index";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { getSeries } from "@/lib/content/repository";
import { getInterfaceCopy } from "@/lib/i18n/copy";
import { isSupportedLocale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildLocalizedMetadata({ locale, path: "/collections", title: "Collections", description: "Painting collections by contemporary artist Alexander Mikhaleff." });
}

export default async function CollectionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const collections = await getSeries(locale);
  const labels = getInterfaceCopy(locale);

  return (
    <main className="editorial-page collections-page">
      <SiteHeader locale={locale} />
      <header className="collections-hero">
        <div><p className="eyebrow">/ {labels.collections}</p><h1>{labels.collections}</h1></div>
        <p className="collections-hero__statement">Different states.<br />One continuous exploration.</p>
        <p className="collections-hero__note">Each collection is a chapter in an ongoing search — a reflection of inner landscapes, material experiments and evolving states of perception.</p>
      </header>
      <CollectionsIndex locale={locale} collections={collections} />
      <SiteFooter locale={locale} />
    </main>
  );
}
