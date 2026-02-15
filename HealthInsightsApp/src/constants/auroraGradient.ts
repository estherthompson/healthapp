/**
 * Aurora-style gradient: orange at top-right, yellow and orange blended
 * diagonally (kept for any single-gradient fallback).
 */
export const AURORA_GRADIENT = {
  colors: [
    '#f97316',
    '#fef08a',
    '#fb923c',
    '#fef9c3',
    '#ea580c',
    '#fde047',
  ],
  locations: [0, 0.25, 0.45, 0.62, 0.8, 1],
  start: { x: 1, y: 0 } as const,
  end: { x: 0, y: 1 } as const,
};

/** Soft color blobs: gentle ramps (no sharp bands) so they read round, not diamond-shaped */
export const AURORA_BLOBS = [
  // Orange blob top-right – soft ramp in/out
  {
    colors: [
      'rgba(255,255,255,0)',
      'rgba(249,115,22,0.25)',
      'rgba(249,115,22,0.85)',
      'rgba(249,115,22,0.2)',
      'rgba(255,255,255,0)',
    ],
    locations: [0, 0.12, 0.32, 0.55, 0.78],
    start: { x: 1, y: 0 },
    end: { x: 0, y: 1 },
  },
  // Yellow blob upper-center – soft ramp
  {
    colors: [
      'rgba(255,255,255,0)',
      'rgba(253,224,71,0.35)',
      'rgba(253,224,71,0.72)',
      'rgba(253,224,71,0.3)',
      'rgba(255,255,255,0)',
    ],
    locations: [0.2, 0.35, 0.5, 0.65, 0.85],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  },
  // Soft orange blob left – gentle falloff
  {
    colors: [
      'rgba(255,255,255,0)',
      'rgba(251,146,60,0.3)',
      'rgba(251,146,60,0.75)',
      'rgba(251,146,60,0.25)',
      'rgba(255,255,255,0)',
    ],
    locations: [0, 0.15, 0.38, 0.6, 0.85],
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  // Warm yellow blob lower – pulled up so less yellow near tab bar / Food icon
  {
    colors: [
      'rgba(255,255,255,0)',
      'rgba(253,224,71,0.2)',
      'rgba(253,224,71,0.52)',
      'rgba(253,224,71,0.18)',
      'rgba(255,255,255,0)',
    ],
    locations: [0.5, 0.65, 0.78, 0.88, 0.98],
    start: { x: 0.5, y: 1 },
    end: { x: 0.5, y: 0 },
  },
  // Orange blob center diagonal – soft edges
  {
    colors: [
      'rgba(255,255,255,0)',
      'rgba(249,115,22,0.2)',
      'rgba(249,115,22,0.68)',
      'rgba(249,115,22,0.18)',
      'rgba(255,255,255,0)',
    ],
    locations: [0.2, 0.38, 0.55, 0.72, 0.9],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  // Orange blob bottom-right – soft ramp
  {
    colors: [
      'rgba(255,255,255,0)',
      'rgba(251,146,60,0.22)',
      'rgba(251,146,60,0.65)',
      'rgba(251,146,60,0.15)',
      'rgba(255,255,255,0)',
    ],
    locations: [0.6, 0.75, 0.88, 0.96, 1],
    start: { x: 1, y: 1 },
    end: { x: 0, y: 0 },
  },
];
