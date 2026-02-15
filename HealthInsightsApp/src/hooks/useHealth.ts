import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import {
  checkAvailability,
  requestPermissions,
  getTodayStepCount,
  type HealthStatus,
} from '../services/healthService';

const STEPS_POLL_INTERVAL_MS = 30_000; // refresh every 30 seconds when app is open

export function useHealth() {
  const [stepCount, setStepCount] = useState(0);
  const [status, setStatus] = useState<HealthStatus>('unknown');
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const appState = useRef(AppState.currentState);

  const refreshSteps = useCallback(async () => {
    const steps = await getTodayStepCount();
    setStepCount(steps);
  }, []);

  const requestAuth = useCallback(async () => {
    setLoading(true);
    const newStatus = await requestPermissions();
    setStatus(newStatus);
    if (newStatus === 'authorized') await refreshSteps();
    setLoading(false);
  }, [refreshSteps]);

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
      const steps = await getTodayStepCount();
      if (cancelled) return;
      setStepCount(steps);
      setStatus('not_requested');
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-refresh: when app comes to foreground, and on an interval while open
  useEffect(() => {
    if (status !== 'authorized') return;

    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (appState.current.match(/inactive|background/) && nextState === 'active') {
          refreshSteps();
        }
        appState.current = nextState;
      }
    );

    const interval = setInterval(refreshSteps, STEPS_POLL_INTERVAL_MS);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [status, refreshSteps]);

  return {
    stepCount,
    status,
    available: available ?? false,
    loading,
    requestAuth,
  };
}
