export interface MedicationItem {
  name: string;
  nickname?: string | null;
  hasSchedule: boolean;
  isArchived: boolean;
}

export async function requestMedicationPermission(): Promise<boolean> {
  return false;
}

export async function getMedications(): Promise<MedicationItem[]> {
  return [];
}
