import {
  initialize,
  requestPermission,
  getGrantedPermissions,
  aggregateRecord,
} from 'react-native-health-connect';

export type HealthStatus = 'unknown' | 'not_available' | 'not_requested' | 'denied' | 'authorized';

const PERMISSIONS = [
  { accessType: 'read' as const, recordType: 'Steps' },
  { accessType: 'read' as const, recordType: 'Distance' },
  { accessType: 'read' as const, recordType: 'ActiveCaloriesBurned' },
  { accessType: 'read' as const, recordType: 'FloorsClimbed' },
  { accessType: 'read' as const, recordType: 'ExerciseSession' },
  { accessType: 'read' as const, recordType: 'SleepSession' },
  { accessType: 'read' as const, recordType: 'RestingHeartRate' },
];

function getTodayRange(): { startTime: string; endTime: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return {
    startTime: start.toISOString(),
    endTime: now.toISOString(),
  };
}

const timeRange = () => ({
  timeRangeFilter: {
    operator: 'between' as const,
    ...getTodayRange(),
  },
});

function hasPermission(granted: { recordType?: string }[], recordType: string): boolean {
  return granted.some((p) => p.recordType === recordType);
}

export async function checkAvailability(): Promise<boolean> {
  try {
    return await initialize();
  } catch {
    return false;
  }
}

/** Check current Health Connect auth without prompting. */
export async function getAuthorizationStatus(): Promise<HealthStatus> {
  try {
    const inited = await initialize();
    if (!inited) return 'not_available';
    const granted = await getGrantedPermissions();
    return hasPermission(granted, 'Steps') ? 'authorized' : 'not_requested';
  } catch {
    return 'not_available';
  }
}

export async function requestPermissions(): Promise<HealthStatus> {
  try {
    const inited = await initialize();
    if (!inited) return 'not_available';
    await requestPermission(PERMISSIONS);
    const granted = await getGrantedPermissions();
    const hasSteps = hasPermission(granted, 'Steps');
    return hasSteps ? 'authorized' : 'denied';
  } catch {
    return 'denied';
  }
}

export async function getTodayStepCount(): Promise<number> {
  try {
    const inited = await initialize();
    if (!inited) return 0;
    const granted = await getGrantedPermissions();
    if (!hasPermission(granted, 'Steps')) return 0;
    const result = await aggregateRecord({
      recordType: 'Steps',
      ...timeRange(),
    });
    const count = (result as { COUNT_TOTAL?: number }).COUNT_TOTAL;
    return count ?? 0;
  } catch (_) {
    return 0;
  }
}

export async function getTodayDistanceKm(): Promise<number> {
  try {
    const inited = await initialize();
    if (!inited) return 0;
    const granted = await getGrantedPermissions();
    if (!hasPermission(granted, 'Distance')) return 0;
    const result = await aggregateRecord({
      recordType: 'Distance',
      ...timeRange(),
    });
    const dist = (result as { DISTANCE?: { inKilometers: number } }).DISTANCE;
    if (dist?.inKilometers != null) return Math.round(dist.inKilometers * 100) / 100;
  } catch (_) {}
  return 0;
}

export async function getTodayActiveEnergyKcal(): Promise<number> {
  try {
    const inited = await initialize();
    if (!inited) return 0;
    const granted = await getGrantedPermissions();
    if (!hasPermission(granted, 'ActiveCaloriesBurned')) return 0;
    const result = await aggregateRecord({
      recordType: 'ActiveCaloriesBurned',
      ...timeRange(),
    });
    const energy = (result as { ACTIVE_CALORIES_TOTAL?: { inKilocalories: number } })
      .ACTIVE_CALORIES_TOTAL;
    if (energy?.inKilocalories != null) return Math.round(energy.inKilocalories);
  } catch (_) {}
  return 0;
}

export async function getTodayFlightsClimbed(): Promise<number> {
  try {
    const inited = await initialize();
    if (!inited) return 0;
    const granted = await getGrantedPermissions();
    if (!hasPermission(granted, 'FloorsClimbed')) return 0;
    const result = await aggregateRecord({
      recordType: 'FloorsClimbed',
      ...timeRange(),
    });
    const total = (result as { FLOORS_CLIMBED_TOTAL?: number }).FLOORS_CLIMBED_TOTAL;
    return total != null ? Math.round(total) : 0;
  } catch (_) {}
  return 0;
}

export async function getTodayExerciseMinutes(): Promise<number> {
  try {
    const inited = await initialize();
    if (!inited) return 0;
    const granted = await getGrantedPermissions();
    if (!hasPermission(granted, 'ExerciseSession')) return 0;
    const result = await aggregateRecord({
      recordType: 'ExerciseSession',
      ...timeRange(),
    });
    const duration = (result as { EXERCISE_DURATION_TOTAL?: { inSeconds: number } })
      .EXERCISE_DURATION_TOTAL;
    if (duration?.inSeconds != null) return Math.round(duration.inSeconds / 60);
  } catch (_) {}
  return 0;
}

export async function getTodaySleepMinutes(): Promise<number> {
  try {
    const inited = await initialize();
    if (!inited) return 0;
    const granted = await getGrantedPermissions();
    if (!hasPermission(granted, 'SleepSession')) return 0;
    const result = await aggregateRecord({
      recordType: 'SleepSession',
      ...timeRange(),
    });
    const total = (result as { SLEEP_DURATION_TOTAL?: number }).SLEEP_DURATION_TOTAL;
    if (total != null) return Math.round(total / 60);
  } catch (_) {}
  return 0;
}

export async function getRestingHeartRateBpm(): Promise<number | null> {
  try {
    const inited = await initialize();
    if (!inited) return null;
    const granted = await getGrantedPermissions();
    if (!hasPermission(granted, 'RestingHeartRate')) return null;
    const result = await aggregateRecord({
      recordType: 'RestingHeartRate',
      ...timeRange(),
    });
    const avg = (result as { BPM_AVG?: number }).BPM_AVG;
    if (avg != null) return Math.round(avg);
  } catch (_) {}
  return null;
}
