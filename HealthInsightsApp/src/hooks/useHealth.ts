import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import {
  checkAvailability,
  getAuthorizationStatus,
  requestPermissions,
  getTodayStepCount,
  getTodayDistanceKm,
  getTodayActiveEnergyKcal,
  getTodayFlightsClimbed,
  getTodayExerciseMinutes,
  getTodaySleepMinutes,
  getRestingHeartRateBpm,
  type HealthStatus,
} from '../services/healthService';

export function useHealth() {
  const [stepCount, setStepCount] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [activeEnergyKcal, setActiveEnergyKcal] = useState(0);
  const [flightsClimbed, setFlightsClimbed] = useState(0);
  const [exerciseMinutes, setExerciseMinutes] = useState(0);
  const [sleepMinutes, setSleepMinutes] = useState(0);
  const [restingHeartRateBpm, setRestingHeartRateBpm] = useState<number | null>(null);
  const [status, setStatus] = useState<HealthStatus>('unknown');
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const appState = useRef(AppState.currentState);

  const refreshMetrics = useCallback(async () => {
    const [
      steps,
      distance,
      activeKcal,
      flights,
      exercise,
      sleep,
      heartRate,
    ] = await Promise.all([
      getTodayStepCount(),
      getTodayDistanceKm(),
      getTodayActiveEnergyKcal(),
      getTodayFlightsClimbed(),
      getTodayExerciseMinutes(),
      getTodaySleepMinutes(),
      getRestingHeartRateBpm(),
    ]);
    setStepCount(steps);
    setDistanceKm(distance);
    setActiveEnergyKcal(activeKcal);
    setFlightsClimbed(flights);
    setExerciseMinutes(exercise);
    setSleepMinutes(sleep);
    setRestingHeartRateBpm(heartRate);
  }, []);

  const requestAuth = useCallback(async () => {
    setLoading(true);
    const newStatus = await requestPermissions();
    setStatus(newStatus);
    if (newStatus === 'authorized') await refreshMetrics();
    setLoading(false);
  }, [refreshMetrics]);

  // Initial load: check availability, auth status; auto-request permission if not yet requested
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const isAvailable = await checkAvailability();
      if (cancelled) return;
      setAvailable(isAvailable);
      if (!isAvailable) {
        setStatus('not_available');
        setLoading(false);
        return;
      }
      const authStatus = await getAuthorizationStatus();
      if (cancelled) return;
      setStatus(authStatus);
      if (authStatus === 'authorized') {
        await refreshMetrics();
      } else if (authStatus === 'not_requested') {
        setLoading(true);
        const newStatus = await requestPermissions();
        if (cancelled) return;
        setStatus(newStatus);
        if (newStatus === 'authorized') await refreshMetrics();
      }
      if (cancelled) return;
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshMetrics]);

  // Auto-refresh when app comes to foreground: re-check auth (in case user enabled in Settings) and refresh metrics
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
      if (appState.current === 'background' && nextState === 'active') {
        appState.current = nextState;
        const isAvailable = await checkAvailability();
        if (!isAvailable) return;
        const authStatus = await getAuthorizationStatus();
        setStatus(authStatus);
        if (authStatus === 'authorized') await refreshMetrics();
      } else {
        appState.current = nextState;
      }
    });
    return () => sub.remove();
  }, [refreshMetrics]);

  return {
    stepCount,
    distanceKm,
    activeEnergyKcal,
    flightsClimbed,
    exerciseMinutes,
    sleepMinutes,
    restingHeartRateBpm,
    status,
    available: available ?? false,
    loading,
    requestAuth,
    refreshMetrics,
  };
}
