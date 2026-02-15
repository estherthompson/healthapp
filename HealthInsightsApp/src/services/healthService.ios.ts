import {
  isHealthDataAvailable,
  requestAuthorization,
  getRequestStatusForAuthorization,
  authorizationStatusFor,
  queryStatisticsForQuantity,
  queryCategorySamples,
} from '@kingstinct/react-native-healthkit';

const READ_TYPES = [
  'HKQuantityTypeIdentifierStepCount',
  'HKQuantityTypeIdentifierDistanceWalkingRunning',
  'HKQuantityTypeIdentifierActiveEnergyBurned',
  'HKQuantityTypeIdentifierFlightsClimbed',
  'HKQuantityTypeIdentifierAppleExerciseTime',
  'HKQuantityTypeIdentifierRestingHeartRate',
  'HKCategoryTypeIdentifierSleepAnalysis',
] as const;

function getTodayRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return { start, end: now };
}

const dateFilter = () => {
  const { start, end } = getTodayRange();
  return { filter: { date: { startDate: start, endDate: end } } };
};

export type HealthStatus = 'unknown' | 'not_available' | 'not_requested' | 'denied' | 'authorized';

export async function checkAvailability(): Promise<boolean> {
  return isHealthDataAvailable();
}

/** Check current HealthKit auth without prompting. Use to avoid "Connect" when already authorized. */
export async function getAuthorizationStatus(): Promise<HealthStatus> {
  const available = await isHealthDataAvailable();
  if (!available) return 'not_available';
  try {
    const status = await getRequestStatusForAuthorization({ toRead: [...READ_TYPES] });
    // 2 = unnecessary (user already prompted). Check per-type status to avoid re-prompting.
    if (status === 2 /* AuthorizationRequestStatus.unnecessary */) {
      const stepAuth = authorizationStatusFor('HKQuantityTypeIdentifierStepCount' as any);
      // 2 = sharingAuthorized, 1 = sharingDenied, 0 = notDetermined
      if (stepAuth === 2) return 'authorized';
      if (stepAuth === 1) return 'denied';
    }
    return 'not_requested';
  } catch {
    return 'denied';
  }
}

export async function requestPermissions(): Promise<HealthStatus> {
  const available = await isHealthDataAvailable();
  if (!available) return 'not_available';
  try {
    await requestAuthorization({ toRead: [...READ_TYPES] });
    return 'authorized';
  } catch {
    return 'denied';
  }
}

async function querySum(
  identifier: string,
  unit?: string
): Promise<number> {
  const { start, end } = getTodayRange();
  try {
    const result = await queryStatisticsForQuantity(
      identifier as any,
      ['cumulativeSum'],
      { ...dateFilter(), unit }
    );
    const sum = result?.sumQuantity;
    if (sum?.quantity != null) return sum.quantity;
  } catch (_) {}
  return 0;
}

export async function getTodayStepCount(): Promise<number> {
  return Math.round(await querySum('HKQuantityTypeIdentifierStepCount'));
}

export async function getTodayDistanceKm(): Promise<number> {
  const km = await querySum(
    'HKQuantityTypeIdentifierDistanceWalkingRunning',
    'km'
  );
  return Math.round(km * 100) / 100;
}

export async function getTodayActiveEnergyKcal(): Promise<number> {
  const kcal = await querySum(
    'HKQuantityTypeIdentifierActiveEnergyBurned',
    'kcal'
  );
  return Math.round(kcal);
}

export async function getTodayFlightsClimbed(): Promise<number> {
  return Math.round(await querySum('HKQuantityTypeIdentifierFlightsClimbed'));
}

export async function getTodayExerciseMinutes(): Promise<number> {
  const minutes = await querySum(
    'HKQuantityTypeIdentifierAppleExerciseTime',
    'min'
  );
  return Math.round(minutes);
}

export async function getTodaySleepMinutes(): Promise<number> {
  const { start, end } = getTodayRange();
  try {
    const samples = await queryCategorySamples(
      'HKCategoryTypeIdentifierSleepAnalysis',
      {
        ...dateFilter(),
        limit: 500,
        ascending: true,
      }
    );
    let totalMs = 0;
    for (const s of samples) {
      const startDate = new Date((s as any).startDate).getTime();
      const endDate = new Date((s as any).endDate).getTime();
      totalMs += Math.max(0, endDate - startDate);
    }
    return Math.round(totalMs / 60_000);
  } catch (_) {}
  return 0;
}

export async function getRestingHeartRateBpm(): Promise<number | null> {
  const { start, end } = getTodayRange();
  try {
    const result = await queryStatisticsForQuantity(
      'HKQuantityTypeIdentifierRestingHeartRate' as any,
      ['discreteAverage', 'mostRecent'],
      { ...dateFilter(), unit: 'count/min' }
    );
    if (result?.mostRecentQuantity?.quantity != null)
      return Math.round(result.mostRecentQuantity.quantity);
    if (result?.averageQuantity?.quantity != null)
      return Math.round(result.averageQuantity.quantity);
  } catch (_) {}
  return null;
}
