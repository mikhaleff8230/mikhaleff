import type { InteriorScene } from "@/types/content";

export const fallbackInteriorScenes: readonly InteriorScene[] = [
  {
    slug: "gallery",
    title: "Gallery",
    sceneType: "gallery",
    image: { src: "/exhibitions/inner-landscapes-installation-placeholder.png", alt: "Contemporary gallery interior" },
    wallPhysicalWidthCm: 620,
    wallPhysicalHeightCm: 340,
    wallBounds: { x: 0.18, y: 0.12, width: 0.62, height: 0.58 },
    allowWallColor: false,
  },
  {
    slug: "living",
    title: "Living",
    sceneType: "living",
    image: { src: "/studio/artist-studio-placeholder.png", alt: "Warm contemporary living space", position: "50% 48%" },
    wallPhysicalWidthCm: 520,
    wallPhysicalHeightCm: 300,
    wallBounds: { x: 0.34, y: 0.08, width: 0.52, height: 0.48 },
    allowWallColor: true,
  },
  {
    slug: "minimal",
    title: "Minimal",
    sceneType: "minimal",
    image: { src: "/studio/alexander-mikhaleff-studio.png", alt: "Minimal artist studio interior", position: "62% 45%" },
    wallPhysicalWidthCm: 580,
    wallPhysicalHeightCm: 320,
    wallBounds: { x: 0.42, y: 0.08, width: 0.44, height: 0.5 },
    allowWallColor: false,
  },
];
