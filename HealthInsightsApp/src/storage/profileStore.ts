/**
 * Profile store: basic info, current state, and medical info.
 * Persisted with AsyncStorage (or localStorage on web) so data survives app restarts.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  UserProfileBasic,
  UserState,
  MedicalInfo,
  MedicationEntry,
  ConditionEntry,
  InfectionOrDiseaseEntry,
} from '../domain/context/types';

const STORAGE_KEY = '@BloomAi/profileStore';

function nextId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// --- In-memory state (hydrated from storage on load) ---
let profile: UserProfileBasic = {};
let state: UserState = {};
let medical: MedicalInfo = {
  medications: [],
  conditions: [],
  allergies: [],
  intolerances: [],
  infectionsOrDiseases: [],
};

/** Persist current in-memory state to disk. Fire-and-forget. */
function persist(): void {
  const payload = {
    profile,
    state,
    medical: {
      medications: medical.medications,
      conditions: medical.conditions,
      allergies: medical.allergies,
      intolerances: medical.intolerances,
      infectionsOrDiseases: medical.infectionsOrDiseases,
    },
  };
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {
    // Ignore storage errors (e.g. full disk, permission)
  });
}

/**
 * Load saved profile from storage and hydrate in-memory state.
 * Call this once when the app starts (e.g. in App.tsx useEffect).
 */
export async function loadProfileStore(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw) as {
      profile?: UserProfileBasic;
      state?: UserState;
      medical?: MedicalInfo;
    };
    if (data.profile && typeof data.profile === 'object') profile = { ...profile, ...data.profile };
    if (data.state && typeof data.state === 'object') state = { ...state, ...data.state };
    if (data.medical && typeof data.medical === 'object') {
      medical = {
        medications: Array.isArray(data.medical.medications) ? data.medical.medications : [],
        conditions: Array.isArray(data.medical.conditions) ? data.medical.conditions : [],
        allergies: Array.isArray(data.medical.allergies) ? data.medical.allergies : [],
        intolerances: Array.isArray(data.medical.intolerances) ? data.medical.intolerances : [],
        infectionsOrDiseases: Array.isArray(data.medical.infectionsOrDiseases)
          ? data.medical.infectionsOrDiseases
          : [],
      };
    }
  } catch {
    // Invalid JSON or missing key: keep default in-memory state
  }
}

// --- Basic profile ---
export function getProfileBasic(): UserProfileBasic {
  return { ...profile };
}

export function setProfileBasic(next: Partial<UserProfileBasic>): void {
  profile = { ...profile, ...next };
  persist();
}

// --- State (current) ---
export function getState(): UserState {
  return { ...state };
}

export function setState(next: Partial<UserState>): void {
  state = { ...state, ...next };
  persist();
}

// --- Medical info ---
export function getMedicalInfo(): MedicalInfo {
  return {
    medications: medical.medications.map((m) => ({ ...m })),
    conditions: medical.conditions.map((c) => ({ ...c })),
    allergies: [...medical.allergies],
    intolerances: [...medical.intolerances],
    infectionsOrDiseases: medical.infectionsOrDiseases.map((i) => ({ ...i })),
  };
}

export function setAllergies(allergies: string[]): void {
  medical.allergies = [...allergies];
  persist();
}

export function setIntolerances(intolerances: string[]): void {
  medical.intolerances = [...intolerances];
  persist();
}

export function addMedication(entry: Omit<MedicationEntry, 'id'>): MedicationEntry {
  const newEntry: MedicationEntry = { ...entry, id: nextId() };
  medical.medications.push(newEntry);
  persist();
  return newEntry;
}

export function removeMedication(id: string): void {
  medical.medications = medical.medications.filter((m) => m.id !== id);
  persist();
}

export function updateMedication(id: string, updates: Partial<Omit<MedicationEntry, 'id'>>): void {
  const i = medical.medications.findIndex((m) => m.id === id);
  if (i >= 0) medical.medications[i] = { ...medical.medications[i], ...updates };
  persist();
}

export function addCondition(entry: Omit<ConditionEntry, 'id'>): ConditionEntry {
  const newEntry: ConditionEntry = { ...entry, id: nextId() };
  medical.conditions.push(newEntry);
  persist();
  return newEntry;
}

export function removeCondition(id: string): void {
  medical.conditions = medical.conditions.filter((c) => c.id !== id);
  persist();
}

export function addInfectionOrDisease(entry: Omit<InfectionOrDiseaseEntry, 'id'>): InfectionOrDiseaseEntry {
  const newEntry: InfectionOrDiseaseEntry = { ...entry, id: nextId() };
  medical.infectionsOrDiseases.push(newEntry);
  persist();
  return newEntry;
}

export function removeInfectionOrDisease(id: string): void {
  medical.infectionsOrDiseases = medical.infectionsOrDiseases.filter((i) => i.id !== id);
  persist();
}

/** Backward compat: build a single "profile" shape for adapters that still expect UserProfile. */
export function getProfile(): UserProfileBasic & { allergies: string[]; conditions: string[]; moodToday?: string | null } {
  const m = getMedicalInfo();
  const s = getState();
  return {
    ...profile,
    allergies: m.allergies,
    conditions: m.conditions.map((c) => c.name),
    moodToday: s.moodToday ?? null,
  };
}
