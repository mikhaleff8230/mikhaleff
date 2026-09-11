"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ExhibitionEntry } from "@/types/content";
import { getInterfaceCopy } from "@/lib/i18n/copy";

export function ExhibitionsIndex({ locale, exhibitions }: { locale: string; exhibitions: readonly ExhibitionEntry[] }) {
  const [active, setActive] = useState(exhibitions[0]);
  const labels = getInterfaceCopy(locale);

  return (
    <section className="exhibitions-index">
      <div className="exhibitions-index__list">
        {exhibitions.map((item, index) => (
          <Link href={`/${locale}/exhibitions/${item.slug}`} key={item.slug} onMouseEnter={() => setActive(item)} onFocus={() => setActive(item)}>
            <span>0{index + 1}</span><time>{item.year}</time><strong>{item.title}</strong><small>{item.city}, {item.country}</small><i>{labels.viewExhibition} →</i>
          </Link>
        ))}
      </div>
      <div className="exhibitions-index__preview" aria-live="polite">
        <Image key={active.slug} src={active.image.src} alt={active.image.alt} fill sizes="48vw" style={{ objectPosition: active.image.position }} />
        <p>{active.format}<br />{active.venue}</p>
      </div>
    </section>
  );
}
