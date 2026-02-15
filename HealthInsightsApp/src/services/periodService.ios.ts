import {
  requestAuthorization,
  saveCategorySample,
  queryCategorySamples,
  isHealthDataAvailable,
} from '@kingstinct/react-native-healthkit';

const MENSTRUAL_TYPE = 'HKCategoryTypeIdentifierMenstrualFlow';

export type FlowLevel = 'light' | 'medium' | 'heavy';

// HKCategoryValueMenstrualFlow: light=2, medium=3, heavy=4
const flowToHK: Record<FlowLevel, number> = {
  light: 2,
  medium: 3,
  heavy: 4,
};

export async function requestPeriodPermission(): Promise<boolean> {
  const available = await isHealthDataAvailable();
  if (!available) return false;
  try {
    await requestAuthorization({
      toRead: [MENSTRUAL_TYPE],
      toWrite: [MENSTRUAL_TYPE],
    });
    return true;
  } catch {
    return false;
  }
}

function dayStart(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function dayEnd(d: Date): Date {
  const start = dayStart(d);
  start.setDate(start.getDate() + 1);
  start.setMilliseconds(start.getMilliseconds() - 1);
  return start;
}

export async function logPeriod(
  startDate: Date,
  endDate: Date,
  flow: FlowLevel
): Promise<void> {
  const value = flowToHK[flow];
  const start = dayStart(startDate);
  let current = new Date(start);
  const end = dayStart(endDate);

  const periodStartTime = start.getTime();
  while (current.getTime() <= end.getTime()) {
    const dayStartDate = new Date(current);
    const dayEndDate = dayEnd(current);
    const isCycleStart = dayStartDate.getTime() === periodStartTime;
    await saveCategorySample(
      MENSTRUAL_TYPE as any,
      value as any,
      dayStartDate,
      dayEndDate,
      { HKMetadataKeyMenstrualCycleStart: isCycleStart }
    );
    current.setDate(current.getDate() + 1);
  }
}

export interface PeriodEntry {
  date: string; // YYYY-MM-DD
  flow: FlowLevel;
}

export async function getRecentPeriodEntries(limitDays: number = 90): Promise<PeriodEntry[]> {
  try {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - limitDays);
    const samples = await queryCategorySamples(
      MENSTRUAL_TYPE as any,
      {
        limit: 500,
        ascending: false,
        filter: { date: { startDate: start, endDate: end } },
      }
    );
    const entries: PeriodEntry[] = [];
    const flowFromHK = (v: number): FlowLevel => {
      if (v === 2) return 'light';
      if (v === 3) return 'medium';
      if (v === 4) return 'heavy';
      return 'light';
    };
    for (const s of samples) {
      const sample = s as { startDate: Date; endDate: Date; value: number };
      const dateStr = new Date(sample.startDate).toISOString().slice(0, 10);
      entries.push({ date: dateStr, flow: flowFromHK(sample.value) });
    }
    entries.sort((a, b) => b.date.localeCompare(a.date));
    return entries;
  } catch {
    return [];
  }
}
