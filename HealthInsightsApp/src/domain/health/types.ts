/**
 * Health data domain types and provider interface.
 * Abstracts Apple Health / Health Connect so the app can run with mock data on Windows.
 */

export type HealthStatus =
  | 'unknown'
  | 'not_available'
  | 'not_requested'
  | 'denied'
  | 'authorized';

/** Single-day metrics from a health source (device or mock). */
export interface DailyHealthMetrics {
  date: string; // YYYY-MM-DD
  steps: number;
  distanceKm: number;
  activeEnergyKcal: number;
  flightsClimbed: number;
  exerciseMinutes: number;
  sleepMinutes: number;
  restingHeartRateBpm: number | null;
}

/** Aggregates over a date range (e.g. 7-day or 30-day). */
export interface HealthMetricsSummary {
  avgSteps: number;
  avgDistanceKm: number;
  avgActiveEnergyKcal: number;
  avgFlightsClimbed: number;
  avgExerciseMinutes: number;
  avgSleepMinutes: number;
  avgRestingHeartRateBpm: number | null;
  sampleCount: number;
  dateRange: { start: string; end: string };
}

/**
 * Platform-agnostic health data provider.
 * Implementations: Native (iOS/Android) and Mock (for Windows/Expo Go).
 * All methods must be testable without a device; use mock for development.
 */
export interface IHealthDataProvider {
  readonly name: string;

  checkAvailability(): Promise<boolean>;
  getAuthorizationStatus(): Promise<HealthStatus>;
  requestPermissions(): Promise<HealthStatus>;

  /** Metrics for a single day (e.g. today). */
  getMetricsForDate(date: string): Promise<DailyHealthMetrics>;

  /** Optional: 7-day rolling summary ending on the given date. */
  get7DaySummary(endDate: string): Promise<HealthMetricsSummary>;

  /** Optional: 30-day rolling summary ending on the given date. */
  get30DaySummary(endDate: string): Promise<HealthMetricsSummary>;
}

/** Default empty metrics for a day with no data. */
export function emptyDailyMetrics(date: string): DailyHealthMetrics {
  return {
    date,
    steps: 0,
    distanceKm: 0,
    activeEnergyKcal: 0,
    flightsClimbed: 0,
    exerciseMinutes: 0,
    sleepMinutes: 0,
    restingHeartRateBpm: null,
  };
}
