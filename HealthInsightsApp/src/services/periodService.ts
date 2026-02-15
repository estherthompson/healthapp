import { Platform } from 'react-native';

export type FlowLevel = 'light' | 'medium' | 'heavy';

export interface PeriodEntry {
  date: string;
  flow: FlowLevel;
}

export const requestPeriodPermission =
  Platform.OS === 'ios'
    ? require('./periodService.ios').requestPeriodPermission
    : require('./periodService.android').requestPeriodPermission;

export const logPeriod =
  Platform.OS === 'ios'
    ? require('./periodService.ios').logPeriod
    : require('./periodService.android').logPeriod;

export const getRecentPeriodEntries =
  Platform.OS === 'ios'
    ? require('./periodService.ios').getRecentPeriodEntries
    : require('./periodService.android').getRecentPeriodEntries;
