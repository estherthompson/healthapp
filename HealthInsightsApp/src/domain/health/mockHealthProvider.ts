/**
 * Mock health data provider for development on Windows / Expo Go.
 * Generates plausible daily metrics and 7/30-day aggregates without Apple Health or Health Connect.
 */

import type {
  IHealthDataProvider,
  DailyHealthMetrics,
  HealthMetricsSummary,
  HealthStatus,
} from './types';

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(date: Date, n: number): Date {
  const out = new Date(date);
  out.setDate(out.getDate() + n);
  return out;
}

/** Seeded-ish randomness for reproducible mock data in tests. */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Generates one day of mock metrics. Same date always yields same values for reproducibility.
 */
export function generateMockDailyMetrics(date: string): DailyHealthMetrics {
  const seed = new Date(date).getTime();
  const r = (offset: number) => seededRandom(seed + offset);

  const baseSteps = 6000 + Math.round(r(1) * 6000);
  const baseSleep = 360 + Math.round(r(2) * 120); // 6–8 h in minutes
  const baseHeartRate = 58 + Math.round(r(3) * 18); // 58–76 bpm

  return {
    date,
    steps: Math.round(baseSteps * (0.7 + r(4) * 0.6)),
    distanceKm: Math.round((baseSteps * 0.00075) * 100) / 100,
    activeEnergyKcal: Math.round(200 + r(5) * 400),
    flightsClimbed: Math.round(r(6) * 15),
    exerciseMinutes: Math.round(r(7) * 45),
    sleepMinutes: Math.round(baseSleep * (0.85 + r(8) * 0.3)),
    restingHeartRateBpm: Math.round(baseHeartRate * (0.95 + r(9) * 0.1)),
  };
}

function summarize(daily: DailyHealthMetrics[]): HealthMetricsSummary {
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
    (acc, d) => ({
      steps: acc.steps + d.steps,
      distanceKm: acc.distanceKm + d.distanceKm,
      activeEnergyKcal: acc.activeEnergyKcal + d.activeEnergyKcal,
      flightsClimbed: acc.flightsClimbed + d.flightsClimbed,
      exerciseMinutes: acc.exerciseMinutes + d.exerciseMinutes,
      sleepMinutes: acc.sleepMinutes + d.sleepMinutes,
      heartRateSum: acc.heartRateSum + (d.restingHeartRateBpm ?? 0),
      heartRateCount: acc.heartRateCount + (d.restingHeartRateBpm != null ? 1 : 0),
    }),
    { steps: 0, distanceKm: 0, activeEnergyKcal: 0, flightsClimbed: 0, exerciseMinutes: 0, sleepMinutes: 0, heartRateSum: 0, heartRateCount: 0 }
  );

  const n = daily.length;
  const start = daily[0]?.date ?? '';
  const end = daily[daily.length - 1]?.date ?? '';

  return {
    avgSteps: Math.round(sum.steps / n),
    avgDistanceKm: Math.round((sum.distanceKm / n) * 100) / 100,
    avgActiveEnergyKcal: Math.round(sum.activeEnergyKcal / n),
    avgFlightsClimbed: Math.round((sum.flightsClimbed / n) * 10) / 10,
    avgExerciseMinutes: Math.round(sum.exerciseMinutes / n),
    avgSleepMinutes: Math.round(sum.sleepMinutes / n),
    avgRestingHeartRateBpm:
      sum.heartRateCount > 0 ? Math.round(sum.heartRateSum / sum.heartRateCount) : null,
    sampleCount: n,
    dateRange: { start, end },
  };
}

export const mockHealthProvider: IHealthDataProvider = {
  name: 'MockHealth',

  async checkAvailability(): Promise<boolean> {
    return true;
  },

  async getAuthorizationStatus(): Promise<HealthStatus> {
    return 'authorized';
  },

  async requestPermissions(): Promise<HealthStatus> {
    return 'authorized';
  },

  async getMetricsForDate(date: string): Promise<DailyHealthMetrics> {
    return generateMockDailyMetrics(date);
  },

  async get7DaySummary(endDate: string): Promise<HealthMetricsSummary> {
    const end = new Date(endDate);
    const daily: DailyHealthMetrics[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(end, -i);
      daily.push(generateMockDailyMetrics(dateStr(d)));
    }
    return summarize(daily);
  },

  async get30DaySummary(endDate: string): Promise<HealthMetricsSummary> {
    const end = new Date(endDate);
    const daily: DailyHealthMetrics[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = addDays(end, -i);
      daily.push(generateMockDailyMetrics(dateStr(d)));
    }
    return summarize(daily);
  },
};
