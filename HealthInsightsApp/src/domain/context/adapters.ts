/**
 * Adapters from app stores (food log, period, medications) to context aggregator.
 * Keeps domain/context independent of storage implementation.
 */

import type {
  DailyNutrition,
  CycleContext,
  MedicationContext,
  UserProfileBasic,
  UserState,
  MedicalInfo,
} from './types';
import { getEntriesForDate } from '../../storage/foodLogStore';
import { getFeelingForDate } from '../../storage/periodFeelingsStore';
import { getMedications, type MedicationItem } from '../../services/medicationService';
import {
  getProfileBasic as getStoredProfileBasic,
  getState as getStoredState,
  getMedicalInfo as getStoredMedicalInfo,
} from '../../storage/profileStore';

/** Portion-only food log: we don't have calories in schema yet; optional future. */
export async function getNutritionForDate(date: string): Promise<DailyNutrition | null> {
  const entries = await getEntriesForDate(date);
  if (entries.length === 0) return null;
  const portionG = entries.reduce((sum, e) => sum + e.portion_g, 0);
  return {
    date,
    portionG,
    // calories, proteinG, etc. when available from nutrition API
  };
}

/** Simple cycle context from period feelings; phase can be extended with period calendar. */
export async function getCycleContext(_date: string): Promise<CycleContext | null> {
  const feeling = getFeelingForDate(_date);
  return {
    phase: 'unknown',
    phaseLabel: feeling ? `Noted: ${feeling}` : 'No period data',
    hasPeriodData: !!feeling,
  };
}

export async function getMedicationContext(): Promise<MedicationContext> {
  const items = await getMedications();
  return {
    items: items.map((m: MedicationItem) => ({ name: m.name, nickname: m.nickname })),
    available: items.length > 0,
  };
}

export async function getProfileBasic(): Promise<UserProfileBasic | null> {
  const p = getStoredProfileBasic();
  return Object.keys(p).length > 0 ? p : null;
}

export async function getState(): Promise<UserState | null> {
  const s = getStoredState();
  return Object.keys(s).length > 0 ? s : null;
}

export async function getMedicalInfo(): Promise<MedicalInfo | null> {
  const m = getStoredMedicalInfo();
  const hasAny =
    m.medications.length > 0 ||
    m.conditions.length > 0 ||
    m.allergies.length > 0 ||
    m.intolerances.length > 0 ||
    m.infectionsOrDiseases.length > 0;
  return hasAny ? m : null;
}
