/**
 * AI config example – for reference only.
 * To hook up a real LLM: copy ai.local.example.ts to ai.local.ts and add your API key.
 *
 * Free options we recommend:
 * - Groq: https://console.groq.com (free tier, no card) → use endpoint + model from ai.local.example.ts
 * - OpenRouter: https://openrouter.ai (free models with :free suffix, e.g. gemma-2-9b-it:free)
 *
 * You can also set env vars (if your setup supports them):
 * - EXPO_PUBLIC_AI_ENDPOINT
 * - EXPO_PUBLIC_AI_API_KEY
 * - EXPO_PUBLIC_AI_MODEL
 */

export const AI_CONFIG = {
  endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  apiKey: 'YOUR_GROQ_API_KEY',
  model: 'llama-3.1-8b-instant',
};
