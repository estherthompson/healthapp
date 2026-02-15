/**
 * Parses and validates AI responses into structured types.
 * Handles malformed JSON and missing fields safely.
 */

import type { ReasoningResponse, PossibleCause, ConfidenceLevel } from './types';
import type { MisinformationResponse } from './types';

const CONFIDENCE_LEVELS: ConfidenceLevel[] = ['high', 'medium', 'low'];

function ensureArray<T>(x: unknown, f: (item: unknown) => T): T[] {
  if (!Array.isArray(x)) return [];
  return x.map((item) => f(item)).filter(Boolean);
}

function ensureString(x: unknown, fallback: string): string {
  if (typeof x === 'string' && x.trim()) return x.trim();
  return fallback;
}

function parsePossibleCause(raw: unknown): PossibleCause | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const cause = ensureString(o.cause, '');
  if (!cause) return null;
  const confidence = CONFIDENCE_LEVELS.includes(o.confidence as ConfidenceLevel)
    ? (o.confidence as ConfidenceLevel)
    : 'medium';
  return {
    cause,
    confidence,
    supporting_data: ensureArray(o.supporting_data, (v) =>
      typeof v === 'string' ? v : ''
    ).filter(Boolean),
    alternative_explanations: ensureArray(o.alternative_explanations, (v) =>
      typeof v === 'string' ? v : ''
    ).filter(Boolean),
  };
}

/**
 * Parses raw AI text into ReasoningResponse. Tolerates markdown code fences.
 */
export function parseReasoningResponse(rawText: string): ReasoningResponse {
  let text = rawText.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) text = jsonMatch[0];

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return fallbackReasoningResponse('The response could not be parsed. Please try again.');
  }

  if (!parsed || typeof parsed !== 'object') {
    return fallbackReasoningResponse('Invalid response format.');
  }

  const o = parsed as Record<string, unknown>;
  const possible_causes = ensureArray(o.possible_causes, parsePossibleCause).filter(
    (c): c is PossibleCause => c !== null
  );

  return {
    safety_alert: ensureString(o.safety_alert, 'This is not medical advice. When in doubt, see a healthcare provider.'),
    baseline_comparison: ensureArray(o.baseline_comparison, (v) =>
      typeof v === 'string' ? v : ''
    ).filter(Boolean),
    possible_causes: possible_causes.length > 0 ? possible_causes : [
      {
        cause: 'Multiple factors could be involved. Consider discussing with a healthcare provider.',
        confidence: 'medium' as const,
        supporting_data: [],
        alternative_explanations: [],
      },
    ],
    red_flags: ensureArray(o.red_flags, (v) => (typeof v === 'string' ? v : '')).filter(Boolean),
    reflection_prompt: ensureString(o.reflection_prompt, 'How does this compare to how you usually feel?'),
    follow_up_questions: ensureArray(o.follow_up_questions, (v) =>
      typeof v === 'string' ? v : ''
    ).filter(Boolean),
  };
}

function fallbackReasoningResponse(reason: string): ReasoningResponse {
  return {
    safety_alert: 'This is not medical advice. When in doubt, see a healthcare provider.',
    baseline_comparison: [],
    possible_causes: [
      {
        cause: reason,
        confidence: 'low',
        supporting_data: [],
        alternative_explanations: [],
      },
    ],
    red_flags: [],
    reflection_prompt: 'Would you like to share more about your symptoms or context?',
    follow_up_questions: [],
  };
}

const EVIDENCE_LEVELS = ['strong', 'moderate', 'weak', 'unfounded'] as const;

/**
 * Parses raw AI text into MisinformationResponse.
 */
export function parseMisinformationResponse(rawText: string): MisinformationResponse {
  let text = rawText.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) text = jsonMatch[0];

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return {
      claim_analyzed: 'Could not parse the response.',
      evidence_confidence: 'weak',
      common_misconceptions: [],
      alternative_explanations: [],
      critical_evaluation_prompt: 'Consider checking multiple reliable sources and talking to a healthcare provider.',
      disclaimer: 'This is not medical advice.',
    };
  }

  if (!parsed || typeof parsed !== 'object') {
    return parseMisinformationResponse('');
  }

  const o = parsed as Record<string, unknown>;
  const evidence_confidence = EVIDENCE_LEVELS.includes(o.evidence_confidence as typeof EVIDENCE_LEVELS[number])
    ? (o.evidence_confidence as typeof EVIDENCE_LEVELS[number])
    : 'weak';

  return {
    claim_analyzed: ensureString(o.claim_analyzed, 'Unknown claim'),
    evidence_confidence,
    common_misconceptions: ensureArray(o.common_misconceptions, (v) =>
      typeof v === 'string' ? v : ''
    ).filter(Boolean),
    alternative_explanations: ensureArray(o.alternative_explanations, (v) =>
      typeof v === 'string' ? v : ''
    ).filter(Boolean),
    critical_evaluation_prompt: ensureString(
      o.critical_evaluation_prompt,
      'Consider discussing with a healthcare provider before drawing conclusions.'
    ),
    disclaimer: ensureString(o.disclaimer, 'This is not medical advice.'),
  };
}
