/**
 * Baseline comparison logic is pure and testable without Apple Health.
 */

import { computeBaselineComparisons } from '../src/domain/context/baselineComparisons';
import type { DailyHealthMetrics } from '../src/domain/health/types';
import type { HealthMetricsSummary } from '../src/domain/health/types';

function daily(
  overrides: Partial<DailyHealthMetrics> & { date: string }
): DailyHealthMetrics {
  return {
    date: overrides.date,
    steps: overrides.steps ?? 0,
    distanceKm: overrides.distanceKm ?? 0,
    activeEnergyKcal: overrides.activeEnergyKcal ?? 0,
    flightsClimbed: overrides.flightsClimbed ?? 0,
    exerciseMinutes: overrides.exerciseMinutes ?? 0,
    sleepMinutes: overrides.sleepMinutes ?? 0,
    restingHeartRateBpm: overrides.restingHeartRateBpm ?? null,
  };
}

function summary(overrides: Partial<HealthMetricsSummary>): HealthMetricsSummary {
  return {
    avgSteps: overrides.avgSteps ?? 0,
    avgDistanceKm: overrides.avgDistanceKm ?? 0,
    avgActiveEnergyKcal: overrides.avgActiveEnergyKcal ?? 0,
    avgFlightsClimbed: overrides.avgFlightsClimbed ?? 0,
    avgExerciseMinutes: overrides.avgExerciseMinutes ?? 0,
    avgSleepMinutes: overrides.avgSleepMinutes ?? 0,
    avgRestingHeartRateBpm: overrides.avgRestingHeartRateBpm ?? null,
    sampleCount: overrides.sampleCount ?? 7,
    dateRange: overrides.dateRange ?? { start: '2025-01-01', end: '2025-01-07' },
  };
}

describe('computeBaselineComparisons', () => {
  it('produces sleep comparison when today is below 30-day average', () => {
    const result = computeBaselineComparisons({
      today: daily({
        date: '2025-01-08',
        sleepMinutes: 240, // 4 h
        steps: 5000,
        activeEnergyKcal: 200,
      }),
      last7: summary({ avgSleepMinutes: 400, avgSteps: 6000 }),
      last30: summary({ avgSleepMinutes: 420, avgSteps: 5500 }),
    });
    const sleepComp = result.find((r) => r.metric === 'sleep');
    expect(sleepComp).toBeDefined();
    expect(sleepComp!.direction).toBe('below');
    expect(sleepComp!.summary).toMatch(/less than your 30-day average/);
    expect(sleepComp!.currentValue).toBe(240);
    expect(sleepComp!.baselineValue).toBe(420);
  });

  it('produces steps comparison when today is above baseline', () => {
    const result = computeBaselineComparisons({
      today: daily({
        date: '2025-01-08',
        steps: 12000,
        sleepMinutes: 420,
        activeEnergyKcal: 400,
      }),
      last7: summary({ avgSteps: 7000 }),
      last30: summary({ avgSteps: 6000 }),
    });
    const stepsComp = result.find((r) => r.metric === 'steps');
    expect(stepsComp).toBeDefined();
    expect(stepsComp!.direction).toBe('above');
    expect(stepsComp!.summary).toMatch(/more steps/);
  });

  it('produces heart rate comparison when both today and baseline have HR', () => {
    const result = computeBaselineComparisons({
      today: daily({
        date: '2025-01-08',
        restingHeartRateBpm: 78,
        sleepMinutes: 400,
        steps: 5000,
        activeEnergyKcal: 200,
      }),
      last7: summary({ avgRestingHeartRateBpm: 65 }),
      last30: summary({ avgRestingHeartRateBpm: 64 }),
    });
    const hrComp = result.find((r) => r.metric === 'resting_heart_rate');
    expect(hrComp).toBeDefined();
    expect(hrComp!.percentDiff).toBeGreaterThan(0);
    expect(hrComp!.direction).toBe('above');
  });

  it('returns empty comparisons when 30-day averages are zero', () => {
    const result = computeBaselineComparisons({
      today: daily({ date: '2025-01-08', sleepMinutes: 360, steps: 1000 }),
      last7: summary({ avgSleepMinutes: 0, avgSteps: 0 }),
      last30: summary({ avgSleepMinutes: 0, avgSteps: 0 }),
    });
    expect(result.length).toBe(0);
  });
});
