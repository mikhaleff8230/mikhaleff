"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ArtworkCard } from "@/types/content";

export function CollectionWorks({ locale, works }: { locale: string; works: readonly ArtworkCard[] }) {
  const years = useMemo(() => [...new Set(works.map((work) => work.year))].sort((a, b) => b.localeCompare(a)), [works]);
  const [year, setYear] = useState("all");
  const [mode, setMode] = useState<"grid" | "list">("grid");
  const visible = year === "all" ? works : works.filter((work) => work.year === year);

  return <section className="collection-work-browser" id="collection-works">
    <div className="collection-work-browser__toolbar">
      <div className="collection-work-browser__filters"><button className={year === "all" ? "is-active" : undefined} type="button" onClick={() => setYear("all")}>All works ({works.length})</button>{years.map((item) => <button className={year === item ? "is-active" : undefined} type="button" onClick={() => setYear(item)} key={item}>{item} ({works.filter((work) => work.year === item).length})</button>)}</div>
      <div className="collection-work-browser__modes"><span>View as</span><button className={mode === "grid" ? "is-active" : undefined} type="button" onClick={() => setMode("grid")}>Grid</button><button className={mode === "list" ? "is-active" : undefined} type="button" onClick={() => setMode("list")}>List</button></div>
    </div>
    <div className={`collection-work-browser__items collection-work-browser__items--${mode}`}>
      {visible.map((artwork) => <Link href={`/${locale}/works/${artwork.slug}`} key={artwork.slug}><span><Image src={artwork.image.src} alt={artwork.image.alt} fill sizes={mode === "grid" ? "(max-width: 767px) 82vw, 31vw" : "7rem"} style={{ objectPosition: artwork.image.position }} /></span><strong>{artwork.title}</strong><small>{artwork.year}</small><b>→</b></Link>)}
    </div>
  </section>;
}
