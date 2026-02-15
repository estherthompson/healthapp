/**
 * Pure baseline comparison logic: no I/O, testable with mock data.
 * Produces human-readable comparison strings from today vs 7/30-day averages.
 */

import type { BaselineComparison } from './types';
import type { DailyHealthMetrics, HealthMetricsSummary } from '../health/types';

export interface BaselineInput {
  today: DailyHealthMetrics;
  last7: HealthMetricsSummary;
  last30: HealthMetricsSummary;
  /** Today's calories if available. */
  todayCalories?: number | null;
  /** 30-day average calories if available. */
  avgCalories30?: number | null;
}

function percentDiff(current: number, baseline: number): number | undefined {
  if (baseline === 0) return undefined;
  const pct = Math.round(((current - baseline) / baseline) * 100);
  return pct === 0 ? undefined : pct;
}

function direction(current: number, baseline: number): 'below' | 'above' | 'same' {
  if (current < baseline) return 'below';
  if (current > baseline) return 'above';
  return 'same';
}

/**
 * Build baseline comparisons for sleep, steps, activity, heart rate, and calories.
 * All logic is pure and testable.
 */
export function computeBaselineComparisons(input: BaselineInput): BaselineComparison[] {
  const { today, last30 } = input;
  const out: BaselineComparison[] = [];

  // Sleep vs 30-day
  if (last30.avgSleepMinutes > 0) {
    const diffMins = today.sleepMinutes - last30.avgSleepMinutes;
    const dir = direction(today.sleepMinutes, last30.avgSleepMinutes);
    const hours = Math.abs(diffMins) / 60;
    const summary =
      diffMins === 0
        ? 'Your sleep is in line with your 30-day average.'
        : diffMins > 0
          ? `You slept ${hours.toFixed(1)} hours more than your 30-day average.`
          : `You slept ${hours.toFixed(1)} hours less than your 30-day average.`;
    out.push({
      metric: 'sleep',
      summary,
      currentValue: today.sleepMinutes,
      baselineValue: last30.avgSleepMinutes,
      direction: dir,
      percentDiff: percentDiff(today.sleepMinutes, last30.avgSleepMinutes),
    });
  }

  // Steps vs 30-day
  if (last30.avgSteps > 0) {
    const diff = today.steps - last30.avgSteps;
    const dir = direction(today.steps, last30.avgSteps);
    const summary =
      diff === 0
        ? 'Your step count matches your 30-day average.'
        : diff > 0
          ? `You have ${diff.toLocaleString()} more steps than your 30-day average.`
          : `You have ${Math.abs(diff).toLocaleString()} fewer steps than your 30-day average.`;
    out.push({
      metric: 'steps',
      summary,
      currentValue: today.steps,
      baselineValue: last30.avgSteps,
      direction: dir,
      percentDiff: percentDiff(today.steps, last30.avgSteps),
    });
  }

  // Active energy vs 30-day
  if (last30.avgActiveEnergyKcal > 0) {
    const diff = today.activeEnergyKcal - last30.avgActiveEnergyKcal;
    const dir = direction(today.activeEnergyKcal, last30.avgActiveEnergyKcal);
    const summary =
      diff === 0
        ? 'Your active burn is in line with your 30-day average.'
        : diff > 0
          ? `You burned ${diff} more calories (activity) than your 30-day average.`
          : `You burned ${Math.abs(diff)} fewer active calories than your 30-day average.`;
    out.push({
      metric: 'active_energy',
      summary,
      currentValue: today.activeEnergyKcal,
      baselineValue: last30.avgActiveEnergyKcal,
      direction: dir,
      percentDiff: percentDiff(today.activeEnergyKcal, last30.avgActiveEnergyKcal),
    });
  }

  // Resting heart rate vs 30-day
  if (
    today.restingHeartRateBpm != null &&
    last30.avgRestingHeartRateBpm != null &&
    last30.avgRestingHeartRateBpm > 0
  ) {
    const diff = today.restingHeartRateBpm - last30.avgRestingHeartRateBpm;
    const dir = direction(today.restingHeartRateBpm, last30.avgRestingHeartRateBpm);
    const pct = percentDiff(today.restingHeartRateBpm, last30.avgRestingHeartRateBpm);
    const summary =
      diff === 0
        ? 'Your resting heart rate is in line with your 30-day average.'
        : pct != null
          ? `Your resting heart rate is ${Math.abs(pct)}% ${dir === 'above' ? 'higher' : 'lower'} than your baseline.`
          : `Your resting heart rate is ${diff > 0 ? 'higher' : 'lower'} than your 30-day average.`;
    out.push({
      metric: 'resting_heart_rate',
      summary,
      currentValue: today.restingHeartRateBpm,
      baselineValue: last30.avgRestingHeartRateBpm,
      direction: dir,
      percentDiff: pct,
    });
  }

  // Calories (nutrition) vs baseline when available
  if (
    input.todayCalories != null &&
    input.avgCalories30 != null &&
    input.avgCalories30 > 0
  ) {
    const diff = input.todayCalories - input.avgCalories30;
    const dir = direction(input.todayCalories, input.avgCalories30);
    const summary =
      diff === 0
        ? 'Your calorie intake is in line with your usual.'
        : diff > 0
          ? `You consumed ${diff} more calories than usual.`
          : `You consumed ${Math.abs(diff)} fewer calories than usual.`;
    out.push({
      metric: 'calories',
      summary,
      currentValue: input.todayCalories,
      baselineValue: input.avgCalories30,
      direction: dir,
      percentDiff: percentDiff(input.todayCalories, input.avgCalories30),
    });
  }

  return out;
}
