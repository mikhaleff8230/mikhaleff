"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { SeriesEntry } from "@/types/content";
import { getInterfaceCopy } from "@/lib/i18n/copy";

export function CollectionsIndex({ locale, collections }: { locale: string; collections: readonly SeriesEntry[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const labels = getInterfaceCopy(locale);

  const show = (index: number) => {
    setActiveIndex(index);
    const rail = railRef.current;
    const card = cardRefs.current[index];
    if (!rail || !card) return;
    rail.scrollTo({ left: card.offsetLeft - rail.offsetLeft, behavior: "smooth" });
  };

  const updateActiveCard = () => {
    const rail = railRef.current;
    if (!rail) return;
    const index = cardRefs.current.reduce((closest, card, cardIndex) => {
      if (!card) return closest;
      const current = cardRefs.current[closest];
      return !current || Math.abs(card.offsetLeft - rail.scrollLeft) < Math.abs(current.offsetLeft - rail.scrollLeft) ? cardIndex : closest;
    }, 0);
    setActiveIndex(index);
  };

  return (
    <section className="collection-banners" aria-label={labels.collections}>
      <div className="collection-banners__rail" ref={railRef} onScroll={updateActiveCard}>
        {collections.map((item, index) => (
          <Link href={`/${locale}/collections/${item.slug}`} ref={(node) => { cardRefs.current[index] = node; }} key={item.slug}>
            <span className="collection-banner__image"><Image src={item.cover.src} alt={item.cover.alt} fill sizes="(max-width: 767px) 82vw, 24vw" style={{ objectPosition: item.cover.position }} /></span>
            <strong>{item.title}</strong>
            <small>{item.years}</small>
            <span className="collection-banner__link">{labels.viewCollection} <b>→</b></span>
          </Link>
        ))}
      </div>
      <nav className="collection-banners__pagination" aria-label={`${labels.collections} pagination`}>
        {collections.map((item, index) => <button className={index === activeIndex ? "is-active" : undefined} type="button" aria-label={`Show ${item.title}`} aria-current={index === activeIndex ? "true" : undefined} onClick={() => show(index)} key={item.slug}>{String(index + 1).padStart(2, "0")}</button>)}
      </nav>
    </section>
  );
}
