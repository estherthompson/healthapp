import { useCallback, useEffect, useState } from 'react';
import {
  checkAvailability,
  requestPermissions,
  getTodayStepCount,
  type HealthStatus,
} from '../services/healthService';

export function useHealth() {
  const [stepCount, setStepCount] = useState(0);
  const [status, setStatus] = useState<HealthStatus>('unknown');
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

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

  return {
    stepCount,
    status,
    available: available ?? false,
    loading,
    requestAuth,
    refreshSteps,
  };
}
