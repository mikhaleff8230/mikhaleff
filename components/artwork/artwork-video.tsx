"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { ArtworkVideo } from "@/types/content";

export function ArtworkVideoBlock({ video }: { video: ArtworkVideo }) {
  const element = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const play = async () => {
    if (!video.src || !element.current) return;
    await element.current.play();
    setPlaying(true);
  };

  return (
    <div className={`artwork-video${playing ? " is-playing" : ""}`}>
      {video.src ? <video ref={element} src={video.src} poster={video.poster.src} controls={playing} playsInline preload="metadata" onPause={() => setPlaying(false)} /> : <Image src={video.poster.src} alt={video.poster.alt} fill sizes="100vw" style={{ objectPosition: video.poster.position }} />}
      <div className="artwork-video__veil" />
      <div className="artwork-video__copy">
        {video.eyebrow && <p className="eyebrow">{video.eyebrow}</p>}
        {video.title && <h2>{video.title}</h2>}
        {video.caption && <p>{video.caption}</p>}
      </div>
      {video.src ? <button type="button" onClick={play} aria-label={`Play ${video.title || "film"}`}><span>▶</span><small>Play</small></button> : <span className="artwork-video__pending">Film</span>}
    </div>
  );
}
