/** Aggregates health, food log, period, and medications into AggregatedContext. */

import type { IHealthDataProvider } from '../health/types';
import type {
  AggregatedContext,
  DailyNutrition,
  CycleContext,
  MedicationContext,
  UserProfileBasic,
  UserState,
  MedicalInfo,
} from './types';
import { computeBaselineComparisons } from './baselineComparisons';

export interface ContextAggregatorDeps {
  healthProvider: IHealthDataProvider;
  getNutritionForDate: (date: string) => Promise<DailyNutrition | null>;
  getCycleContext: (date: string) => Promise<CycleContext | null>;
  getMedications: () => Promise<MedicationContext>;
  getProfileBasic: () => Promise<UserProfileBasic | null>;
  getState: () => Promise<UserState | null>;
  getMedicalInfo: () => Promise<MedicalInfo | null>;
}

/**
 * Builds full aggregated context for a given date (typically today).
 * Uses only the provided deps; no direct platform or API calls.
 */
export async function aggregateContext(
  date: string,
  deps: ContextAggregatorDeps
): Promise<AggregatedContext> {
  const [todayMetrics, last7, last30, nutrition, cycle, medications, profile, state, medical] =
    await Promise.all([
      deps.healthProvider.getMetricsForDate(date),
      deps.healthProvider.get7DaySummary(date),
      deps.healthProvider.get30DaySummary(date),
      deps.getNutritionForDate(date),
      deps.getCycleContext(date),
      deps.getMedications(),
      deps.getProfileBasic(),
      deps.getState(),
      deps.getMedicalInfo(),
    ]);

  const baselineComparisons = computeBaselineComparisons({
    today: todayMetrics,
    last7,
    last30,
    todayCalories: nutrition?.calories ?? null,
    avgCalories30: null, // Could be computed if we store daily calories over 30 days
  });

  return {
    date,
    today: {
      steps: todayMetrics.steps,
      distanceKm: todayMetrics.distanceKm,
      activeEnergyKcal: todayMetrics.activeEnergyKcal,
      flightsClimbed: todayMetrics.flightsClimbed,
      exerciseMinutes: todayMetrics.exerciseMinutes,
      sleepMinutes: todayMetrics.sleepMinutes,
      restingHeartRateBpm: todayMetrics.restingHeartRateBpm,
    },
    last7Days: {
      avgSleepMinutes: last7.avgSleepMinutes,
      avgSteps: last7.avgSteps,
      avgActiveEnergyKcal: last7.avgActiveEnergyKcal,
      avgRestingHeartRateBpm: last7.avgRestingHeartRateBpm,
    },
    last30Days: {
      avgSleepMinutes: last30.avgSleepMinutes,
      avgSteps: last30.avgSteps,
      avgActiveEnergyKcal: last30.avgActiveEnergyKcal,
      avgRestingHeartRateBpm: last30.avgRestingHeartRateBpm,
    },
    nutrition,
    cycle,
    medications,
    profile,
    state,
    medical,
    baselineComparisons,
  };
}

