import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { fallbackJournal } from "@/lib/content/fallback-editorial";
import { getJournal } from "@/lib/content/repository";
import { isSupportedLocale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() { return fallbackJournal.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const entry = (await getJournal(locale)).find((item) => item.slug === slug);
  return entry ? buildLocalizedMetadata({ locale, path: `/journal/${slug}`, title: entry.title, description: entry.excerpt, image: entry.image.src }) : {};
}

export default async function JournalDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const journal = await getJournal(locale);
  const entry = journal.find((item) => item.slug === slug);
  if (!entry) notFound();
  const next = journal[(journal.findIndex((item) => item.slug === slug) + 1) % journal.length];
  const jsonLd = { "@context": "https://schema.org", "@type": "Article", headline: entry.title, datePublished: entry.date, author: { "@type": "Person", name: "Alexander Mikhaleff" }, description: entry.excerpt };
  return (
    <main className="journal-detail">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader locale={locale} />
      <header className="journal-detail__header"><Link className="text-link" href={`/${locale}/journal`}>← Journal</Link><p className="eyebrow">{entry.category} · {entry.date}</p><h1>{entry.title}</h1><p>{entry.excerpt}</p></header>
      <div className="journal-detail__hero"><Image src={entry.image.src} alt={entry.image.alt} fill priority sizes="100vw" style={{ objectPosition: entry.image.position }} /></div>
      <article className="journal-prose">{entry.body.map((paragraph, index) => index === 0 ? <p className="journal-prose__lead" key={paragraph}>{paragraph}</p> : <p key={paragraph}>{paragraph}</p>)}</article>
      <Link className="next-work" href={`/${locale}/journal/${next.slug}`}><span className="eyebrow">Next journal entry</span><strong>{next.title}</strong><span>→</span></Link>
      <SiteFooter locale={locale} />
    </main>
  );
}
