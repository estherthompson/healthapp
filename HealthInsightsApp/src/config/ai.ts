/**
 * AI / LLM config for the health reasoning chat.
 * Uses ai.local.ts if present (gitignored), then env vars, then placeholders.
 * Copy ai.local.example.ts to ai.local.ts and add your API key – see that file for free options (Groq, OpenRouter).
 */

const defaults = {
  endpoint:
    typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_AI_ENDPOINT
      ? process.env.EXPO_PUBLIC_AI_ENDPOINT
      : 'YOUR_CHAT_COMPLETIONS_ENDPOINT',
  apiKey:
    typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_AI_API_KEY
      ? process.env.EXPO_PUBLIC_AI_API_KEY
      : 'YOUR_API_KEY',
  model:
    typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_AI_MODEL
      ? process.env.EXPO_PUBLIC_AI_MODEL
      : 'llama-3.1-8b-instant',
};

let AI_CONFIG = { ...defaults };
try {
  const local = require('./ai.local');
  if (local.AI_CONFIG) {
    AI_CONFIG = { ...defaults, ...local.AI_CONFIG };
  }
} catch {
  // no ai.local.ts – use defaults (env or placeholders)
}

export { AI_CONFIG };
