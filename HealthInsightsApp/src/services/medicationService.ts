import { Platform } from 'react-native';

export type { MedicationItem } from './medicationService.android';

export const requestMedicationPermission =
  Platform.OS === 'ios'
    ? require('./medicationService.ios').requestMedicationPermission
    : require('./medicationService.android').requestMedicationPermission;

export const getMedications =
  Platform.OS === 'ios'
    ? require('./medicationService.ios').getMedications
    : require('./medicationService.android').getMedications;
