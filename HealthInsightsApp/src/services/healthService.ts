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

export const getAuthorizationStatus =
  Platform.OS === 'ios'
    ? require('./healthService.ios').getAuthorizationStatus
    : require('./healthService.android').getAuthorizationStatus;

export const requestPermissions =
  Platform.OS === 'ios'
    ? require('./healthService.ios').requestPermissions
    : require('./healthService.android').requestPermissions;

export const getTodayStepCount =
  Platform.OS === 'ios'
    ? require('./healthService.ios').getTodayStepCount
    : require('./healthService.android').getTodayStepCount;

export const getTodayDistanceKm =
  Platform.OS === 'ios'
    ? require('./healthService.ios').getTodayDistanceKm
    : require('./healthService.android').getTodayDistanceKm;

export const getTodayActiveEnergyKcal =
  Platform.OS === 'ios'
    ? require('./healthService.ios').getTodayActiveEnergyKcal
    : require('./healthService.android').getTodayActiveEnergyKcal;

export const getTodayFlightsClimbed =
  Platform.OS === 'ios'
    ? require('./healthService.ios').getTodayFlightsClimbed
    : require('./healthService.android').getTodayFlightsClimbed;

export const getTodayExerciseMinutes =
  Platform.OS === 'ios'
    ? require('./healthService.ios').getTodayExerciseMinutes
    : require('./healthService.android').getTodayExerciseMinutes;

export const getTodaySleepMinutes =
  Platform.OS === 'ios'
    ? require('./healthService.ios').getTodaySleepMinutes
    : require('./healthService.android').getTodaySleepMinutes;

export const getRestingHeartRateBpm =
  Platform.OS === 'ios'
    ? require('./healthService.ios').getRestingHeartRateBpm
    : require('./healthService.android').getRestingHeartRateBpm;
