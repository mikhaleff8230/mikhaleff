import Link from "next/link";
import type { HomepageContent } from "@/types/content";

export function ContactBand({ locale, content }: { locale: string; content: HomepageContent["contact"] }) {
  return (
    <section className="contact-band">
      <h2>{content.title.map((line) => <span key={line}>{line}</span>)}</h2>
      <div className="contact-band__copy">
        <h3>{content.heading}</h3>
        <p className="eyebrow">{content.eyebrow}</p>
        <Link className="text-link" href={`/${locale}/contact`}>{content.linkLabel}<span aria-hidden="true">→</span></Link>
      </div>
    </section>
  );
}
