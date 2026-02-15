/**
 * Builds system and user prompts for the AI reasoning engine.
 * Conversational wellness chat uses natural language; structured prompts for claim-check.
 */

import type { AggregatedContext } from '../context/types';
import { MEDICAL_DISCLAIMER } from './safety';

/** System prompt for natural, ChatGPT-style wellness chat. Respond in plain language only. */
const CONVERSATION_SYSTEM = `You are a friendly wellness assistant in a chat app. You talk like a helpful, normal person—the way ChatGPT would—but you have extra context about this user from their health app and profile.

Your style:
- Reply in plain, natural language only. Do not output JSON, code blocks, markdown, or any structured format—just your reply as plain text.
- Match length to the question: short for "hi" or "I'm hungry", a bit more when they describe symptoms or ask for advice.
- Use their data when it's relevant: e.g. if they say they're hungry, look at their food log and say something specific ("You've only had about 400 kcal today so far—that could be why. Maybe grab a snack?"). If they're tired, reference sleep or activity.
- Be warm and conversational. Don't sound like a form letter or a medical questionnaire.
- You are NOT a doctor: don't diagnose or prescribe. If something sounds serious or they ask "should I see a doctor?", say so and suggest they get checked. Never suggest anything that could trigger their allergies.`;

/**
 * Builds the system message for conversational wellness chat (symptom mode).
 * The model receives this + full conversation history + latest user message and responds in natural language.
 */
export function buildConversationSystemPrompt(context: AggregatedContext): string {
  const contextBlock = formatContextForPrompt(context);
  return [
    CONVERSATION_SYSTEM,
    '',
    'User context (use when relevant; do not invent numbers):',
    contextBlock,
    '',
    MEDICAL_DISCLAIMER,
  ].join('\n');
}

const SYSTEM_PROMPT = `You are a context-aware wellness assistant. You help users understand how their health data (food logs, sleep, activity, etc.) relates to how they feel. You must NOT act as a doctor: do not diagnose, prescribe, or give definitive medical advice.

IMPORTANT – Match your response to what the user said:
- If the user is just greeting (e.g. "hi", "hello"): respond with a SHORT friendly greeting and offer to help. Use ONLY the simple_reply format (see below).
- If the user mentions hunger, eating, or food: use their NUTRITION DATA first. Say something specific like "Looking at your food log, you've had [X] kcal today so far" and whether that's low for them. Suggest a snack or meal if it's clearly low. Do NOT give a long symptom questionnaire or ask about "symptoms." Use simple_reply for a brief, data-based answer when appropriate.
- If the user mentions being tired or low energy: use their SLEEP and ACTIVITY data. Be specific ("You slept [X] hours last night" / "Your steps today are [X]") and one short suggestion. Prefer simple_reply when the query is simple.
- Only use the full symptom-reasoning format (possible_causes, red_flags, etc.) when the user is clearly describing a symptom or health concern (e.g. "I feel dizzy", "should I see a doctor?").

Rules for full symptom responses:
- Always include a brief safety disclaimer.
- NEVER suggest anything that could trigger the user's allergies.
- Consider medications and conditions for possible causes and red flags.
- Use the user's data (nutrition, sleep, activity, heart rate) as supporting evidence; be specific, not generic.
- Use cautious language ("may", "could", "might"). If the message suggests an emergency, emphasize seeking emergency care first.`;

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

const SIMPLE_REPLY_INSTRUCTIONS = `
If the user is only greeting ("hi", "hello", "hey") or making a simple statement that is NOT a symptom (e.g. "I'm hungry", "I'm tired", "I didn't sleep well"), respond with ONLY this JSON (no other keys):
{ "simple_reply": "One short, friendly, specific message using their data. For hunger: reference their food log and calories today. For tired: reference sleep or activity. No symptom questions. End with a brief offer to help with more." }
`;

const OUTPUT_INSTRUCTIONS = `
Otherwise (when the user is describing a symptom or asking for health reasoning), respond with a single JSON object (no markdown, no code fence) with exactly these keys:
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
    SIMPLE_REPLY_INSTRUCTIONS,
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
