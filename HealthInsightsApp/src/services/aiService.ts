/** Chat completion against configured LLM; returns raw text. Mock used when not configured. */

import { AI_CONFIG } from '../config/ai';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const isConfigured = (): boolean =>
  !!AI_CONFIG.apiKey &&
  !AI_CONFIG.apiKey.includes('YOUR_') &&
  !!AI_CONFIG.endpoint &&
  !AI_CONFIG.endpoint.includes('YOUR_');

export async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  if (!isConfigured()) {
    return getMockStructuredResponse();
  }

  const res = await fetch(AI_CONFIG.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: AI_CONFIG.model,
      messages,
      temperature: 0.4,
      max_tokens: 1500,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI request failed: ${res.status} ${err}`);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('Invalid AI response format');
  }
  return content;
}

function getMockStructuredResponse(): string {
  return JSON.stringify({
    safety_alert:
      'This is a demo response. I am not a doctor. When in doubt, see a healthcare provider or call emergency services.',
    baseline_comparison: [
      'Compare your current sleep and activity to your 7-day and 30-day averages in the context above.',
      'Note any large changes in resting heart rate compared to your baseline.',
    ],
    possible_causes: [
      {
        cause: 'Multiple factors could contribute (sleep, hydration, stress, activity).',
        confidence: 'medium',
        supporting_data: ['Use your baseline data to see if sleep or activity changed recently.'],
        alternative_explanations: ['Consider discussing with a healthcare provider for personalized guidance.'],
      },
    ],
    red_flags: [
      'If symptoms are severe, sudden, or worsening, seek medical care.',
      'Chest pain, difficulty breathing, or neurological changes warrant immediate attention.',
    ],
    reflection_prompt: 'How does how you feel today compare to your usual baseline?',
    follow_up_questions: [
      'When did the symptoms start?',
      'Has your sleep or stress changed in the past few days?',
    ],
  });
}
