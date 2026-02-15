/**
 * AI response parser: tolerant of malformed JSON and missing fields.
 */

import {
  parseReasoningResponse,
  parseMisinformationResponse,
} from '../src/domain/reasoning/responseParser';

describe('parseReasoningResponse', () => {
  it('parses valid JSON with all fields', () => {
    const raw = JSON.stringify({
      safety_alert: 'Not medical advice.',
      baseline_comparison: ['You slept less than average.'],
      possible_causes: [
        {
          cause: 'Dehydration',
          confidence: 'high',
          supporting_data: ['Low intake noted'],
          alternative_explanations: ['Stress'],
        },
      ],
      red_flags: ['If severe, see a doctor.'],
      reflection_prompt: 'How do you feel?',
      follow_up_questions: ['When did it start?'],
    });
    const out = parseReasoningResponse(raw);
    expect(out.safety_alert).toBe('Not medical advice.');
    expect(out.baseline_comparison).toHaveLength(1);
    expect(out.possible_causes).toHaveLength(1);
    expect(out.possible_causes[0].confidence).toBe('high');
    expect(out.red_flags).toContain('If severe, see a doctor.');
    expect(out.reflection_prompt).toBe('How do you feel?');
    expect(out.follow_up_questions).toHaveLength(1);
  });

  it('strips markdown code fence and parses inner JSON', () => {
    const raw = '```json\n{"safety_alert":"OK","baseline_comparison":[],"possible_causes":[],"red_flags":[],"reflection_prompt":"?","follow_up_questions":[]}\n```';
    const out = parseReasoningResponse(raw);
    expect(out.safety_alert).toBe('OK');
  });

  it('returns fallback when JSON is invalid', () => {
    const out = parseReasoningResponse('not json at all');
    expect(out.safety_alert).toMatch(/not medical advice/i);
    expect(out.possible_causes.length).toBeGreaterThanOrEqual(1);
  });

  it('normalizes invalid confidence to medium', () => {
    const raw = JSON.stringify({
      safety_alert: 'x',
      baseline_comparison: [],
      possible_causes: [
        { cause: 'Y', confidence: 'invalid', supporting_data: [], alternative_explanations: [] },
      ],
      red_flags: [],
      reflection_prompt: '?',
      follow_up_questions: [],
    });
    const out = parseReasoningResponse(raw);
    expect(out.possible_causes[0].confidence).toBe('medium');
  });
});

describe('parseMisinformationResponse', () => {
  it('parses valid misinformation JSON', () => {
    const raw = JSON.stringify({
      claim_analyzed: 'Dizziness always means iron deficiency.',
      evidence_confidence: 'weak',
      common_misconceptions: ['Dizziness has many causes.'],
      alternative_explanations: ['Dehydration', 'Low blood pressure'],
      critical_evaluation_prompt: 'Consider multiple sources.',
      disclaimer: 'Not medical advice.',
    });
    const out = parseMisinformationResponse(raw);
    expect(out.claim_analyzed).toMatch(/iron/);
    expect(out.evidence_confidence).toBe('weak');
    expect(out.common_misconceptions).toHaveLength(1);
    expect(out.alternative_explanations).toHaveLength(2);
    expect(out.disclaimer).toBe('Not medical advice.');
  });

  it('returns fallback when JSON is invalid', () => {
    const out = parseMisinformationResponse('nope');
    expect(out.evidence_confidence).toBe('weak');
    expect(out.disclaimer).toMatch(/not medical advice/i);
  });
});
