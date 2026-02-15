import {
  requestMedicationsAuthorization,
  queryMedications,
} from '@kingstinct/react-native-healthkit';

export interface MedicationItem {
  name: string;
  nickname?: string | null;
  hasSchedule: boolean;
  isArchived: boolean;
}

export async function requestMedicationPermission(): Promise<boolean> {
  try {
    return await requestMedicationsAuthorization();
  } catch {
    return false;
  }
}

export async function getMedications(): Promise<MedicationItem[]> {
  try {
    const list = await queryMedications();
    return (list || []).map((m: { medication?: { displayText?: string }; nickname?: string | null; hasSchedule?: boolean; isArchived?: boolean }) => ({
      name: m.medication?.displayText ?? 'Unknown',
      nickname: m.nickname ?? null,
      hasSchedule: m.hasSchedule ?? false,
      isArchived: m.isArchived ?? false,
    }));
  } catch {
    return [];
  }
}
