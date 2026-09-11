"use client";

import gsap from "gsap";
import Image from "next/image";
import { useRef } from "react";
import type { PointerEvent, ReactNode } from "react";
import type { HomepageContent } from "@/types/content";

export function HeroExperience({ hero, header }: { hero: HomepageContent["hero"]; header: ReactNode }) {
  const imageRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const parallax = (event: PointerEvent<HTMLElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    gsap.to(imageRef.current, { x: x * 10, y: y * 7, duration: 1.8, ease: "power3.out", overwrite: "auto" });
    gsap.to(copyRef.current, { x: x * -4, y: y * -3, duration: 1.8, ease: "power3.out", overwrite: "auto" });
  };
  return (
    <section className="hero" aria-labelledby="hero-title" onPointerMove={parallax}>
      <div className="hero__artwork" aria-hidden="true" ref={imageRef}>
        <Image src={hero.image.src} alt="" fill priority loading="eager" sizes="100vw" className="hero__image" style={{ objectPosition: hero.image.position }} />
        <div className="hero__veil" />
      </div>
      {header}
      <div className="hero__content site-grid">
        <div className="hero__introduction" ref={copyRef}>
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1 id="hero-title" className="display-title">{hero.title.map((line) => <span key={line}>{line}</span>)}</h1>
          <span className="short-rule" aria-hidden="true" />
          <p className="hero__subtitle">{hero.subtitle}</p>
        </div>
        <dl className="hero__caption">
          <div><dt className="sr-only">Artwork</dt><dd>{hero.artwork.title}</dd></div>
          <div><dt className="sr-only">Year</dt><dd>{hero.artwork.year}</dd></div>
          <div><dt className="sr-only">Medium</dt><dd>{hero.artwork.medium}</dd></div>
          <div><dt className="sr-only">Dimensions</dt><dd>{hero.artwork.dimensions}</dd></div>
        </dl>
        <a className="hero__scroll" href="#statement"><span>Scroll</span><span className="hero__scroll-line" aria-hidden="true" /></a>
      </div>
    </section>
  );
}
