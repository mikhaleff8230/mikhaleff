import Image from "next/image";
import type { HomepageContent } from "@/types/content";

export function Statement({ locale, content, image }: {
  locale: string; content: HomepageContent["statement"]; image: HomepageContent["hero"]["image"];
}) {
  return (
    <section id="statement" className="statement" aria-label="Artist statement">
      <div className="statement__image-wrap">
        <Image src={image.src} alt={image.alt} fill sizes="(max-width: 767px) 100vw, 58vw"
          className="statement__image" />
      </div>
      <div className="statement__copy">
        <p className="eyebrow">{content.eyebrow}</p>
        <blockquote>{content.quote}</blockquote>
        <a className="text-link" href={`/${locale}/about`}>{content.linkLabel}<span aria-hidden="true">→</span></a>
      </div>
    </section>
  );
}
