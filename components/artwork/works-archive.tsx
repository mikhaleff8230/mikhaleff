"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import type { ArtworkCard } from "@/types/content";
import { trackEvent } from "@/lib/analytics/events";
import { getInterfaceCopy } from "@/lib/i18n/copy";

type ViewMode = "exhibition" | "grid" | "list";
type Placement = { top: number; left: number; width: number; depth: number };

const placements: Placement[] = [
  { top: 7, left: 10, width: 25, depth: 1 }, { top: 2, left: 60, width: 19, depth: 0.92 },
  { top: 32, left: 38, width: 28, depth: 1 }, { top: 51, left: 7, width: 18, depth: 0.9 },
  { top: 62, left: 68, width: 23, depth: 0.96 }, { top: 79, left: 34, width: 20, depth: 0.88 },
];

export function WorksArchive({ locale, artworks }: { locale: string; artworks: readonly ArtworkCard[] }) {
  const [mode, setMode] = useState<ViewMode>("exhibition");
  const labels = getInterfaceCopy(locale).works;
  const [preview, setPreview] = useState<ArtworkCard>(artworks[0]);
  const [year, setYear] = useState("all");
  const [medium, setMedium] = useState("all");
  const stageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const router = useRouter();
  const years = [...new Set(artworks.map((artwork) => artwork.year))].sort().reverse();
  const mediums = [...new Set(artworks.map((artwork) => artwork.medium))].sort();
  const filtered = artworks.filter((artwork) => (year === "all" || artwork.year === year) && (medium === "all" || artwork.medium === medium));
  const exhibitionWorks = filtered.filter((artwork) => artwork.exhibitionFeatured);

  useEffect(() => {
    const saved = sessionStorage.getItem("mikhaleff-works-mode") as ViewMode | null;
    requestAnimationFrame(() => {
      if (saved && ["exhibition", "grid", "list"].includes(saved)) setMode(saved);
    });
  }, []);

  useEffect(() => {
    if (mode !== "exhibition" || !stageRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".exhibition-work__image").forEach((element, index) => {
        gsap.fromTo(element, { yPercent: index % 2 ? -5 : 5 }, { yPercent: index % 2 ? 5 : -5, ease: "none", scrollTrigger: { trigger: element, start: "top bottom", end: "bottom top", scrub: 0.7 } });
      });
    }, stageRef);
    return () => context.revert();
  }, [mode, exhibitionWorks.length]);

  const chooseMode = (nextMode: ViewMode) => {
    setMode(nextMode);
    sessionStorage.setItem("mikhaleff-works-mode", nextMode);
  };

  const openArtwork = (artwork: ArtworkCard) => {
    trackEvent("view_artwork", { artwork: artwork.slug, source: mode });
    sessionStorage.setItem("mikhaleff-exhibition-scroll", String(window.scrollY));
    sessionStorage.setItem("mikhaleff-selected-artwork", artwork.slug);
    const navigate = () => router.push(`/${locale}/works/${artwork.slug}`);
    const transition = document.startViewTransition;
    if (transition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) transition.call(document, navigate);
    else navigate();
  };

  const moveStage = (event: PointerEvent<HTMLDivElement>) => {
    if (!stageRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const x = (event.clientX / window.innerWidth - 0.5) * 14;
    const y = (event.clientY / window.innerHeight - 0.5) * 10;
    gsap.to(stageRef.current.querySelectorAll<HTMLElement>(".exhibition-work"), {
      x: (index) => x * placements[index % placements.length].depth,
      y: (index) => y * placements[index % placements.length].depth,
      duration: 1.4, ease: "power3.out", overwrite: "auto",
    });
    if (cursorRef.current) gsap.to(cursorRef.current, { x: event.clientX - 32, y: event.clientY - 32, duration: 0.45, ease: "power3.out", overwrite: "auto" });
  };

  return (
    <section className="works-archive">
      <div className="works-toolbar" role="group" aria-label="Artwork display mode">
        <div className="works-filters" aria-label="Filter artworks">
          <button type="button" aria-pressed={year === "all" && medium === "all"} onClick={() => { setYear("all"); setMedium("all"); trackEvent("filter_works", { filter: "all" }); }}>{labels.all}</button>
          <span className="works-filters__group">{years.map((item) => <button type="button" aria-pressed={year === item} onClick={() => { setYear(item); setMedium("all"); trackEvent("filter_works", { year: item }); }} key={item}>{item}</button>)}</span>
          <i aria-hidden="true" />
          <span className="works-filters__group">{mediums.map((item) => <button type="button" aria-pressed={medium === item} onClick={() => { setMedium(item); setYear("all"); trackEvent("filter_works", { medium: item }); }} key={item}>{item}</button>)}</span>
        </div>
        <div className="works-modes">{(["exhibition", "grid", "list"] as const).map((item) => <button key={item} onClick={() => chooseMode(item)} aria-pressed={mode === item}>{labels[item]}</button>)}</div>
      </div>

      {mode === "exhibition" && (
        <div className="exhibition-stage" style={{ "--exhibition-height": `${Math.max(230, Math.ceil(exhibitionWorks.length / placements.length) * 215)}svh` } as CSSProperties} ref={stageRef} onPointerMove={moveStage} onPointerLeave={() => gsap.to(stageRef.current?.querySelectorAll(".exhibition-work") ?? [], { x: 0, y: 0, duration: 1.4 })}>
          <span className="exhibition-cursor" ref={cursorRef} aria-hidden="true">View</span>
          {filtered.map((artwork, index) => {
            const placement = placements[index % placements.length];
            const style = { "--work-top": `${placement.top}%`, "--work-left": `${placement.left}%`, "--work-width": `${placement.width}%`, "--work-depth": placement.depth, viewTransitionName: `artwork-${artwork.slug}` } as CSSProperties;
            return (
              <button className="exhibition-work" style={style} key={artwork.slug} onClick={() => openArtwork(artwork)}>
                <span className="exhibition-work__image"><Image src={artwork.image.src} alt={artwork.image.alt} fill sizes="32vw" style={{ objectPosition: artwork.image.position }} /></span>
                <span className="exhibition-work__label"><strong>{artwork.title}</strong><small>{artwork.year}<br />{artwork.medium}<br />{artwork.dimensions}</small></span>
              </button>
            );
          })}
        </div>
      )}

      {mode === "grid" && (
        <div className="archive-grid">
          {filtered.map((artwork, index) => (
            <button data-shape={index % 3} data-index={index} key={artwork.slug} onClick={() => openArtwork(artwork)}>
              <span style={{ "--artwork-ratio": `${artwork.image.width || 4} / ${artwork.image.height || 5}` } as CSSProperties}><Image src={artwork.image.src} alt={artwork.image.alt} fill sizes="(max-width: 767px) 100vw, 34vw" style={{ objectPosition: artwork.image.position }} /></span>
              <strong>{artwork.title}</strong><small>{artwork.year}</small>
            </button>
          ))}
        </div>
      )}

      {mode === "list" && (
        <div className="archive-list-wrap">
          <ol className="archive-list">
            {filtered.map((artwork) => (
              <li key={artwork.slug} onMouseEnter={() => setPreview(artwork)}>
                <button onClick={() => openArtwork(artwork)}><strong>{artwork.title}</strong><span>{artwork.year}</span><span>{artwork.medium}</span><span>{artwork.dimensions}</span><i>→</i></button>
              </li>
            ))}
          </ol>
          <div className="archive-list-preview" style={{ "--artwork-ratio": `${preview.image.width || 4} / ${preview.image.height || 5}` } as CSSProperties}><Image key={preview.slug} src={preview.image.src} alt="" fill sizes="30vw" style={{ objectPosition: preview.image.position }} /></div>
        </div>
      )}
      {filtered.length === 0 && <p className="archive-empty">{labels.empty}</p>}
    </section>
  );
}
