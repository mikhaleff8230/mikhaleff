import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArtworkDetailExperience } from "@/components/artwork/artwork-detail-experience";
import { ArtworkDetailImage, ArtworkGalleryProvider } from "@/components/artwork/artwork-gallery";
import { ArtworkOpeningGallery } from "@/components/artwork/artwork-opening-gallery";
import { ArtworkVideoBlock } from "@/components/artwork/artwork-video";
import { BackToExhibition } from "@/components/artwork/back-to-exhibition";
import { ViewInSpaceSection } from "@/components/artwork/view-in-space-section";
import { InquiryDialog } from "@/components/forms/inquiry-dialog";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { getArtworks, getInteriorScenes } from "@/lib/content/repository";
import { isSupportedLocale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const artwork = (await getArtworks(locale)).find((item) => item.slug === slug);
  return artwork ? buildLocalizedMetadata({ locale, path: `/works/${slug}`, title: artwork.title, description: `${artwork.title}, ${artwork.year}. ${artwork.medium}, ${artwork.dimensions}.`, image: (artwork.primaryImage ?? artwork.image).src }) : {};
}

export default async function ArtworkPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const [artworks, interiorScenes] = await Promise.all([getArtworks(locale), getInteriorScenes(locale)]);
  const artwork = artworks.find((item) => item.slug === slug);
  if (!artwork) notFound();

  const currentIndex = artworks.findIndex((item) => item.slug === slug);
  const previous = artworks[(currentIndex - 1 + artworks.length) % artworks.length];
  const next = artworks[(currentIndex + 1) % artworks.length];
  const primaryImage = artwork.primaryImage ?? artwork.image;
  const galleryImages = [primaryImage, ...(artwork.detailImages ?? []), ...(artwork.textureImages ?? [])].filter((image, index, images) => images.findIndex((candidate) => `${candidate.src}|${candidate.position ?? ""}|${candidate.alt}` === `${image.src}|${image.position ?? ""}|${image.alt}`) === index);
  const detailPreviews = galleryImages.slice(1);
  const spacePreview = artwork.interiorImages?.[0] ?? artwork.exhibition?.image ?? interiorScenes[0]?.image;
  const viewInSpaceAvailable = artwork.viewInSpaceEnabled !== false && interiorScenes.length > 0;
  const related = (artwork.relatedArtworkSlugs ?? [])
    .map((relatedSlug) => artworks.find((item) => item.slug === relatedSlug))
    .filter((item): item is (typeof artworks)[number] => Boolean(item))
    .slice(0, 5);
  const sectionLinks = ["#artwork", "#about-work", ...(detailPreviews.length ? ["#details"] : []), ...(artwork.video ? ["#film"] : []), ...(viewInSpaceAvailable ? ["#view-in-space"] : []), ...(related.length ? ["#related-works"] : [])]
    .map((href, index) => ({ href, label: String(index + 1).padStart(2, "0") }));
  const displayedPrice = artwork.showPrice && typeof artwork.price === "number"
    ? `${new Intl.NumberFormat(locale === "ru" ? "ru-RU" : locale === "zh" ? "zh-CN" : "en-US").format(artwork.price)} ${artwork.currency || "USD"}`
    : null;
  const priceLabel = locale === "ru" ? "Цена" : locale === "zh" ? "价格" : "Price";
  const jsonLdImage = primaryImage.src.startsWith("http") ? primaryImage.src : `https://mikhaleff.art${primaryImage.src}`;
  const jsonLd = { "@context": "https://schema.org", "@type": "VisualArtwork", name: artwork.title, dateCreated: artwork.year, artMedium: artwork.medium, width: artwork.dimensions, creator: { "@type": "Person", name: "Alexander Mikhaleff" }, image: jsonLdImage };

  return (
    <main className="artwork-page" id="top">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader locale={locale} />
      <ArtworkGalleryProvider artwork={artwork} images={galleryImages}>
        <ArtworkDetailExperience>
        <section className="artwork-detail-opening" id="artwork" aria-labelledby="artwork-title" data-scroll-scene="gallery">
          <div className="artwork-detail__back"><BackToExhibition locale={locale} /></div>
          <ArtworkOpeningGallery exhibitionImage={spacePreview} sectionLinks={sectionLinks}>
            <p className="eyebrow">{artwork.year}</p>
            <h1 id="artwork-title">{artwork.title}</h1>
            <dl>
              <div><dt>Medium</dt><dd>{artwork.medium}</dd></div>
              <div><dt>Dimensions</dt><dd>{artwork.dimensions}</dd></div>
              <div><dt>Status</dt><dd>{artwork.status}</dd></div>
              {displayedPrice && <div><dt>{priceLabel}</dt><dd>{displayedPrice}</dd></div>}
            </dl>
            <InquiryDialog artwork={{ slug: artwork.slug, title: artwork.title }} />
            <Link className="collection-link" href={`/${locale}/contact`}>Add to collection <span>＋</span></Link>
            {artwork.artistComment && <div className="artwork-comment"><p>“{artwork.artistComment}”</p><a href="#about-work">Read more <span>→</span></a></div>}
          </ArtworkOpeningGallery>
        </section>

        <section className="artwork-about" id="about-work" data-scroll-scene="about">
          <div className="artwork-section-label"><span>About this work</span></div>
          <p className="artwork-about__copy">{artwork.description}</p>
          <dl className="artwork-about__facts">
            <div><dt>Year</dt><dd>{artwork.year}</dd></div>
            <div><dt>Medium</dt><dd>{artwork.medium}</dd></div>
            <div><dt>Dimensions</dt><dd>{artwork.dimensions}</dd></div>
            <div><dt>Collection</dt><dd>{artwork.series}</dd></div>
            <div><dt>Status</dt><dd>{artwork.status}</dd></div>
          </dl>
        </section>

        {detailPreviews.length > 0 && <section className="artwork-details" id="details" data-scroll-scene="details">
          <div className="artwork-section-label"><span>Details</span></div>
          <div className="artwork-details__grid">
            {detailPreviews.map((detail, index) => <figure key={`${detail.src}-large-${index}`}><ArtworkDetailImage index={index + 1} /><figcaption>Detail {String(index + 1).padStart(2, "0")} <b>↗</b></figcaption></figure>)}
          </div>
        </section>}

        {artwork.video && <section className="artwork-video-section" id="film" data-scroll-scene="film"><ArtworkVideoBlock video={artwork.video} /></section>}

        {viewInSpaceAvailable && <ViewInSpaceSection artwork={artwork} scenes={interiorScenes} />}

        {related.length > 0 && <section className="artwork-related" id="related-works" data-scroll-scene="related">
          <div className="artwork-section-label"><span>Related works</span></div>
          <div className="artwork-related__grid">
            {related.map((item) => <Link href={`/${locale}/works/${item.slug}`} key={item.slug}><span><Image src={item.image.src} alt={item.image.alt} fill sizes="20vw" style={{ objectPosition: item.image.position }} /></span><strong>{item.title}</strong><small>{item.year}</small></Link>)}
          </div>
          <nav className="artwork-related__nav" aria-label="Previous and next artworks"><Link href={`/${locale}/works/${previous.slug}`} aria-label={`Previous artwork: ${previous.title}`}>←</Link><Link href={`/${locale}/works/${next.slug}`} aria-label={`Next artwork: ${next.title}`}>→</Link></nav>
        </section>}
        </ArtworkDetailExperience>
      </ArtworkGalleryProvider>
      <SiteFooter locale={locale} />
    </main>
  );
}
