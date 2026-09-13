"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Group, Image as KonvaImage, Layer, Rect, Stage } from "react-konva";
import type Konva from "konva";
import type { ArtworkCard, InteriorScene } from "@/types/content";
import { trackEvent } from "@/lib/analytics/events";
import { getInterfaceCopy } from "@/lib/i18n/copy";

const wallColors = [
  { label: "Original", value: "transparent" },
  { label: "Ivory", value: "#d9d0c0" },
  { label: "Warm white", value: "#eee8dc" },
  { label: "Grey", value: "#88857f" },
  { label: "Charcoal", value: "#292826" },
] as const;

function useCanvasImage(src: string) {
  const [image, setImage] = useState<HTMLImageElement>();
  useEffect(() => {
    const next = new window.Image();
    next.crossOrigin = "anonymous";
    next.onload = () => setImage(next);
    next.src = src;
    return () => { next.onload = null; };
  }, [src]);
  return image;
}

function cover(image: HTMLImageElement | undefined, width: number, height: number) {
  if (!image) return { x: 0, y: 0, width, height };
  const ratio = Math.max(width / image.width, height / image.height);
  const nextWidth = image.width * ratio;
  const nextHeight = image.height * ratio;
  return { x: (width - nextWidth) / 2, y: (height - nextHeight) / 2, width: nextWidth, height: nextHeight };
}

export function ViewInSpaceModal({ artwork, scenes, locale, onClose }: { artwork: ArtworkCard; scenes: readonly InteriorScene[]; locale: string; onClose: () => void }) {
  const initialScene = Math.max(0, scenes.findIndex((scene) => scene.slug === artwork.preferredInteriorSceneSlug));
  const labels = getInterfaceCopy(locale).space;
  const [sceneIndex, setSceneIndex] = useState(initialScene);
  const [mobile, setMobile] = useState(false);
  const [canvas, setCanvas] = useState({ width: 1280, height: 720 });
  const [customSceneUrl, setCustomSceneUrl] = useState<string | null>(null);
  const canUseTrueScale = Boolean(!customSceneUrl && artwork.widthCm && artwork.heightCm && scenes[sceneIndex]?.wallPhysicalWidthCm && artwork.trueScaleEnabled !== false);
  const [trueScale, setTrueScale] = useState(false);
  const [manualScale, setManualScale] = useState(0.52);
  const [frame, setFrame] = useState<"none" | "black">("none");
  const [wallColor, setWallColor] = useState("transparent");
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scene = scenes[sceneIndex] ?? scenes[0];
  const sceneSource = customSceneUrl || (mobile && scene.mobileImage ? scene.mobileImage.src : scene.image.src);
  const sceneImage = useCanvasImage(sceneSource);
  const artSource = artwork.primaryImage ?? artwork.image;
  const artworkImage = useCanvasImage(artSource.src);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => () => {
    if (customSceneUrl) URL.revokeObjectURL(customSceneUrl);
  }, [customSceneUrl]);

  useEffect(() => {
    const target = canvasRef.current;
    if (!target) return;
    const update = () => setCanvas({ width: target.clientWidth, height: target.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(target);
    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);
    return () => { observer.disconnect(); window.removeEventListener("resize", update); window.visualViewport?.removeEventListener("resize", update); };
  }, []);

  useEffect(() => {
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !rootRef.current) return;
      const focusable = [...rootRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), [tabindex]:not([tabindex='-1'])")];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const wall = useMemo(() => {
    const bounds = customSceneUrl ? { x: 0.12, y: 0.1, width: 0.76, height: 0.8 } : scene.wallBounds;
    return { x: bounds.x * canvas.width, y: bounds.y * canvas.height, width: bounds.width * canvas.width, height: bounds.height * canvas.height };
  }, [canvas, customSceneUrl, scene.wallBounds]);
  const artRatio = artworkImage ? artworkImage.width / artworkImage.height : artwork.widthCm && artwork.heightCm ? artwork.widthCm / artwork.heightCm : 0.8;
  const trueWidth = canUseTrueScale && artwork.widthCm && scene.wallPhysicalWidthCm ? wall.width * (artwork.widthCm / scene.wallPhysicalWidthCm) : wall.width * manualScale;
  const artWidth = Math.min(wall.width * 0.88, Math.max(wall.width * 0.12, trueScale ? trueWidth : wall.width * manualScale));
  const artHeight = artWidth / artRatio;
  const defaultPosition = { x: wall.x + (wall.width - artWidth) / 2, y: wall.y + Math.max(0, wall.height * 0.46 - artHeight / 2) };
  const placed = position ?? defaultPosition;
  const sceneCover = cover(sceneImage, canvas.width, canvas.height);

  const reset = useCallback(() => {
    setSceneIndex(initialScene);
    setTrueScale(false);
    setManualScale(0.52);
    setFrame("none");
    setWallColor("transparent");
    setPosition(null);
  }, [initialScene]);

  const chooseScene = (index: number) => {
    setSceneIndex(index);
    setCustomSceneUrl(null);
    const nextCanUseTrueScale = Boolean(artwork.widthCm && artwork.heightCm && scenes[index]?.wallPhysicalWidthCm && artwork.trueScaleEnabled !== false);
    if (!nextCanUseTrueScale) setTrueScale(false);
    setPosition(null);
    setWallColor("transparent");
    trackEvent("view_in_space_scene_change", { artwork: artwork.slug, scene: scenes[index].slug });
  };
  const uploadRoom = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    setCustomSceneUrl(URL.createObjectURL(file));
    setTrueScale(false);
    setManualScale(0.52);
    setPosition(null);
    setWallColor("transparent");
    trackEvent("view_in_space_custom_room", { artwork: artwork.slug });
  };
  const removeCustomRoom = () => {
    setCustomSceneUrl(null);
    setPosition(null);
  };
  const toggleTrueScale = () => {
    if (!canUseTrueScale) return;
    const next = !trueScale;
    setTrueScale(next);
    setPosition(null);
    trackEvent(next ? "view_in_space_true_scale_on" : "view_in_space_true_scale_off", { artwork: artwork.slug });
  };
  const resize = (amount: number) => {
    if (trueScale) return;
    setManualScale((value) => Math.min(0.88, Math.max(0.12, value + amount)));
    setPosition(null);
    trackEvent("view_in_space_resize", { artwork: artwork.slug, scale: manualScale + amount });
  };
  const toggleFrame = () => {
    if (artwork.frameAllowed === false) return;
    const next = frame === "none" ? "black" : "none";
    setFrame(next);
    trackEvent("view_in_space_frame_change", { artwork: artwork.slug, frame: next });
  };
  const fullscreen = async () => {
    if (rootRef.current?.requestFullscreen) await rootRef.current.requestFullscreen();
    trackEvent("view_in_space_fullscreen", { artwork: artwork.slug });
  };
  const dragBound = (candidate: { x: number; y: number }) => ({
    x: Math.min(wall.x + wall.width - artWidth * 0.2, Math.max(wall.x - artWidth * 0.8, candidate.x)),
    y: Math.min(wall.y + wall.height - artHeight * 0.2, Math.max(wall.y - artHeight * 0.8, candidate.y)),
  });
  const endDrag = (event: Konva.KonvaEventObject<DragEvent>) => setPosition({ x: event.target.x(), y: event.target.y() });

  return <div className="space-modal" role="dialog" aria-modal="true" aria-label={`View ${artwork.title} in space`} ref={rootRef}>
    <header><strong>{labels.title}</strong><span>{artwork.title} · {artwork.dimensions}</span><button type="button" onClick={fullscreen}>{labels.fullscreen}</button><button type="button" onClick={onClose} ref={closeRef}>{labels.close} ×</button></header>
    <div className="space-modal__canvas" ref={canvasRef}>
      <Stage width={canvas.width} height={canvas.height}>
        <Layer listening={false}>
          <KonvaImage image={sceneImage} {...sceneCover} />
          {scene.allowWallColor && wallColor !== "transparent" && <Rect {...wall} fill={wallColor} opacity={0.38} globalCompositeOperation="multiply" />}
        </Layer>
        <Layer>
          <Group x={placed.x} y={placed.y} draggable dragBoundFunc={dragBound} onDragEnd={endDrag}>
            {frame === "black" && <Rect x={-Math.max(3, artWidth * 0.014)} y={-Math.max(3, artWidth * 0.014)} width={artWidth + Math.max(6, artWidth * 0.028)} height={artHeight + Math.max(6, artWidth * 0.028)} fill="#11110f" shadowColor="#000" shadowBlur={18} shadowOpacity={0.24} shadowOffsetY={8} />}
            {frame === "none" && <Rect width={artWidth} height={artHeight} fill="#000" shadowColor="#000" shadowBlur={18} shadowOpacity={0.22} shadowOffsetY={8} listening={false} />}
            <KonvaImage image={artworkImage} width={artWidth} height={artHeight} />
          </Group>
        </Layer>
      </Stage>
      <div className="space-modal__meta" aria-live="polite"><strong>{artwork.title}</strong><span>{artwork.dimensions}</span><small>{trueScale ? labels.trueScale : labels.previewScale}</small></div>
    </div>
    <aside className="space-controls">
      <div className="space-control"><span>{labels.scene}</span><div>{scenes.map((item, index) => <button className={index === sceneIndex ? "is-active" : undefined} type="button" onClick={() => chooseScene(index)} key={item.slug}>{item.title}</button>)}</div></div>
      <div className="space-control space-control--upload"><span>{labels.interior}</span><div><button className={customSceneUrl ? "is-active" : undefined} type="button" onClick={() => fileInputRef.current?.click()}>{customSceneUrl ? labels.replace : labels.upload}</button>{customSceneUrl && <button type="button" onClick={removeCustomRoom}>{labels.remove}</button>}</div><input ref={fileInputRef} type="file" accept="image/*" onChange={(event) => { uploadRoom(event.target.files?.[0]); event.currentTarget.value = ""; }} /><small>{labels.private}</small></div>
      <div className="space-control"><span>{labels.measured}</span><button className={trueScale ? "is-active" : undefined} type="button" onClick={toggleTrueScale} disabled={!canUseTrueScale}>{canUseTrueScale ? (trueScale ? labels.on : labels.off) : labels.unavailable}</button><small>{labels.measuredHelp}</small></div>
      <div className="space-control"><span>{labels.size}</span><div><button type="button" onClick={() => resize(-0.05)} disabled={trueScale}>−</button><small>{Math.round(manualScale * 100)}%</small><button type="button" onClick={() => resize(0.05)} disabled={trueScale}>＋</button></div></div>
      {artwork.frameAllowed !== false && <div className="space-control"><span>{labels.frame}</span><button className={frame !== "none" ? "is-active" : undefined} type="button" onClick={toggleFrame}>{frame === "none" ? labels.none : labels.black}</button></div>}
      {scene.allowWallColor && <div className="space-control space-control--colors"><span>{labels.wall}</span><div>{wallColors.map((color) => <button className={wallColor === color.value ? "is-active" : undefined} type="button" aria-label={color.label} title={color.label} style={{ background: color.value }} onClick={() => setWallColor(color.value)} key={color.label} />)}</div></div>}
      <button className="space-controls__reset" type="button" onClick={reset}>{labels.reset}</button>
    </aside>
  </div>;
}
