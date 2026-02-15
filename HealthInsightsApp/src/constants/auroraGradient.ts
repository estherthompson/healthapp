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

/** Soft color blobs: each entry is one gradient "lump" to layer for a blob look */
export const AURORA_BLOBS = [
  // Orange blob top-right – strong orange
  {
    colors: ['rgba(255,255,255,0)', 'rgba(249,115,22,0.82)', 'rgba(255,255,255,0)'],
    locations: [0.05, 0.28, 0.55],
    start: { x: 1, y: 0 },
    end: { x: 0, y: 1 },
  },
  // Yellow blob upper-center – clear yellow
  {
    colors: ['rgba(255,255,255,0)', 'rgba(254,240,138,0.88)', 'rgba(255,255,255,0)'],
    locations: [0.25, 0.5, 0.75],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  },
  // Soft orange blob left
  {
    colors: ['rgba(255,255,255,0)', 'rgba(251,146,60,0.75)', 'rgba(255,255,255,0)'],
    locations: [0.1, 0.35, 0.6],
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  // Warm yellow blob lower
  {
    colors: ['rgba(255,255,255,0)', 'rgba(253,224,71,0.8)', 'rgba(255,255,255,0)'],
    locations: [0.4, 0.65, 0.9],
    start: { x: 0.5, y: 1 },
    end: { x: 0.5, y: 0 },
  },
  // Diagonal accent – orange tint center
  {
    colors: ['rgba(255,255,255,0)', 'rgba(249,115,22,0.55)', 'rgba(255,255,255,0)'],
    locations: [0.35, 0.55, 0.75],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  // Light yellow blob bottom-right
  {
    colors: ['rgba(255,255,255,0)', 'rgba(254,249,195,0.78)', 'rgba(255,255,255,0)'],
    locations: [0.5, 0.78, 1],
    start: { x: 1, y: 1 },
    end: { x: 0, y: 0 },
  },
];
