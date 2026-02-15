import React, { createContext, useContext, useState, useCallback } from 'react';

export type ProfileData = {
  pregnant: 'yes' | 'no' | null;
  pregnancyWeeks: string;
  breastfeeding: 'yes' | 'no' | null;
  breastfeedingDuration: string;
};

const defaultProfile: ProfileData = {
  pregnant: null,
  pregnancyWeeks: '',
  breastfeeding: null,
  breastfeedingDuration: '',
};

type AppDataContextValue = {
  profile: ProfileData;
  setProfile: (profile: ProfileData) => void;
  updateProfile: (updates: Partial<ProfileData>) => void;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<ProfileData>(defaultProfile);

  const setProfile = useCallback((p: ProfileData) => {
    setProfileState(p);
  }, []);

  const updateProfile = useCallback((updates: Partial<ProfileData>) => {
    setProfileState((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <AppDataContext.Provider value={{ profile, setProfile, updateProfile }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}

/**
 * Build a short summary of user data for the AI (profile + steps + water).
 * Used in chat so the bot can respond accordingly (e.g. pregnancy-safe advice, hydration).
 */
export function buildUserContextSummary(
  profile: ProfileData,
  todaySteps: number | null,
  todayWaterLiters: number | null = null
): string {
  const parts: string[] = [];
  if (profile.pregnant === 'yes') {
    parts.push(`Pregnant: yes${profile.pregnancyWeeks ? `, ${profile.pregnancyWeeks} weeks` : ''}.`);
  } else if (profile.pregnant === 'no') {
    parts.push('Pregnant: no.');
  }
  if (profile.breastfeeding === 'yes') {
    parts.push(`Breastfeeding: yes${profile.breastfeedingDuration ? `, ${profile.breastfeedingDuration}` : ''}.`);
  } else if (profile.breastfeeding === 'no') {
    parts.push('Breastfeeding: no.');
  }
  if (todaySteps !== null && todaySteps >= 0) {
    parts.push(`Today's steps: ${todaySteps}.`);
  }
  if (todayWaterLiters !== null && todayWaterLiters >= 0) {
    parts.push(`Today's water intake: ${todayWaterLiters.toFixed(1)} L.`);
  }
  if (parts.length === 0) return '';
  return 'Relevant user data from the app: ' + parts.join(' ');
}
