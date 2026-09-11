"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type ReactNode } from "react";

type ScenePreset = { opacity: number; y: number; scale: number; scrub: number };

const scenePresets: Record<string, ScenePreset> = {
  "about-work": { opacity: 0.9, y: 28, scale: 0.996, scrub: 0.72 },
  details: { opacity: 0.92, y: 24, scale: 0.998, scrub: 0.78 },
  film: { opacity: 0.94, y: 18, scale: 0.998, scrub: 0.66 },
  "view-in-space": { opacity: 0.9, y: 30, scale: 0.996, scrub: 0.82 },
  "related-works": { opacity: 0.94, y: 20, scale: 0.999, scrub: 0.68 },
};

export function ArtworkDetailExperience({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      const scenes = gsap.utils.toArray<HTMLElement>("[data-scroll-scene]", root.current);

      media.add("(min-width: 768px)", () => {
        scenes.slice(1).forEach((section) => {
          const preset = scenePresets[section.id] ?? { opacity: 0.92, y: 24, scale: 0.997, scrub: 0.75 };
          gsap.fromTo(section, { opacity: preset.opacity, y: preset.y, scale: preset.scale, transformOrigin: "50% 0%" }, {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 88%",
              end: "top 48%",
              scrub: preset.scrub,
              invalidateOnRefresh: true,
              onToggle: ({ isActive }) => { section.style.willChange = isActive ? "transform, opacity" : ""; },
            },
          });
        });

        scenes.slice(0, -1).forEach((section, index) => {
          const next = scenes[index + 1];
          const childrenToEase = [...section.children].filter((child): child is HTMLElement => child instanceof HTMLElement);
          if (!next || !childrenToEase.length) return;
          gsap.to(childrenToEase, {
            opacity: 0.78,
            y: -16,
            scale: 0.989,
            transformOrigin: "50% 100%",
            ease: "none",
            scrollTrigger: { trigger: next, start: "top 94%", end: "top 64%", scrub: 0.72, invalidateOnRefresh: true },
          });
        });

        const firstNextScene = scenes[1];
        if (firstNextScene) {
          gsap.to(".artwork-primary", { opacity: 0.82, y: -18, scale: 0.986, ease: "none", scrollTrigger: { trigger: firstNextScene, start: "top 96%", end: "top 58%", scrub: 0.78 } });
          gsap.to(".artwork-meta", { opacity: 0.72, y: -12, ease: "none", scrollTrigger: { trigger: firstNextScene, start: "top 96%", end: "top 62%", scrub: 0.72 } });
          gsap.to(".artwork-preview-shell", { opacity: 0.82, y: -18, ease: "none", scrollTrigger: { trigger: firstNextScene, start: "top 98%", end: "top 66%", scrub: 0.68 } });
        }
      });

      media.add("(max-width: 767px)", () => {
        scenes.slice(1).forEach((section) => {
          gsap.fromTo(section, { opacity: 0.94, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", scrollTrigger: { trigger: section, start: "top 92%", once: true } });
        });
      });
    }, root);
    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => { window.cancelAnimationFrame(refreshFrame); context.revert(); media.revert(); };
  }, []);

  return <div className="artwork-scenes" ref={root}>{children}</div>;
}
