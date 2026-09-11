import Image from "next/image";
import Link from "next/link";
import type { HomepageContent } from "@/types/content";

export function Exhibitions({ locale, content }: { locale: string; content: HomepageContent["exhibitions"] }) {
  return (
    <section className="exhibitions" aria-labelledby="exhibitions-title">
      <div className="exhibitions__heading">
        <p className="eyebrow">{content.eyebrow}</p>
        <h2 id="exhibitions-title">{content.title}</h2>
      </div>
      <ol className="exhibition-list">
        {content.items.map((item) => (
          <li key={`${item.year}-${item.title}`}>
            <span>{item.year}</span><strong>{item.title}</strong><small>{item.location}</small>
          </li>
        ))}
      </ol>
      <div className="exhibitions__image">
        <Image src={content.image.src} alt={content.image.alt} fill sizes="(max-width: 767px) 100vw, 38vw"
          style={{ objectPosition: content.image.position }} />
      </div>
      <div className="exhibitions__aside">
        <p>{content.note}</p>
        <Link className="text-link" href={`/${locale}/exhibitions`}>{content.linkLabel}<span aria-hidden="true">→</span></Link>
      </div>
    </section>
  );
}
