import Image from "next/image";
import Link from "next/link";
import type { HomepageContent } from "@/types/content";
import { getInterfaceCopy } from "@/lib/i18n/copy";

export function FeaturedSeries({ locale, content }: { locale: string; content: HomepageContent["featuredSeries"] }) {
  const labels = getInterfaceCopy(locale);
  return (
    <section className="featured-series">
      <Image src={content.image.src} alt={content.image.alt} fill sizes="100vw" className="featured-series__image"
        style={{ objectPosition: content.image.position }} />
      <div className="featured-series__veil" />
      <div className="featured-series__copy">
        <p className="eyebrow">{labels.featuredCollection}</p>
        <h2>{content.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h2>
        <p className="series-years">{content.years}</p>
        <p className="series-description">{content.description}</p>
        <Link className="text-link" href={`/${locale}/collections/${content.slug}`}>{labels.exploreCollection}<span aria-hidden="true">→</span></Link>
      </div>
    </section>
  );
}
