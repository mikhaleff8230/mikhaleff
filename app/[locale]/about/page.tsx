import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { getAbout } from "@/lib/content/repository";
import { isSupportedLocale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; return buildLocalizedMetadata({ locale, path: "/about", title: "About the Artist", description: "Biography, artistic statement, selected CV and press for Alexander Mikhaleff.", image: "/studio/alexander-mikhaleff-studio.png" }); }

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const aboutContent = await getAbout(locale);
  const personJsonLd = { "@context": "https://schema.org", "@type": "Person", name: "Alexander Mikhaleff", jobTitle: "Contemporary artist", url: `https://mikhaleff.art/${locale}/about` };
  return (
    <main className="editorial-page about-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <SiteHeader locale={locale} />
      <section className="about-landing">
        <Image src={aboutContent.portrait.src} alt={aboutContent.portrait.alt} fill priority sizes="100vw" />
        <div className="about-landing__veil" />
        <div className="about-landing__content">
          <div className="about-landing__title"><p className="eyebrow">/ About</p><h1>About<br />the Artist</h1><nav aria-label="About introduction"><a href="#biography">Biography</a><a href="#statement">Artistic statement</a><a href="#studio">Studio</a><a href="#cv">CV</a><a href="#press">Press</a><Link href={`/${locale}/contact`}>Contact</Link></nav></div>
          <div className="about-landing__copy"><blockquote>“{aboutContent.quote}”</blockquote><p>My work is a continuous exploration of the space between the visible and the invisible. Through abstraction I seek to express states, emotions and structures that exist beyond rational perception.</p><a className="text-link" href="#biography">Read full biography <span>→</span></a></div>
          <a className="about-landing__scroll" href="#biography"><span /><small>Scroll</small></a>
        </div>
      </section>
      <div className="about-layout">
        <div className="about-chapters">
          <section id="biography" className="about-chapter about-chapter--portrait">
            <div className="about-chapter__image"><Image src={aboutContent.portrait.src} alt={aboutContent.portrait.alt} fill sizes="(max-width: 767px) 100vw, 52vw" /></div>
            <div><p className="eyebrow">01 / Biography</p>{aboutContent.biography.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          </section>
          <section id="statement" className="about-chapter about-chapter--text"><p className="eyebrow">02 / Artistic statement</p><blockquote>{aboutContent.quote}</blockquote>{aboutContent.statement.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>
          <section id="studio" className="about-chapter about-chapter--studio"><div><p className="eyebrow">03 / Studio</p><h2>Between matter<br />and memory</h2><p>The studio is treated as a field of attention: a place where gesture, accident and revision are allowed to remain visible.</p></div><div className="about-chapter__wide"><Image src={aboutContent.studio.src} alt={aboutContent.studio.alt} fill sizes="100vw" style={{ objectPosition: "50% 50%" }} /></div></section>
          <section id="cv" className="about-chapter about-chapter--archive"><p className="eyebrow">04 / Selected CV</p><ol>{aboutContent.cv.map(([year, event]) => <li key={event}><time>{year}</time><span>{event}</span></li>)}</ol></section>
          <section id="press" className="about-chapter about-chapter--archive"><p className="eyebrow">05 / Selected press</p><ol>{aboutContent.press.map(([publication, title, year]) => <li key={title}><time>{year}</time><span><strong>{publication}</strong>{title}</span></li>)}</ol></section>
        </div>
      </div>
      <SiteFooter locale={locale} />
    </main>
  );
}
