"use client";

import Image from "next/image";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type PointerEvent, type ReactNode, type WheelEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { trackEvent } from "@/lib/analytics/events";
import { motionTokens } from "@/lib/motion/tokens";
import type { ArtworkCard, ImageAsset } from "@/types/content";

type GalleryContextValue = {
  images: readonly ImageAsset[];
  activeIndex: number;
  direction: number;
  setActiveIndex: (index: number) => void;
  openViewer: (index: number, trigger?: HTMLElement) => void;
};

const GalleryContext = createContext<GalleryContextValue | null>(null);

export function useArtworkGallery() {
  const value = useContext(GalleryContext);
  if (!value) throw new Error("Artwork gallery controls must be used inside ArtworkGalleryProvider");
  return value;
}

export function ArtworkGalleryProvider({ artwork, images, children }: { artwork: ArtworkCard; images: readonly ImageAsset[]; children: ReactNode }) {
  const [activeIndex, setActiveIndexState] = useState(0);
  const [direction, setDirection] = useState(1);
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [railOverflow, setRailOverflow] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gestureStart = useRef<{ x: number; y: number; originX: number; originY: number } | null>(null);
  const pinch = useRef<{ distance: number; scale: number } | null>(null);
  const reducedMotion = useReducedMotion();

  const resetTransform = useCallback(() => { setScale(1); setOffset({ x: 0, y: 0 }); }, []);
  const setActiveIndex = useCallback((index: number) => {
    const safeIndex = ((index % images.length) + images.length) % images.length;
    if (safeIndex === activeIndex) return;
    setDirection(index >= images.length ? 1 : index < 0 ? -1 : safeIndex > activeIndex ? 1 : -1);
    setActiveIndexState(safeIndex);
    resetTransform();
  }, [activeIndex, images.length, resetTransform]);
  const move = useCallback((direction: number) => setActiveIndex(activeIndex + direction), [activeIndex, setActiveIndex]);

  const openViewer = useCallback((index: number, trigger?: HTMLElement) => {
    triggerRef.current = trigger ?? null;
    setActiveIndex(index);
    setOpen(true);
    trackEvent("open_fullscreen", { artwork: artwork.slug, image: index + 1 });
  }, [artwork.slug, setActiveIndex]);

  const closeViewer = useCallback(() => {
    setOpen(false);
    resetTransform();
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, [resetTransform]);

  useEffect(() => {
    const preload = [activeIndex - 1, activeIndex + 1];
    preload.forEach((index) => {
      const candidate = images[((index % images.length) + images.length) % images.length];
      if (candidate) new window.Image().src = candidate.src;
    });
  }, [activeIndex, images]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeViewer();
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])")];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKeyDown); };
  }, [closeViewer, move, open]);

  useEffect(() => {
    if (!open || !railRef.current) return;
    const rail = railRef.current;
    const active = rail.querySelector<HTMLElement>(`[data-gallery-index="${activeIndex}"]`);
    if (active) rail.scrollTo({ left: active.offsetLeft - (rail.clientWidth - active.clientWidth) / 2, behavior: "smooth" });
  }, [activeIndex, open]);

  useEffect(() => {
    if (!open || !railRef.current) return;
    const rail = railRef.current;
    const update = () => setRailOverflow(rail.scrollWidth > rail.clientWidth + 2);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [open, images.length]);

  const startGesture = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), scale };
      gestureStart.current = null;
      return;
    }
    gestureStart.current = { x: event.clientX, y: event.clientY, originX: offset.x, originY: offset.y };
  };

  const updateGesture = (event: PointerEvent<HTMLDivElement>) => {
    if (pointers.current.has(event.pointerId)) pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      setScale(Math.min(4, Math.max(1, pinch.current.scale * distance / pinch.current.distance)));
      return;
    }
    if (scale > 1 && gestureStart.current) setOffset({ x: gestureStart.current.originX + event.clientX - gestureStart.current.x, y: gestureStart.current.originY + event.clientY - gestureStart.current.y });
  };

  const endGesture = (event: PointerEvent<HTMLDivElement>) => {
    const start = gestureStart.current;
    if (scale === 1 && start) {
      const distanceX = event.clientX - start.x;
      const distanceY = event.clientY - start.y;
      if (Math.abs(distanceX) > 55 && Math.abs(distanceX) > Math.abs(distanceY)) move(distanceX > 0 ? -1 : 1);
    }
    pointers.current.delete(event.pointerId);
    pinch.current = null;
    gestureStart.current = null;
  };

  const zoomWithWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    setScale((value) => Math.min(4, Math.max(1, value + (event.deltaY < 0 ? 0.2 : -0.2))));
  };

  const current = images[activeIndex] ?? images[0];

  return <GalleryContext.Provider value={{ images, activeIndex, direction, setActiveIndex, openViewer }}>
    {children}
    {open && <div className="viewer" role="dialog" aria-modal="true" aria-label={`${artwork.title} fullscreen gallery`} ref={dialogRef}>
      <div className="viewer__top"><strong>{artwork.title}</strong><span>{String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span><button ref={closeRef} type="button" onClick={closeViewer}>Close ×</button></div>
      <div className="viewer__canvas" onPointerDown={startGesture} onPointerMove={updateGesture} onPointerUp={endGesture} onPointerCancel={endGesture} onWheel={zoomWithWheel}>
        <button className="viewer__previous" type="button" onClick={() => move(-1)} aria-label="Previous image">←</button>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div className="viewer__slide" custom={direction} key={`${current.src}-${current.position ?? "center"}`} variants={{ enter: (moveDirection: number) => ({ opacity: 0, x: `${moveDirection * 3}%` }), center: { opacity: 1, x: "0%" }, exit: (moveDirection: number) => ({ opacity: 0, x: `${moveDirection * -2}%` }) }} initial={reducedMotion ? false : "enter"} animate="center" exit={reducedMotion ? undefined : "exit"} transition={{ duration: reducedMotion ? 0 : 0.52, ease: motionTokens.ease }}>
            <div className={`viewer__image${activeIndex === 0 ? " is-primary" : " is-detail"}`} style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})` }}><Image src={current.src} alt={current.alt} fill sizes="100vw" style={{ objectPosition: activeIndex === 0 ? "center" : current.position }} unoptimized /></div>
          </motion.div>
        </AnimatePresence>
        <button className="viewer__next" type="button" onClick={() => move(1)} aria-label="Next image">→</button>
      </div>
      <div className="viewer__bottom">
        {railOverflow && <button type="button" className="viewer__rail-arrow viewer__rail-arrow--left" onClick={() => railRef.current?.scrollBy({ left: -320, behavior: "smooth" })} aria-label="Scroll thumbnails left">←</button>}
        <div className={`viewer__rail${railOverflow ? " is-overflowing" : ""}`} ref={railRef}>{images.map((image, index) => <button type="button" data-gallery-index={index} className={index === activeIndex ? "is-active" : undefined} onClick={() => setActiveIndex(index)} aria-label={`View artwork image ${index + 1} of ${images.length}`} aria-pressed={index === activeIndex} key={`${image.src}-${index}`}><Image src={image.src} alt="" fill sizes="8rem" style={{ objectPosition: image.position }} /></button>)}</div>
        {railOverflow && <button type="button" className="viewer__rail-arrow viewer__rail-arrow--right" onClick={() => railRef.current?.scrollBy({ left: 320, behavior: "smooth" })} aria-label="Scroll thumbnails right">→</button>}
        <div className="viewer__controls"><button type="button" onClick={() => setScale((value) => Math.min(4, value + 0.35))}>＋</button><span>{Math.round(scale * 100)}%</span><button type="button" onClick={() => setScale((value) => Math.max(1, value - 0.35))}>−</button><button type="button" onClick={resetTransform}>Fit</button></div>
      </div>
    </div>}
  </GalleryContext.Provider>;
}

export function ArtworkDetailImage({ index }: { index: number }) {
  const { images, openViewer } = useArtworkGallery();
  const image = images[index];
  if (!image) return null;
  return <button className="artwork-detail-open" type="button" onClick={(event) => openViewer(index, event.currentTarget)} aria-label={`Open ${image.alt} in fullscreen gallery`}><Image src={image.src} alt={image.alt} fill sizes="(max-width: 767px) 82vw, 30vw" style={{ objectPosition: image.position }} /><span>Zoom</span></button>;
}
