/**
 * In-memory store for period feelings/mood per date.
 * Key: date string (YYYY-MM-DD), value: feeling label (e.g. 'cramps', 'tired', 'ok').
 */

type FeelingsMap = Record<string, string>;

let store: FeelingsMap = {};

export function getFeelings(): FeelingsMap {
  return { ...store };
}

export function getFeelingForDate(dateStr: string): string | undefined {
  return store[dateStr];
}

export function setFeeling(dateStr: string, feeling: string): void {
  store[dateStr] = feeling;
}

export function setFeelings(feelings: FeelingsMap): void {
  store = { ...store, ...feelings };
}

export function clearFeeling(dateStr: string): void {
  delete store[dateStr];
}
