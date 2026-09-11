export const motionTokens = {
  duration: { fast: 0.18, base: 0.42, slow: 0.9 },
  ease: [0.22, 1, 0.36, 1] as const,
  stagger: 0.07,
  imageReveal: 0.95,
  pageTransition: 0.75,
  hoverZoom: 1.035,
} as const;
