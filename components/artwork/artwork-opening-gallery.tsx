"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode, type WheelEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ImageAsset } from "@/types/content";
import { useArtworkGallery } from "@/components/artwork/artwork-gallery";
import { motionTokens } from "@/lib/motion/tokens";

type SectionLink = { href: string; label: string };

export function ArtworkOpeningGallery({ exhibitionImage, sectionLinks, children }: { exhibitionImage?: ImageAsset; sectionLinks: readonly SectionLink[]; children: ReactNode }) {
  const { images, activeIndex, direction, setActiveIndex, openViewer } = useArtworkGallery();
  const [overflow, setOverflow] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const activeImage = images[activeIndex] ?? images[0];
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const update = () => setOverflow(rail.scrollWidth > rail.clientWidth + 2);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [images.length, exhibitionImage]);

  useEffect(() => {
    const rail = railRef.current;
    const active = rail?.querySelector<HTMLElement>(`[data-opening-index="${activeIndex}"]`);
    if (rail && active) rail.scrollTo({ left: active.offsetLeft - (rail.clientWidth - active.clientWidth) / 2, behavior: "smooth" });
  }, [activeIndex]);

  const horizontalWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!railRef.current || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
    railRef.current.scrollLeft += event.deltaY;
  };

  return <>
    <div className="artwork-opening-grid">
      <nav className="artwork-section-index" aria-label="Artwork page sections">{sectionLinks.map((link, index) => <a className={index === 0 ? "is-active" : undefined} href={link.href} key={link.href}>{link.label}</a>)}</nav>
      <div className="artwork-primary">
        <button className={`artwork-open${activeIndex === 0 ? " is-primary" : " is-detail"}`} type="button" onClick={(event) => openViewer(activeIndex, event.currentTarget)} aria-label={`Open ${activeImage.alt} in fullscreen gallery`}>
          <AnimatePresence initial={false} custom={direction}>
            <motion.span className="artwork-open__frame" custom={direction} key={`${activeImage.src}-${activeImage.position ?? "center"}`} variants={{ enter: (moveDirection: number) => ({ opacity: 0, x: `${moveDirection * 3.5}%`, scale: 1.006 }), center: { opacity: 1, x: "0%", scale: 1 }, exit: (moveDirection: number) => ({ opacity: 0, x: `${moveDirection * -2.5}%`, scale: 0.997 }) }} initial={reducedMotion ? false : "enter"} animate="center" exit={reducedMotion ? undefined : "exit"} transition={{ duration: reducedMotion ? 0 : 0.52, ease: motionTokens.ease }}>
              <Image src={activeImage.src} alt={activeImage.alt} fill priority sizes="(max-width: 767px) 92vw, 58vw" style={{ objectPosition: activeIndex === 0 ? "center" : activeImage.position }} />
            </motion.span>
          </AnimatePresence>
          <span className="artwork-open__zoom">Zoom</span>
        </button>
        <div className="artwork-slide-controls"><span aria-live="polite">{String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span><button type="button" onClick={() => setActiveIndex(activeIndex - 1)} aria-label="Previous image">←</button><button type="button" onClick={() => setActiveIndex(activeIndex + 1)} aria-label="Next image">→</button></div>
      </div>
      <div className="artwork-meta">{children}</div>
    </div>

    <div className="artwork-preview-shell">
      {overflow && <button className="artwork-preview-arrow artwork-preview-arrow--left" type="button" onClick={() => railRef.current?.scrollBy({ left: -320, behavior: "smooth" })} aria-label="Scroll thumbnails left">←</button>}
      <div className="artwork-preview-rail" ref={railRef} onWheel={horizontalWheel}>
        {images.map((image, index) => <button className={`artwork-preview${activeIndex === index ? " is-active" : ""}`} data-opening-index={index} type="button" key={`${image.src}-${index}`} aria-label={`View artwork image ${index + 1} of ${images.length}`} aria-pressed={activeIndex === index} onClick={() => setActiveIndex(index)}><Image src={image.src} alt={image.alt} fill sizes="18vw" style={{ objectPosition: image.position }} /></button>)}
        {exhibitionImage && <a className="artwork-preview artwork-preview--interior" href="#view-in-space"><span><Image src={exhibitionImage.src} alt={exhibitionImage.alt} fill sizes="38vw" style={{ objectPosition: exhibitionImage.position }} /></span><small>View in space <b>↓</b></small></a>}
      </div>
      {overflow && <button className="artwork-preview-arrow artwork-preview-arrow--right" type="button" onClick={() => railRef.current?.scrollBy({ left: 320, behavior: "smooth" })} aria-label="Scroll thumbnails right">→</button>}
    </div>
  </>;
}
