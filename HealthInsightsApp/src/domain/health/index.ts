/**
 * Health data layer: abstract provider + mock + native adapter.
 * Use getHealthProvider() to obtain the appropriate provider (mock when native unavailable).
 */

import { Platform } from 'react-native';
import type { IHealthDataProvider } from './types';
import { mockHealthProvider } from './mockHealthProvider';
import { nativeHealthAdapter } from './nativeHealthAdapter';

/** Use mock when: not on iOS/Android, or in __DEV__ with no device. Caller can override. */
export function getHealthProvider(forceMock?: boolean): IHealthDataProvider {
  if (forceMock === true) return mockHealthProvider;
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return mockHealthProvider;
  return nativeHealthAdapter;
}

export type { IHealthDataProvider, DailyHealthMetrics, HealthMetricsSummary, HealthStatus } from './types';
export { emptyDailyMetrics } from './types';
export { mockHealthProvider, generateMockDailyMetrics } from './mockHealthProvider';
export { nativeHealthAdapter } from './nativeHealthAdapter';
