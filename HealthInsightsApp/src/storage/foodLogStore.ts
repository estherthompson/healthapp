/**
 * Food diary entries – uses Firestore when configured, otherwise in-memory.
 * Collections: foodLog (created automatically on first write).
 */

import { isFirebaseConfigured } from '../services/firestore';
import {
  firestoreGetFoodLogForDate,
  firestoreAddFoodEntry,
  firestoreAddFoodEntries,
  firestoreRemoveFoodEntry,
  type FoodLogDoc,
} from '../services/firestore';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface FoodLogEntry {
  id: string;
  meal: MealType;
  name: string;
  portion_g: number;
  date: string;
}

type LogByDate = Record<string, FoodLogEntry[]>;

let memoryStore: LogByDate = {};

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function nextId(): string {
  return `food-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function docToEntry(d: FoodLogDoc): FoodLogEntry {
  return {
    id: d.id,
    meal: d.meal as MealType,
    name: d.name,
    portion_g: d.portion_g,
    date: d.date,
  };
}

export async function getEntriesForDate(date: string): Promise<FoodLogEntry[]> {
  if (isFirebaseConfigured()) {
    const docs = await firestoreGetFoodLogForDate(date);
    return docs.map(docToEntry);
  }
  return [...(memoryStore[date] ?? [])];
}

export async function getEntriesForToday(): Promise<FoodLogEntry[]> {
  return getEntriesForDate(todayStr());
}

export async function getEntriesByMealForDate(
  date: string
): Promise<Record<MealType, FoodLogEntry[]>> {
  const entries = await getEntriesForDate(date);
  const out: Record<MealType, FoodLogEntry[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  };
  entries.forEach((e) => {
    if (out[e.meal]) out[e.meal].push(e);
  });
  return out;
}

export async function addEntry(
  entry: Omit<FoodLogEntry, 'id' | 'date'>
): Promise<FoodLogEntry> {
  const date = todayStr();
  if (isFirebaseConfigured()) {
    const id = await firestoreAddFoodEntry({
      meal: entry.meal,
      name: entry.name,
      portion_g: entry.portion_g,
      date,
    });
    return { ...entry, id, date };
  }
  const newEntry: FoodLogEntry = {
    ...entry,
    id: nextId(),
    date,
  };
  if (!memoryStore[date]) memoryStore[date] = [];
  memoryStore[date].push(newEntry);
  return newEntry;
}

export async function addEntries(
  meal: MealType,
  items: Array<{ name: string; portion_g: number }>
): Promise<void> {
  const date = todayStr();
  if (isFirebaseConfigured()) {
    await firestoreAddFoodEntries(date, meal, items);
    return;
  }
  if (!memoryStore[date]) memoryStore[date] = [];
  items.forEach((item) => {
    memoryStore[date].push({
      id: nextId(),
      meal,
      name: item.name,
      portion_g: item.portion_g,
      date,
    });
  });
}

export async function removeEntry(id: string): Promise<void> {
  if (isFirebaseConfigured()) {
    await firestoreRemoveFoodEntry(id);
    return;
  }
  Object.keys(memoryStore).forEach((date) => {
    memoryStore[date] = memoryStore[date].filter((e) => e.id !== id);
  });
}

export async function getTodayTotalPortion(): Promise<number> {
  const entries = await getEntriesForToday();
  return entries.reduce((sum, e) => sum + e.portion_g, 0);
}
