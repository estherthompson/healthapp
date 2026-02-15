import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import {
  checkAvailability,
  getAuthorizationStatus,
  requestPermissions,
  getTodayStepCount,
  getTodayWaterLiters,
  getTodayDistanceKm,
  getTodayActiveEnergyKcal,
  getTodayFlightsClimbed,
  getTodayExerciseMinutes,
  getTodaySleepMinutes,
  getRestingHeartRateBpm,
  type HealthStatus,
} from '../services/healthService';

const STEPS_POLL_INTERVAL_MS = 30_000; // refresh every 30 seconds when app is open

export function useHealth() {
  const [stepCount, setStepCount] = useState(0);
  const [waterLiters, setWaterLiters] = useState(0);
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
      water,
      distance,
      activeKcal,
      flights,
      exercise,
      sleep,
      heartRate,
    ] = await Promise.all([
      getTodayStepCount(),
      getTodayWaterLiters(),
      getTodayDistanceKm(),
      getTodayActiveEnergyKcal(),
      getTodayFlightsClimbed(),
      getTodayExerciseMinutes(),
      getTodaySleepMinutes(),
      getRestingHeartRateBpm(),
    ]);
    setStepCount(steps);
    setWaterLiters(water);
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

  // Initial load + availability check
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
      }
      if (cancelled) return;
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshMetrics]);

  // Auto-refresh: when app comes to foreground, and on an interval while open
  useEffect(() => {
    if (status !== 'authorized') return;

    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (appState.current.match(/inactive|background/) && nextState === 'active') {
          refreshMetrics();
        }
        appState.current = nextState;
      }
    );

    const interval = setInterval(refreshMetrics, STEPS_POLL_INTERVAL_MS);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [status, refreshMetrics]);

  return {
    stepCount,
    waterLiters,
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
