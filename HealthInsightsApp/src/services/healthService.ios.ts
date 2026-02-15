import {
  isHealthDataAvailable,
  requestAuthorization,
  queryStatisticsForQuantity,
} from '@kingstinct/react-native-healthkit';

const STEP_TYPE = 'HKQuantityTypeIdentifierStepCount';

function getTodayRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return { start, end: now };
}

export type HealthStatus = 'unknown' | 'not_available' | 'not_requested' | 'denied' | 'authorized';

export async function checkAvailability(): Promise<boolean> {
  return isHealthDataAvailable();
}

export async function requestPermissions(): Promise<HealthStatus> {
  const available = await isHealthDataAvailable();
  if (!available) return 'not_available';
  try {
    await requestAuthorization({ toRead: [STEP_TYPE] });
    return 'authorized';
  } catch {
    return 'denied';
  }
}

export async function getTodayStepCount(): Promise<number> {
  const { start, end } = getTodayRange();
  try {
    const result = await queryStatisticsForQuantity(
      STEP_TYPE,
      ['cumulativeSum'],
      { filter: { date: { startDate: start, endDate: end } } }
    );
    const sum = result?.sumQuantity;
    if (sum?.quantity != null) return Math.round(sum.quantity);
  } catch (_) {}
  return 0;
}
