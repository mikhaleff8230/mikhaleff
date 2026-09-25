"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { ArtworkVideo } from "@/types/content";

export function ArtworkVideoBlock({ video, variant = "artwork", linkLabel }: { video: ArtworkVideo; variant?: "artwork" | "homepage"; linkLabel?: string }) {
  const element = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [ratio, setRatio] = useState(() => video.poster.width && video.poster.height
    ? `${video.poster.width} / ${video.poster.height}`
    : "16 / 9");

  const play = async () => {
    if (!video.src || !element.current) return;
    await element.current.play();
    setStarted(true);
  };

  return (
    <div className={`artwork-video artwork-video--${variant}${started ? " is-playing" : ""}`} style={{ "--video-ratio": ratio } as CSSProperties}>
      {video.src ? <video ref={element} src={video.src} poster={started ? undefined : video.poster.src} controls={started} playsInline preload="metadata" onLoadedMetadata={(event) => { const { videoWidth, videoHeight } = event.currentTarget; if (videoWidth && videoHeight) setRatio(`${videoWidth} / ${videoHeight}`); }} onPlay={() => setStarted(true)} onEnded={() => setStarted(false)} /> : <Image src={video.poster.src} alt={video.poster.alt} fill sizes="100vw" style={{ objectPosition: video.poster.position }} />}
      <div className="artwork-video__veil" />
      <div className="artwork-video__copy">
        {video.eyebrow && <p className="eyebrow">{video.eyebrow}</p>}
        {video.title && <h2>{video.title}</h2>}
        {video.caption && <p>{video.caption}</p>}
        {linkLabel && video.src && <button className="artwork-video__text-link" type="button" onClick={play}>{linkLabel}<span aria-hidden="true"> →</span></button>}
      </div>
      {video.src ? <button type="button" onClick={play} aria-label={`Play ${video.title || "film"}`}><span>▶</span><small>Play</small></button> : <span className="artwork-video__pending">Film</span>}
    </div>
  );
}