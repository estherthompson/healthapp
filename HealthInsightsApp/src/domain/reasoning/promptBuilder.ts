/**
 * Builds system and user prompts for the AI reasoning engine.
 * Uses aggregated context and enforces safety / critical-thinking instructions.
 */

import type { AggregatedContext } from '../context/types';
import { MEDICAL_DISCLAIMER } from './safety';

const SYSTEM_PROMPT = `You are a context-aware health reasoning assistant. Your role is to help users think critically about their symptoms using their own health data. You must NOT act as a doctor: do not diagnose, prescribe, or give definitive medical advice.

Rules:
- Always include a brief safety disclaimer (e.g. "This is not medical advice; when in doubt, see a doctor.").
- NEVER suggest anything that could trigger the user's allergies. If the user has listed allergies, treat them as strict constraints.
- Consider the user's current medications and conditions when suggesting possible causes or red flags; do not suggest anything that could interact badly with their meds or contradict their known conditions.
- Use age and sex only when relevant to normal ranges or likely causes (e.g. age for heart rate, sex for certain conditions).
- Identify possible causes with confidence levels (high / medium / low) and supporting evidence from the user's data.
- List red flags that warrant seeing a doctor or emergency care.
- Compare the user's situation to their baseline when relevant (sleep, activity, nutrition, heart rate).
- Offer multiple plausible explanations; avoid single definitive answers.
- Ask 1–3 short follow-up questions to clarify.
- End with a reflection prompt that encourages the user to consider their own context.
- Use cautious, probabilistic language ("may", "could", "might", "one possibility").
- If the user's message suggests an emergency, emphasize seeking emergency care first.`;

function formatContextForPrompt(ctx: AggregatedContext): string {
  const lines: string[] = [
    `Date: ${ctx.date}`,
    `Today: sleep ${ctx.today.sleepMinutes} min, steps ${ctx.today.steps}, active kcal ${ctx.today.activeEnergyKcal}, exercise ${ctx.today.exerciseMinutes} min, resting HR ${ctx.today.restingHeartRateBpm ?? 'N/A'} bpm.`,
    `7-day averages: sleep ${ctx.last7Days.avgSleepMinutes} min, steps ${ctx.last7Days.avgSteps}, active kcal ${ctx.last7Days.avgActiveEnergyKcal}, resting HR ${ctx.last7Days.avgRestingHeartRateBpm ?? 'N/A'} bpm.`,
    `30-day averages: sleep ${ctx.last30Days.avgSleepMinutes} min, steps ${ctx.last30Days.avgSteps}, active kcal ${ctx.last30Days.avgActiveEnergyKcal}, resting HR ${ctx.last30Days.avgRestingHeartRateBpm ?? 'N/A'} bpm.`,
  ];
  if (ctx.profile) {
    const p = ctx.profile;
    const parts: string[] = [];
    if (p.age != null) parts.push(`age ${p.age}`);
    if (p.sex) parts.push(`sex ${p.sex}`);
    if (p.heightCm != null) parts.push(`height ${p.heightCm} cm`);
    if (p.weightKg != null) parts.push(`weight ${p.weightKg} kg`);
    if (p.pregnancyOrBreastfeeding === true) parts.push('pregnancy or breastfeeding: yes');
    if (parts.length > 0) lines.push(`User profile: ${parts.join('; ')}.`);
  }
  if (ctx.state) {
    const s = ctx.state;
    const parts: string[] = [];
    if (s.stressLevel) parts.push(`stress: ${s.stressLevel}`);
    if (s.onPeriod === true) parts.push('on period' + (s.periodFlow ? ` (${s.periodFlow})` : ''));
    if (s.dietChange?.trim()) parts.push(`diet change: ${s.dietChange.trim()}`);
    if (s.currentlySick?.trim()) parts.push(`currently sick: ${s.currentlySick.trim()}`);
    if (s.moodToday?.trim()) parts.push(`mood today: ${s.moodToday.trim()}`);
    if (parts.length > 0) lines.push(`Current state: ${parts.join('; ')}.`);
  }
  if (ctx.medical) {
    const m = ctx.medical;
    if (m.allergies.length > 0) lines.push(`Allergies (never suggest triggers): ${m.allergies.join(', ')}.`);
    if (m.intolerances.length > 0) lines.push(`Intolerances: ${m.intolerances.join(', ')}.`);
    if (m.medications.length > 0) {
      const medLines = m.medications.map(
        (x) => `${x.name} (when: ${x.whenTake}${x.startDate ? `, started ${x.startDate}` : ''})`
      );
      lines.push(`Medications: ${medLines.join('; ')}.`);
    }
    if (m.conditions.length > 0) {
      const condLines = m.conditions.map((c) => `${c.name} (${c.type})`);
      lines.push(`Conditions: ${condLines.join('; ')}.`);
    }
    if (m.infectionsOrDiseases.length > 0) {
      const infLines = m.infectionsOrDiseases.map((i) => i.dateNoted ? `${i.name} (${i.dateNoted})` : i.name);
      lines.push(`Infections/diseases: ${infLines.join('; ')}.`);
    }
  }
  if (ctx.nutrition) {
    lines.push(
      `Nutrition today: portion ${ctx.nutrition.portionG} g` +
        (ctx.nutrition.calories != null ? `, ${ctx.nutrition.calories} kcal` : '') +
        '.'
    );
  }
  if (ctx.cycle?.hasPeriodData) {
    lines.push(`Cycle: ${ctx.cycle.phaseLabel}`);
  }
  if (ctx.medications?.available && ctx.medications.items.length > 0) {
    lines.push(
      `Medications: ${ctx.medications.items.map((m) => m.name).join(', ')}`
    );
  }
  if (ctx.baselineComparisons.length > 0) {
    lines.push('Baseline comparisons:');
    ctx.baselineComparisons.forEach((b) => lines.push(`- ${b.summary}`));
  }
  return lines.join('\n');
}

const OUTPUT_INSTRUCTIONS = `
Respond with a single JSON object (no markdown, no code fence) with exactly these keys:
- safety_alert (string): brief disclaimer and when to see a doctor
- baseline_comparison (array of strings): 2–4 short comparisons to user's baseline using the context above
- possible_causes (array of objects): each with cause, confidence ("high"|"medium"|"low"), supporting_data (array of strings), alternative_explanations (array of strings)
- red_flags (array of strings): signs that warrant medical attention
- reflection_prompt (string): one question to help the user reflect
- follow_up_questions (array of strings): 1–3 clarification questions
`;

/**
 * Builds the full prompt payload for symptom reasoning.
 */
export function buildSymptomReasoningPrompt(
  userMessage: string,
  context: AggregatedContext
): { system: string; user: string } {
  const userContent = [
    'User context (use this data; do not invent numbers):',
    formatContextForPrompt(context),
    '',
    'User message:',
    userMessage,
    OUTPUT_INSTRUCTIONS,
  ].join('\n');

  return {
    system: SYSTEM_PROMPT + '\n\n' + MEDICAL_DISCLAIMER,
    user: userContent,
  };
}

const MISINFO_SYSTEM = `You are a health misinformation analyst. The user will paste a claim they saw online. Your job is to:
- Analyze the claim without confirming or denying it as definitive truth
- Rate evidence confidence: "strong", "moderate", "weak", or "unfounded"
- List common misconceptions related to this claim
- Offer alternative explanations
- Encourage critical evaluation with a short prompt
- Include a disclaimer that you are not a doctor and this is not medical advice

Respond with a single JSON object (no markdown) with keys:
- claim_analyzed (string): the claim in your words
- evidence_confidence ("strong"|"moderate"|"weak"|"unfounded")
- common_misconceptions (array of strings)
- alternative_explanations (array of strings)
- critical_evaluation_prompt (string)
- disclaimer (string)`;

/**
 * Builds prompt for misinformation detection mode.
 */
export function buildMisinformationPrompt(claim: string): { system: string; user: string } {
  return {
    system: MISINFO_SYSTEM,
    user: `Claim to evaluate:\n"${claim}"\n\nRespond with the JSON object only.`,
  };
}
