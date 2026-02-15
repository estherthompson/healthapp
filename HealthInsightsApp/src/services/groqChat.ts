/**
 * Groq chat API (OpenAI-compatible). Uses EXPO_PUBLIC_GROQ_API_KEY from .env
 */

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

export async function getGroqReply(
  apiKey: string,
  userMessage: string,
  history: ChatMessage[] = [],
  userContextSummary?: string
): Promise<string> {
  const key = apiKey?.trim();
  if (!key) {
    throw new Error('Groq API key is missing. Add EXPO_PUBLIC_GROQ_API_KEY to your .env file.');
  }

  let systemContent =
    'You are a friendly wellness and health assistant. Keep replies helpful, concise, and supportive. ' +
    'Important: Your suggestions are for general wellness only, not a diagnosis or medical advice. ' +
    'Always remind the user to see a doctor or healthcare professional for proper diagnosis and treatment, especially for symptoms like headaches, pain, or any health concern. ' +
    'Frame your advice clearly as suggestions only (e.g. "These are just suggestions—please see a doctor for proper care.").';
  if (userContextSummary?.trim()) {
    systemContent +=
      '\n\nUse this information about the user when answering. Base your suggestions on their data. For example: ' +
      userContextSummary +
      ' When they ask about symptoms (e.g. nausea, headache, tiredness), use their data to suggest possible reasons: e.g. if pregnant, mention pregnancy-related causes (morning sickness); if they have high step count, consider dehydration or hunger; consider hunger, dehydration, period, low blood sugar, or stress when relevant. Always tie your suggestions to what you know about them. Keep advice pregnancy-safe or breastfeeding-safe when applicable.';
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: systemContent },
    ...history.slice(-10),
    { role: 'user', content: userMessage },
  ];

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error ${res.status}: ${errText || res.statusText}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  return content || "I couldn't generate a reply. Please try again.";
}
