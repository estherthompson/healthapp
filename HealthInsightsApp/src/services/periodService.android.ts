import {
  initialize,
  requestPermission,
  getGrantedPermissions,
  insertRecords,
  readRecords,
} from 'react-native-health-connect';
import { MenstruationFlow } from 'react-native-health-connect';

export type FlowLevel = 'light' | 'medium' | 'heavy';

const flowToHC: Record<FlowLevel, number> = {
  light: MenstruationFlow.LIGHT,
  medium: MenstruationFlow.MEDIUM,
  heavy: MenstruationFlow.HEAVY,
};

function hasPermission(granted: { recordType?: string }[], recordType: string): boolean {
  return granted.some((p) => p.recordType === recordType);
}

export async function requestPeriodPermission(): Promise<boolean> {
  try {
    const inited = await initialize();
    if (!inited) return false;
    await requestPermission([
      { accessType: 'read', recordType: 'MenstruationFlow' },
      { accessType: 'write', recordType: 'MenstruationFlow' },
    ]);
    const granted = await getGrantedPermissions();
    return hasPermission(granted, 'MenstruationFlow');
  } catch {
    return false;
  }
}

function dayMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export async function logPeriod(
  startDate: Date,
  endDate: Date,
  flow: FlowLevel
): Promise<void> {
  const inited = await initialize();
  if (!inited) return;
  const flowValue = flowToHC[flow];
  const records: { recordType: 'MenstruationFlow'; time: string; flow: number }[] = [];
  let current = new Date(dayMidnight(startDate));
  const end = dayMidnight(endDate);

  while (current.getTime() <= end.getTime()) {
    const noon = new Date(current);
    noon.setHours(12, 0, 0, 0);
    records.push({
      recordType: 'MenstruationFlow',
      time: noon.toISOString(),
      flow: flowValue,
    });
    current.setDate(current.getDate() + 1);
  }

  if (records.length > 0) {
    await insertRecords(records);
  }
}

export interface PeriodEntry {
  date: string;
  flow: FlowLevel;
}

const flowFromHC = (v: number): FlowLevel => {
  if (v === MenstruationFlow.HEAVY) return 'heavy';
  if (v === MenstruationFlow.MEDIUM) return 'medium';
  return 'light';
};

export async function getRecentPeriodEntries(limitDays: number = 90): Promise<PeriodEntry[]> {
  try {
    const inited = await initialize();
    if (!inited) return [];
    const granted = await getGrantedPermissions();
    if (!hasPermission(granted, 'MenstruationFlow')) return [];
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - limitDays);
    const result = await readRecords('MenstruationFlow', {
      timeRangeFilter: {
        operator: 'between',
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      },
      limit: 500,
    } as any);
    const records = (result as { records?: { time: string; flow?: number }[] }).records ?? [];
    const entries: PeriodEntry[] = records.map((r) => ({
      date: r.time.slice(0, 10),
      flow: flowFromHC(r.flow ?? MenstruationFlow.LIGHT),
    }));
    entries.sort((a, b) => b.date.localeCompare(a.date));
    return entries;
  } catch {
    return [];
  }
}
