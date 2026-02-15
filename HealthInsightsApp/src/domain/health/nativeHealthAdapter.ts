/**
 * Native health adapter: wraps existing healthService (HealthKit / Health Connect).
 * Provides only today's metrics from the device; 7/30-day summaries use mock data
 * when native APIs don't expose history (or when running on Windows without device).
 */

import {
  checkAvailability as nativeCheckAvailability,
  getAuthorizationStatus as nativeGetAuthorizationStatus,
  requestPermissions as nativeRequestPermissions,
  getTodayStepCount,
  getTodayDistanceKm,
  getTodayActiveEnergyKcal,
  getTodayFlightsClimbed,
  getTodayExerciseMinutes,
  getTodaySleepMinutes,
  getRestingHeartRateBpm,
} from '../../services/healthService';
import type {
  IHealthDataProvider,
  DailyHealthMetrics,
  HealthMetricsSummary,
  HealthStatus,
} from './types';
import { emptyDailyMetrics } from './types';
import { generateMockDailyMetrics } from './mockHealthProvider';

function summarizeDaily(daily: DailyHealthMetrics[]): HealthMetricsSummary {
  if (daily.length === 0) {
    return {
      avgSteps: 0,
      avgDistanceKm: 0,
      avgActiveEnergyKcal: 0,
      avgFlightsClimbed: 0,
      avgExerciseMinutes: 0,
      avgSleepMinutes: 0,
      avgRestingHeartRateBpm: null,
      sampleCount: 0,
      dateRange: { start: '', end: '' },
    };
  }
  const sum = daily.reduce(
    (acc, m) => ({
      steps: acc.steps + m.steps,
      distanceKm: acc.distanceKm + m.distanceKm,
      activeEnergyKcal: acc.activeEnergyKcal + m.activeEnergyKcal,
      flightsClimbed: acc.flightsClimbed + m.flightsClimbed,
      exerciseMinutes: acc.exerciseMinutes + m.exerciseMinutes,
      sleepMinutes: acc.sleepMinutes + m.sleepMinutes,
      hrSum: acc.hrSum + (m.restingHeartRateBpm ?? 0),
      hrN: acc.hrN + (m.restingHeartRateBpm != null ? 1 : 0),
    }),
    { steps: 0, distanceKm: 0, activeEnergyKcal: 0, flightsClimbed: 0, exerciseMinutes: 0, sleepMinutes: 0, hrSum: 0, hrN: 0 }
  );
  const n = daily.length;
  return {
    avgSteps: Math.round(sum.steps / n),
    avgDistanceKm: Math.round((sum.distanceKm / n) * 100) / 100,
    avgActiveEnergyKcal: Math.round(sum.activeEnergyKcal / n),
    avgFlightsClimbed: Math.round((sum.flightsClimbed / n) * 10) / 10,
    avgExerciseMinutes: Math.round(sum.exerciseMinutes / n),
    avgSleepMinutes: Math.round(sum.sleepMinutes / n),
    avgRestingHeartRateBpm: sum.hrN > 0 ? Math.round(sum.hrSum / sum.hrN) : null,
    sampleCount: n,
    dateRange: { start: daily[0]?.date ?? '', end: daily[n - 1]?.date ?? '' },
  };
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Adapter that uses native health APIs for "today" and falls back to mock for
 * 7/30-day summaries (native services in this app only expose today).
 * Use this on device when health is available; use mockHealthProvider on Windows.
 */
export const nativeHealthAdapter: IHealthDataProvider = {
  name: 'NativeHealth',

  async checkAvailability(): Promise<boolean> {
    return nativeCheckAvailability();
  },

  async getAuthorizationStatus(): Promise<HealthStatus> {
    return nativeGetAuthorizationStatus();
  },

  async requestPermissions(): Promise<HealthStatus> {
    return nativeRequestPermissions();
  },

  async getMetricsForDate(date: string): Promise<DailyHealthMetrics> {
    const isToday = date === todayStr();
    if (!isToday) {
      return emptyDailyMetrics(date);
    }
    try {
      const [steps, distanceKm, activeEnergyKcal, flightsClimbed, exerciseMinutes, sleepMinutes, restingHeartRateBpm] =
        await Promise.all([
          getTodayStepCount(),
          getTodayDistanceKm(),
          getTodayActiveEnergyKcal(),
          getTodayFlightsClimbed(),
          getTodayExerciseMinutes(),
          getTodaySleepMinutes(),
          getRestingHeartRateBpm(),
        ]);
      return {
        date,
        steps,
        distanceKm,
        activeEnergyKcal,
        flightsClimbed,
        exerciseMinutes,
        sleepMinutes,
        restingHeartRateBpm,
      };
    } catch {
      return emptyDailyMetrics(date);
    }
  },

  async get7DaySummary(endDate: string): Promise<HealthMetricsSummary> {
    const today = todayStr();
    const end = new Date(endDate);
    const daily: DailyHealthMetrics[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      const date = d.toISOString().slice(0, 10);
      if (date === today) {
        daily.push(await this.getMetricsForDate(today));
      } else {
        daily.push(generateMockDailyMetrics(date));
      }
    }
    return summarizeDaily(daily);
  },

  async get30DaySummary(endDate: string): Promise<HealthMetricsSummary> {
    const today = todayStr();
    const end = new Date(endDate);
    const daily: DailyHealthMetrics[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      const date = d.toISOString().slice(0, 10);
      if (date === today) {
        const todayMetrics = await this.getMetricsForDate(today);
        daily.push(todayMetrics);
      } else {
        daily.push(generateMockDailyMetrics(date));
      }
    }
    return summarizeDaily(daily);
  },
};
