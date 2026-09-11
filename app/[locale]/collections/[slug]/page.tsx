import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionWorks } from "@/components/editorial/collection-works";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { fallbackSeries } from "@/lib/content/fallback-editorial";
import { getArtworks, getSeries } from "@/lib/content/repository";
import { getInterfaceCopy } from "@/lib/i18n/copy";
import { isSupportedLocale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() { return fallbackSeries.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const collection = (await getSeries(locale)).find((item) => item.slug === slug);
  return collection ? buildLocalizedMetadata({ locale, path: `/collections/${slug}`, title: collection.title, description: collection.description, image: collection.cover.src }) : {};
}

export default async function CollectionDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const [collections, artworks] = await Promise.all([getSeries(locale), getArtworks(locale)]);
  const collection = collections.find((item) => item.slug === slug);
  if (!collection) notFound();
  const works = collection.artworkSlugs.map((artworkSlug) => artworks.find((artwork) => artwork.slug === artworkSlug)).filter((artwork): artwork is (typeof artworks)[number] => Boolean(artwork));
  const collectionIndex = collections.findIndex((item) => item.slug === slug);
  const next = collections[(collectionIndex + 1) % collections.length];
  const labels = getInterfaceCopy(locale);

  return (
    <main className="collection-detail">
      <SiteHeader locale={locale} />
      <section className="collection-overview">
        <Link className="collection-overview__back" href={`/${locale}/collections`}>← {labels.backToCollections}</Link>
        <div className="collection-overview__copy">
          <p className="eyebrow">{String(collectionIndex + 1).padStart(2, "0")} / {String(collections.length).padStart(2, "0")}</p>
          <h1>{collection.title}</h1>
          <p className="collection-overview__dates">{collection.years}</p>
          <p className="collection-overview__lead">{collection.description}</p>
          <a className="text-link" href="#collection-works">Explore works <span>→</span></a>
        </div>
        <div className="collection-overview__media"><Image src={collection.cover.src} alt={collection.cover.alt} fill priority sizes="(max-width: 767px) 100vw, 54vw" style={{ objectPosition: collection.cover.position }} /></div>
      </section>
      <CollectionWorks locale={locale} works={works} />
      <Link className="next-collection-banner" href={`/${locale}/collections/${next.slug}`}>
        <Image src={next.cover.src} alt="" fill sizes="100vw" style={{ objectPosition: next.cover.position }} />
        <span className="next-collection-banner__veil" />
        <span className="next-collection-banner__title"><small>Next collection</small><strong>{next.title}</strong></span>
        <span className="next-collection-banner__copy"><small>{String((collectionIndex + 1) % collections.length + 1).padStart(2, "0")} / {String(collections.length).padStart(2, "0")}</small><span>{next.description}</span><b>{labels.viewCollection} →</b></span>
      </Link>
      <SiteFooter locale={locale} />
    </main>
  );
}
