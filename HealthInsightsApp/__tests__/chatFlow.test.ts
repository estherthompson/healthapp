/**
 * Full chatbot flow with mock Apple-Health-like data.
 * Proves: context aggregation → prompt build → (mock or real) AI → parse works.
 * Run with E2E_GROQ=1 to call real Groq once (requires ai.local.ts with API key).
 */

import { mockHealthProvider } from '../src/domain/health/mockHealthProvider';
import { aggregateContext } from '../src/domain/context/contextAggregator';
import type { ContextAggregatorDeps } from '../src/domain/context/contextAggregator';
import type {
  DailyNutrition,
  CycleContext,
  MedicationContext,
  UserProfileBasic,
  UserState,
  MedicalInfo,
} from '../src/domain/context/types';
import { buildSymptomReasoningPrompt } from '../src/domain/reasoning/promptBuilder';
import { parseReasoningResponse } from '../src/domain/reasoning/responseParser';

const today = '2025-02-15';

const stubDeps: ContextAggregatorDeps = {
  healthProvider: mockHealthProvider,
  getNutritionForDate: async (): Promise<DailyNutrition | null> => ({
    date: today,
    portionG: 450,
    calories: 1800,
  }),
  getCycleContext: async (): Promise<CycleContext | null> => ({
    phase: 'unknown',
    phaseLabel: 'No period data',
    hasPeriodData: false,
  }),
  getMedications: async (): Promise<MedicationContext> => ({
    items: [],
    available: false,
  }),
  getProfileBasic: async (): Promise<UserProfileBasic | null> => ({
    age: 28,
    sex: 'female',
  }),
  getState: async (): Promise<UserState | null> => ({ moodToday: null }),
  getMedicalInfo: async (): Promise<MedicalInfo | null> => ({
    medications: [],
    conditions: [{ id: 'c1', name: 'asthma', type: 'chronic' }],
    allergies: ['penicillin'],
    intolerances: [],
    infectionsOrDiseases: [],
  }),
};

describe('Chat flow with mock Apple-Health-like data', () => {
  it('aggregates context and builds a symptom prompt with health data', async () => {
    const context = await aggregateContext(today, stubDeps);

    expect(context.date).toBe(today);
    expect(context.today.steps).toBeGreaterThanOrEqual(0);
    expect(context.today.sleepMinutes).toBeGreaterThanOrEqual(0);
    expect(context.last7Days.avgSleepMinutes).toBeGreaterThan(0);
    expect(context.last30Days.avgSteps).toBeGreaterThan(0);
    expect(context.baselineComparisons.length).toBeGreaterThan(0);
    expect(context.nutrition?.portionG).toBe(450);
    expect(context.profile).toBeDefined();
    expect(context.profile?.age).toBe(28);
    expect(context.medical).toBeDefined();
    expect(context.medical?.allergies).toContain('penicillin');
    expect(context.medical?.conditions.map((c) => c.name)).toContain('asthma');

    const userMessage = 'I feel dizzy today. Should I go to the doctor?';
    const { system, user } = buildSymptomReasoningPrompt(userMessage, context);

    expect(system).toContain('reasoning assistant');
    expect(system).toContain('not a doctor');
    expect(user).toContain(userMessage);
    expect(user).toContain(context.date);
    expect(user).toContain(String(context.today.sleepMinutes));
    expect(user).toContain(String(context.today.steps));
    expect(user).toMatch(/baseline|comparison|30-day|7-day/i);
    expect(user).toContain('User profile:');
    expect(user).toContain('penicillin');
    expect(user).toContain('asthma');
  });

  it('parses a fixture AI response into structured reasoning', () => {
    const fixtureResponse = JSON.stringify({
      safety_alert: 'This is not medical advice. When in doubt, see a doctor.',
      baseline_comparison: [
        'You slept 2 hours less than your 30-day average.',
        'Your resting heart rate is 8% higher than baseline.',
      ],
      possible_causes: [
        {
          cause: 'Low sleep and elevated heart rate can contribute to dizziness.',
          confidence: 'medium',
          supporting_data: ['Sleep 4h vs 6h average', 'RHR 72 vs 66 baseline'],
          alternative_explanations: ['Dehydration', 'Low blood sugar'],
        },
      ],
      red_flags: ['If dizziness is severe or sudden, seek care.'],
      reflection_prompt: 'How does this compare to how you usually feel?',
      follow_up_questions: ['When did it start?', 'Have you eaten enough today?'],
    });

    const parsed = parseReasoningResponse(fixtureResponse);

    expect(parsed.safety_alert).toContain('not medical advice');
    expect(parsed.baseline_comparison).toHaveLength(2);
    expect(parsed.possible_causes).toHaveLength(1);
    expect(parsed.possible_causes[0].confidence).toBe('medium');
    expect(parsed.red_flags.length).toBeGreaterThan(0);
    expect(parsed.reflection_prompt).toBeTruthy();
    expect(parsed.follow_up_questions).toHaveLength(2);
  });

  it('full pipeline: aggregate → prompt → mock AI → parse', async () => {
    const context = await aggregateContext(today, stubDeps);
    const { user } = buildSymptomReasoningPrompt('I have a headache.', context);

    expect(user).toContain('2025-02-15');
    expect(user).toContain('headache');

    const mockAIResponse = JSON.stringify({
      safety_alert: 'Not medical advice. See a doctor if needed.',
      baseline_comparison: ['Compare to your usual sleep and activity.'],
      possible_causes: [
        {
          cause: 'Many factors can cause headaches.',
          confidence: 'low',
          supporting_data: [],
          alternative_explanations: [],
        },
      ],
      red_flags: [],
      reflection_prompt: 'How is your sleep and stress?',
      follow_up_questions: ['When did it start?'],
    });

    const parsed = parseReasoningResponse(mockAIResponse);
    expect(parsed.possible_causes[0].cause).toContain('headaches');
  });

  const runE2E = typeof process !== 'undefined' && process.env?.E2E_GROQ === '1';
  (runE2E ? it : it.skip)(
    'calls real Groq and parses response (run with E2E_GROQ=1, requires ai.local.ts)',
    async () => {
      const { chatCompletion } = require('../src/services/aiService');
      const context = await aggregateContext(today, stubDeps);
      const message = 'I feel a bit dizzy today.';
      const { system, user } = buildSymptomReasoningPrompt(message, context);

      const raw = await chatCompletion([
        { role: 'system', content: system },
        { role: 'user', content: user },
      ]);

      const parsed = parseReasoningResponse(raw);
      expect(parsed.safety_alert).toBeTruthy();
      expect(parsed.possible_causes.length).toBeGreaterThan(0);
      expect(['high', 'medium', 'low']).toContain(parsed.possible_causes[0].confidence);
    },
    20000
  );
});
