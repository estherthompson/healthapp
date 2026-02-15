/**
 * Context aggregation types: nutrition, cycle, medications, and baseline comparisons.
 */

/** Daily nutrition (from food log or future nutrition API). */
export interface DailyNutrition {
  date: string;
  /** Total calories if available; otherwise undefined. */
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatsG?: number;
  /** Portion total in grams (always from food log). */
  portionG: number;
}

/** Cycle phase for context (simplified). */
export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | 'unknown';

export interface CycleContext {
  phase: CyclePhase;
  /** Human-readable label for UI. */
  phaseLabel: string;
  /** If user has period data in range. */
  hasPeriodData: boolean;
}

/** Medications (from medication service when available). */
export interface MedicationContext {
  items: Array<{ name: string; nickname?: string | null }>;
  available: boolean;
}

/** Basic profile info (stable). */
export interface UserProfileBasic {
  age?: number | null;
  sex?: 'male' | 'female' | 'other' | null;
  heightCm?: number | null;
  weightKg?: number | null;
  pregnancyOrBreastfeeding?: boolean | null;
}

/** Current state (how the person is at this time – can change often). */
export interface UserState {
  stressLevel?: 'low' | 'moderate' | 'high' | null;
  onPeriod?: boolean | null;
  periodFlow?: 'light' | 'medium' | 'heavy' | null;
  dietChange?: string | null;
  currentlySick?: string | null;
  moodToday?: string | null;
}

/** One medication with schedule and start date. */
export interface MedicationEntry {
  id: string;
  name: string;
  whenTake: string;
  startDate?: string | null;
}

/** One condition (chronic, temporary, or mental). */
export interface ConditionEntry {
  id: string;
  name: string;
  type: 'chronic' | 'temporary' | 'mental';
}

/** One infection or disease note. */
export interface InfectionOrDiseaseEntry {
  id: string;
  name: string;
  dateNoted?: string | null;
}

/** Medical info: medications, conditions, allergies, intolerances, infections. */
export interface MedicalInfo {
  medications: MedicationEntry[];
  conditions: ConditionEntry[];
  allergies: string[];
  intolerances: string[];
  infectionsOrDiseases: InfectionOrDiseaseEntry[];
}

/** @deprecated Use UserProfileBasic + UserState + MedicalInfo. Kept for adapter return shape. */
export interface UserProfile {
  age?: number | null;
  sex?: 'male' | 'female' | 'other' | null;
  allergies: string[];
  conditions: string[];
  heightCm?: number | null;
  weightKg?: number | null;
  pregnancyOrBreastfeeding?: boolean | null;
  moodToday?: string | null;
}

/** One baseline comparison line for the AI and UI. */
export interface BaselineComparison {
  /** e.g. "sleep", "calories", "resting_heart_rate" */
  metric: string;
  /** Human-readable: "You slept 4 hours less than your 30-day average." */
  summary: string;
  /** Today (or current) value. */
  currentValue: number | null;
  /** Baseline (e.g. 30-day average). */
  baselineValue: number | null;
  /** Direction: below, above, or same. */
  direction: 'below' | 'above' | 'same';
  /** Optional percent difference (e.g. -10 for 10% less). */
  percentDiff?: number;
}

/** Full aggregated context for the AI reasoning engine. */
export interface AggregatedContext {
  date: string;
  /** Today's health metrics. */
  today: {
    steps: number;
    distanceKm: number;
    activeEnergyKcal: number;
    flightsClimbed: number;
    exerciseMinutes: number;
    sleepMinutes: number;
    restingHeartRateBpm: number | null;
  };
  /** 7-day averages. */
  last7Days: {
    avgSleepMinutes: number;
    avgSteps: number;
    avgActiveEnergyKcal: number;
    avgRestingHeartRateBpm: number | null;
  };
  /** 30-day averages. */
  last30Days: {
    avgSleepMinutes: number;
    avgSteps: number;
    avgActiveEnergyKcal: number;
    avgRestingHeartRateBpm: number | null;
  };
  nutrition: DailyNutrition | null;
  cycle: CycleContext | null;
  medications: MedicationContext | null;
  /** Basic profile (age, sex, height, weight, pregnancy). */
  profile: UserProfileBasic | null;
  /** Current state (stress, period, diet change, sick, mood). */
  state: UserState | null;
  /** Medical info (medications with schedule, conditions, allergies, intolerances, infections). */
  medical: MedicalInfo | null;
  /** Precomputed baseline comparison strings for prompt and UI. */
  baselineComparisons: BaselineComparison[];
}
