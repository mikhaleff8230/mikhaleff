import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/editorial/page-intro";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { getJournal } from "@/lib/content/repository";
import { getInterfaceCopy } from "@/lib/i18n/copy";
import { isSupportedLocale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; return buildLocalizedMetadata({ locale, path: "/journal", title: "Journal", description: "Studio notes, essays and conversations from Alexander Mikhaleff." }); }

export default async function JournalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const labels = getInterfaceCopy(locale);
  const journal = await getJournal(locale);
  return (
    <main className="editorial-page">
      <SiteHeader locale={locale} />
      <PageIntro eyebrow="/ Journal" title="Journal" subtitle={"Studio notes, conversations\nand fragments of process."} />
      <section className="journal-index">
        {journal.map((entry, index) => (
          <article className="journal-card" data-featured={index === 0} key={entry.slug}>
            <Link className="journal-card__image" href={`/${locale}/journal/${entry.slug}`}><Image src={entry.image.src} alt={entry.image.alt} fill sizes={index === 0 ? "70vw" : "44vw"} style={{ objectPosition: entry.image.position }} /></Link>
            <div className="journal-card__copy"><p className="eyebrow">{entry.category} · {entry.date}</p><h2><Link href={`/${locale}/journal/${entry.slug}`}>{entry.title}</Link></h2><p>{entry.excerpt}</p><Link className="text-link" href={`/${locale}/journal/${entry.slug}`}>{labels.readArticle} <span>→</span></Link></div>
          </article>
        ))}
      </section>
      <SiteFooter locale={locale} />
    </main>
  );
}
