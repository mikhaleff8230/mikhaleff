import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { getAbout } from "@/lib/content/repository";
import { getInterfaceCopy } from "@/lib/i18n/copy";
import { isSupportedLocale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const about = await getAbout(locale);
  return buildLocalizedMetadata({ locale, path: "/about", title: about.seoTitle || about.pageTitle.replace(/\n/g, " "), description: about.seoDescription || about.introduction, image: about.seoImageSrc || about.portrait.src });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const aboutContent = await getAbout(locale);
  const labels = getInterfaceCopy(locale).about;
  const personJsonLd = { "@context": "https://schema.org", "@type": "Person", name: aboutContent.artistName, jobTitle: "Contemporary artist", url: `https://mikhaleff.art/${locale}/about` };
  const menu = [["#biography", labels.biography], ["#statement", labels.statement], ["#studio", labels.studio], ["#cv", labels.cv], ["#press", labels.press]] as const;
  return (
    <main className="editorial-page about-page" id="top">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <SiteHeader locale={locale} />
      <section className="about-landing">
        <Image src={aboutContent.portrait.src} alt={aboutContent.portrait.alt} fill priority sizes="100vw" />
        <div className="about-landing__veil" />
        <div className="about-landing__content">
          <div className="about-landing__title"><p className="eyebrow">{aboutContent.pageEyebrow}</p><h1>{aboutContent.pageTitle.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</h1><nav aria-label={aboutContent.pageTitle.replace(/\n/g, " ")}>{menu.map(([href, label]) => <a href={href} key={href}>{label}</a>)}<Link href={`/${locale}/contact`}>{labels.contact}</Link></nav></div>
          <div className="about-landing__copy"><blockquote>“{aboutContent.quote}”</blockquote><p>{aboutContent.introduction}</p><a className="text-link" href="#biography">{aboutContent.readBiographyLabel} <span>→</span></a></div>
          <a className="about-landing__scroll" href="#biography"><span /><small>{labels.scroll}</small></a>
        </div>
      </section>
      <div className="about-layout">
        <div className="about-chapters">
          <section id="biography" className="about-chapter about-chapter--portrait">
            <div className="about-chapter__image"><Image src={aboutContent.portrait.src} alt={aboutContent.portrait.alt} fill sizes="(max-width: 767px) 100vw, 52vw" /></div>
            <div><p className="eyebrow">01 / {labels.biography}</p>{aboutContent.biography.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          </section>
          <section id="statement" className="about-chapter about-chapter--text"><p className="eyebrow">02 / {labels.statement}</p><blockquote>{aboutContent.quote}</blockquote>{aboutContent.statement.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>
          <section id="studio" className="about-chapter about-chapter--studio"><div><p className="eyebrow">03 / {labels.studio}</p><h2>{aboutContent.studioTitle.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</h2><p>{aboutContent.studioText}</p></div><div className="about-chapter__wide"><Image src={aboutContent.studio.src} alt={aboutContent.studio.alt} fill sizes="100vw" style={{ objectPosition: "50% 50%" }} /></div></section>
          <section id="cv" className="about-chapter about-chapter--archive"><p className="eyebrow">04 / {labels.selectedCv}</p><ol>{aboutContent.cvItems.map((item) => <li key={item}><span>{item}</span></li>)}</ol></section>
          <section id="press" className="about-chapter about-chapter--archive"><p className="eyebrow">05 / {labels.selectedPress}</p><ol>{aboutContent.pressItems.map((item) => <li key={item}><span>{item}</span></li>)}</ol></section>
        </div>
      </div>
      <SiteFooter locale={locale} />
    </main>
  );
}