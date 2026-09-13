import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/forms/contact-form";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { isSupportedLocale } from "@/lib/i18n/config";
import { getInterfaceCopy } from "@/lib/i18n/copy";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";
import { getArtworks, getContactPage, getSiteSettings } from "@/lib/content/repository";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const content = await getContactPage(locale);
  return buildLocalizedMetadata({ locale, path: "/contact", title: content.seoTitle || content.heading, description: content.seoDescription || content.introduction, image: content.seoImageSrc || content.image.src });
}

export default async function ContactPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ artwork?: string }> }) {
  const { locale } = await params; const { artwork: artworkSlug } = await searchParams;
  if (!isSupportedLocale(locale)) notFound();
  const labels = getInterfaceCopy(locale);
  const [settings, content, artworks] = await Promise.all([getSiteSettings(locale), getContactPage(locale), artworkSlug ? getArtworks(locale) : Promise.resolve([])]);
  const selectedArtwork = artworkSlug ? artworks.find((item) => item.slug === artworkSlug) : undefined;
  return <main className="editorial-page contact-page" id="top">
    <SiteHeader locale={locale} />
    <section className="contact-layout">
      <div className="contact-layout__art"><Image src={content.image.src} alt={content.image.alt} fill priority sizes="50vw" style={{ objectFit: "contain" }} /><div><p className="eyebrow">{content.eyebrow}</p><h1>{content.displayTitle.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</h1></div></div>
      <div className="contact-layout__form"><ContactForm locale={locale} heading={content.heading} artwork={selectedArtwork ? { slug: selectedArtwork.slug, title: selectedArtwork.title } : undefined} /><p className="contact-layout__intro">{content.introduction}</p><aside><div><span>{labels.form.email}</span><a href={`mailto:${settings.email}`}>{settings.email}</a></div><div><span>Instagram</span><a href={settings.instagram} rel="noreferrer">Instagram</a></div><div><span>{labels.exhibition.location}</span><p>{settings.location}</p></div></aside></div>
    </section>
    <SiteFooter locale={locale} />
  </main>;
}