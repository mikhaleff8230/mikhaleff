"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ArtworkCard, InteriorScene } from "@/types/content";
import { trackEvent } from "@/lib/analytics/events";

const ViewInSpaceModal = dynamic(() => import("@/components/artwork/view-in-space-modal").then((module) => module.ViewInSpaceModal), { ssr: false });

export function ViewInSpaceSection({ artwork, scenes }: { artwork: ArtworkCard; scenes: readonly InteriorScene[] }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const [mobile, setMobile] = useState(false);
  const scene = useMemo(() => scenes.find((item) => item.slug === artwork.preferredInteriorSceneSlug) ?? scenes[0], [artwork.preferredInteriorSceneSlug, scenes]);
  const artworkImage = artwork.primaryImage ?? artwork.image;
  const sceneImage = mobile && scene?.mobileImage ? scene.mobileImage : scene?.image;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  if (!scene || !sceneImage) return null;

  const launch = () => {
    setOpen(true);
    trackEvent("view_in_space_open", { artwork: artwork.slug, scene: scene.slug });
  };
  const close = () => {
    setOpen(false);
    trackEvent("view_in_space_close", { artwork: artwork.slug });
    window.requestAnimationFrame(() => trigger.current?.focus());
  };

  return <section className="view-in-space-section" id="view-in-space" data-scroll-scene="view-in-space">
    <div className="artwork-section-label"><span>View in space</span></div>
    <button className="view-in-space-preview" type="button" onClick={launch} ref={trigger} aria-label={`Open interactive view in space for ${artwork.title}`}>
      <Image src={sceneImage.src} alt={sceneImage.alt} fill sizes="82vw" style={{ objectPosition: sceneImage.position }} />
      <span className="view-in-space-preview__art" style={{ left: `${(scene.wallBounds.x + scene.wallBounds.width * 0.5) * 100}%`, top: `${(scene.wallBounds.y + scene.wallBounds.height * 0.46) * 100}%`, width: `${Math.min(34, scene.wallBounds.width * 56)}%`, aspectRatio: artwork.widthCm && artwork.heightCm ? `${artwork.widthCm} / ${artwork.heightCm}` : undefined }}><Image src={artworkImage.src} alt="" fill sizes="30vw" /></span>
      <span className="view-in-space-preview__veil" />
      <span className="view-in-space-preview__cta">Enter space <b>→</b></span>
    </button>
    <div className="view-in-space-section__copy"><strong>{artwork.title}</strong><span>{artwork.dimensions}</span><p>Move the work, compare interiors and preview its physical scale on the wall.</p><button type="button" onClick={launch}>Open interactive view <b>→</b></button></div>
    {open && <ViewInSpaceModal artwork={artwork} scenes={scenes} onClose={close} />}
  </section>;
}
