import Image from "next/image";
import Link from "next/link";
import type { HomepageContent } from "@/types/content";

export function SelectedWorks({ locale, content }: { locale: string; content: HomepageContent["selectedWorks"] }) {
  return (
    <section className="selected-works section-paper" aria-labelledby="selected-works-title">
      <div className="section-heading">
        <h2 id="selected-works-title" className="eyebrow">{content.eyebrow}</h2>
        <Link className="text-link" href={`/${locale}/works`}>{content.linkLabel}<span aria-hidden="true">→</span></Link>
      </div>
      <div className="works-row">
        {content.items.map((artwork, index) => (
          <Link className="work-card" data-shape={index % 3} key={artwork.slug} href={`/${locale}/works/${artwork.slug}`}>
            <span className="work-card__image">
              <Image src={artwork.image.src} alt={artwork.image.alt} fill sizes="(max-width: 767px) 76vw, 20vw"
                style={{ objectPosition: artwork.image.position }} />
              <span className="work-card__view">View</span>
            </span>
            <span className="work-card__caption"><strong>{artwork.title}</strong><small>{artwork.year}</small></span>
          </Link>
        ))}
      </div>
      <p className="selected-works__note">Painting is a way<br />to be closer to the real.</p>
    </section>
  );
}
