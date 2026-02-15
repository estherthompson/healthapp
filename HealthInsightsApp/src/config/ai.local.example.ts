/**
 * Copy this file to ai.local.ts and add your API key.
 * ai.local.ts is gitignored and will be used automatically.
 *
 * FREE OPTIONS (recommended):
 *
 * 1) GROQ (recommended – free tier, no credit card, very fast)
 *    - Sign up: https://console.groq.com
 *    - Create an API key: https://console.groq.com/keys
 *    - Use the config below (already filled for Groq).
 *
 * 2) OPENROUTER (many free models under one API)
 *    - Sign up: https://openrouter.ai
 *    - Keys: https://openrouter.ai/keys
 *    - Endpoint: https://openrouter.ai/api/v1/chat/completions
 *    - Model examples: "google/gemma-2-9b-it:free" or "meta-llama/llama-3.1-8b-instruct:free"
 */

export const AI_CONFIG = {
  // Groq (free) – uncomment and add your key:
  endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  apiKey: 'YOUR_GROQ_API_KEY', // from https://console.groq.com/keys
  model: 'llama-3.1-8b-instant',

  // OpenRouter (free models) – alternative; comment out Groq and use this:
  // endpoint: 'https://openrouter.ai/api/v1/chat/completions',
  // apiKey: 'YOUR_OPENROUTER_API_KEY',
  // model: 'google/gemma-2-9b-it:free',
};
