import { Platform } from 'react-native';

export type HealthStatus =
  | 'unknown'
  | 'not_available'
  | 'not_requested'
  | 'denied'
  | 'authorized';

export const checkAvailability =
  Platform.OS === 'ios'
    ? require('./healthService.ios').checkAvailability
    : require('./healthService.android').checkAvailability;

export const requestPermissions =
  Platform.OS === 'ios'
    ? require('./healthService.ios').requestPermissions
    : require('./healthService.android').requestPermissions;

export const getTodayStepCount =
  Platform.OS === 'ios'
    ? require('./healthService.ios').getTodayStepCount
    : require('./healthService.android').getTodayStepCount;

export const getTodayWaterLiters =
  Platform.OS === 'ios'
    ? require('./healthService.ios').getTodayWaterLiters
    : require('./healthService.android').getTodayWaterLiters;
