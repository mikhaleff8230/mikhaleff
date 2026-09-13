import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { getArtworks, getExhibitions } from "@/lib/content/repository";
import { isSupportedLocale } from "@/lib/i18n/config";
import { getInterfaceCopy } from "@/lib/i18n/copy";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const exhibition = (await getExhibitions(locale)).find((item) => item.slug === slug);
  return exhibition ? buildLocalizedMetadata({ locale, path: `/exhibitions/${slug}`, title: exhibition.seoTitle || exhibition.title, description: exhibition.seoDescription || exhibition.introduction, image: exhibition.seoImageSrc || exhibition.image.src }) : {};
}

export default async function ExhibitionDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const labels = getInterfaceCopy(locale).exhibition;
  const [exhibitions, artworks] = await Promise.all([getExhibitions(locale), getArtworks(locale)]);
  const exhibition = exhibitions.find((item) => item.slug === slug);
  if (!exhibition) notFound();
  const works = exhibition.artworkSlugs.map((artworkSlug) => artworks.find((artwork) => artwork.slug === artworkSlug)).filter(Boolean);
  const next = exhibitions[(exhibitions.findIndex((item) => item.slug === slug) + 1) % exhibitions.length];
  const jsonLd = { "@context": "https://schema.org", "@type": "ExhibitionEvent", name: exhibition.title, startDate: exhibition.dates, location: { "@type": "Place", name: exhibition.venue, address: `${exhibition.city}, ${exhibition.country}` }, description: exhibition.introduction };

  return (
    <main className="exhibition-detail">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader locale={locale} />
      <section className="exhibition-detail__hero">
        <div className="exhibition-detail__media"><Image src={exhibition.image.src} alt={exhibition.image.alt} fill priority sizes="100vw" style={{ objectPosition: exhibition.image.position }} /></div>
        <div className="exhibition-detail__title"><Link className="text-link" href={`/${locale}/exhibitions`}>← {labels.back}</Link><p className="eyebrow">{exhibition.format} · {exhibition.year}</p><h1>{exhibition.title}</h1></div>
      </section>
      <section className="exhibition-detail__info">
        <dl><div><dt>{labels.dates}</dt><dd>{exhibition.dates}</dd></div><div><dt>{labels.venue}</dt><dd>{exhibition.venue}</dd></div><div><dt>{labels.location}</dt><dd>{exhibition.city}, {exhibition.country}</dd></div></dl>
        <div><p className="lead-copy">{exhibition.introduction}</p><p>{exhibition.description}</p></div>
      </section>
      <div className="exhibition-installation"><Image src={exhibition.image.src} alt={`${exhibition.title} installation view`} fill sizes="100vw" style={{ objectPosition: exhibition.image.position }} /></div>
      <section className="exhibition-works"><p className="eyebrow">/ {labels.works}</p><div>{works.map((artwork) => artwork && <Link href={`/${locale}/works/${artwork.slug}`} key={artwork.slug}><span><Image src={artwork.image.src} alt={artwork.image.alt} fill sizes="32vw" style={{ objectPosition: artwork.image.position }} /></span><strong>{artwork.title}</strong><small>{artwork.year}</small></Link>)}</div></section>
      <Link className="next-work" href={`/${locale}/exhibitions/${next.slug}`}><span className="eyebrow">{labels.next}</span><strong>{next.title}</strong><span>→</span></Link>
      <SiteFooter locale={locale} />
    </main>
  );
}
