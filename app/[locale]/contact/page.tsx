import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/forms/contact-form";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { isSupportedLocale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";
import { getSiteSettings } from "@/lib/content/repository";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; return buildLocalizedMetadata({ locale, path: "/contact", title: "Contact", description: "Artwork, exhibition, press and collaboration inquiries for Alexander Mikhaleff." }); }

export default async function ContactPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ artwork?: string }> }) {
  const { locale } = await params;
  const { artwork } = await searchParams;
  if (!isSupportedLocale(locale)) notFound();
  const settings = await getSiteSettings(locale);
  return (
    <main className="editorial-page contact-page">
      <SiteHeader locale={locale} />
      <section className="contact-layout">
        <div className="contact-layout__art"><Image src="/artworks/untitled-032.png" alt="Abstract painting fragment" fill priority sizes="50vw" /><div><p className="eyebrow">/ Contact</p><h1>Art<br />Beyond<br />Form</h1></div></div>
        <div className="contact-layout__form"><ContactForm artwork={artwork ? { slug: artwork, title: artwork.replaceAll("-", " ").toUpperCase() } : undefined} /><aside><div><span>Email</span><a href={`mailto:${settings.email}`}>{settings.email}</a></div><div><span>Instagram</span><a href={settings.instagram} rel="noreferrer">@mikhaleff</a></div><div><span>Location</span><p>{settings.location}</p></div></aside></div>
      </section>
      <SiteFooter locale={locale} />
    </main>
  );
}
