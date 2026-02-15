import {
  initialize,
  requestPermission,
  getGrantedPermissions,
  aggregateRecord,
} from 'react-native-health-connect';

export type HealthStatus = 'unknown' | 'not_available' | 'not_requested' | 'denied' | 'authorized';

function getTodayRange(): { startTime: string; endTime: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return {
    startTime: start.toISOString(),
    endTime: now.toISOString(),
  };
}

export async function checkAvailability(): Promise<boolean> {
  try {
    const inited = await initialize();
    return inited;
  } catch {
    return false;
  }
}

export async function requestPermissions(): Promise<HealthStatus> {
  try {
    const inited = await initialize();
    if (!inited) return 'not_available';
    const granted = await requestPermission([
      { accessType: 'read', recordType: 'Steps' },
    ]);
    const hasSteps = granted.some(
      (p: { recordType?: string }) => p.recordType === 'Steps'
    );
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
    const hasSteps = granted.some(
      (p: { recordType?: string }) => p.recordType === 'Steps'
    );
    if (!hasSteps) return 0;
    const { startTime, endTime } = getTodayRange();
    const result = await aggregateRecord({
      recordType: 'Steps',
      timeRangeFilter: {
        operator: 'between',
        startTime,
        endTime,
      },
    });
    const count = (result as { COUNT_TOTAL?: number }).COUNT_TOTAL;
    return count ?? 0;
  } catch (_) {
    return 0;
  }
}
