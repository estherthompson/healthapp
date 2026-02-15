/**
 * Safety guardrails: emergency triggers, disclaimers, and cautious language.
 * Prevents the AI from being presented as a replacement for a doctor.
 */

export const MEDICAL_DISCLAIMER =
  'I am a reasoning assistant to help you think through your symptoms with your own data. I am not a doctor and cannot diagnose or treat. When in doubt, see a healthcare provider or call emergency services.';

export const EMERGENCY_TRIGGERS = [
  'chest pain',
  'can\'t breathe',
  'difficulty breathing',
  'shortness of breath',
  'stroke',
  'paralysis',
  'unconscious',
  'severe bleeding',
  'suicide',
  'suicidal',
  'kill myself',
  'allergic reaction',
  'anaphylaxis',
  'seizure',
  'severe head injury',
  'poison',
  'overdose',
  'heart attack',
  'broken bone',
  'severe burn',
  'choking',
  'not breathing',
  'sudden severe pain',
  'vision loss',
  'cannot see',
  'thoughts of hurting',
  'thoughts of harming',
] as const;

/**
 * Returns true if the user message suggests an emergency.
 * Used to show urgent safety message and suggest 911/ER.
 */
export function detectEmergencyTrigger(userMessage: string): boolean {
  const lower = userMessage.toLowerCase().trim();
  return EMERGENCY_TRIGGERS.some((trigger) => lower.includes(trigger));
}

/**
 * Returns a short safety message when emergency triggers are detected.
 */
export function getEmergencySafetyMessage(): string {
  return 'If you or someone else is in immediate danger (e.g. chest pain, difficulty breathing, severe bleeding), please call emergency services (e.g. 911) or go to the nearest emergency room. This app cannot replace emergency care.';
}
