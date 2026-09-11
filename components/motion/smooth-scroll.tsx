"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef, type ReactNode } from "react";

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nativeTouch = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    reducedMotionRef.current = reducedMotion.matches;

    let snapTimer = 0;
    let snapping = false;
    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;

    const softlyAlignNearestScene = () => {
      if (!lenis || snapping || document.body.style.overflow === "hidden") return;
      const scenes = [...document.querySelectorAll<HTMLElement>(".artwork-page [data-scroll-scene]")];
      if (scenes.length < 2) return;
      const nearest = scenes.reduce((closest, scene) => Math.abs(scene.getBoundingClientRect().top) < Math.abs(closest.getBoundingClientRect().top) ? scene : closest);
      const distance = Math.abs(nearest.getBoundingClientRect().top);
      if (distance < 2 || distance > window.innerHeight * 0.14) return;
      snapping = true;
      lenis.scrollTo(nearest, { duration: 0.7, easing: (value) => 1 - Math.pow(1 - value, 3), onComplete: () => { snapping = false; } });
    };

    if (!reducedMotion.matches && !nativeTouch.matches) {
      gsap.registerPlugin(ScrollTrigger);
      lenis = new Lenis({ lerp: 0.08, smoothWheel: true, wheelMultiplier: 0.9, touchMultiplier: 1, autoRaf: false });
      lenisRef.current = lenis;
      const onLenisScroll = () => {
        ScrollTrigger.update();
        window.clearTimeout(snapTimer);
        if (!snapping) snapTimer = window.setTimeout(softlyAlignNearestScene, 170);
      };
      lenis.on("scroll", onLenisScroll);
      tick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      ScrollTrigger.refresh();
    }

    const onAnchorClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      const hash = anchor?.getAttribute("href");
      if (!anchor || !hash || hash === "#") return;
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      window.history.pushState(null, "", hash);
      if (anchor.classList.contains("artwork-preview--interior") && !reducedMotionRef.current) {
        anchor.animate([{ opacity: 1, transform: "scale(1)" }, { opacity: 0.82, transform: "scale(0.985)" }, { opacity: 1, transform: "scale(1)" }], { duration: 700, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
      }
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, { duration: hash === "#view-in-space" ? 1.1 : 0.9, easing: (value) => 1 - Math.pow(1 - value, 3) });
      } else {
        target.scrollIntoView({ behavior: reducedMotionRef.current ? "auto" : "smooth", block: "start" });
      }
    };

    document.addEventListener("click", onAnchorClick);
    return () => {
      window.clearTimeout(snapTimer);
      document.removeEventListener("click", onAnchorClick);
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      lenisRef.current = null;
    };
  }, []);

  return children;
}
