import { useCallback, useEffect, useState } from 'react';
import {
  checkAvailability,
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
      await refreshMetrics();
      if (cancelled) return;
      setStatus('not_requested');
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
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
    refreshSteps: refreshMetrics,
  };
}
