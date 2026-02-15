/**
 * Groq API key for the wellness chat.
 * Uses groq.local.ts if present (gitignored), else process.env from .env.
 * Copy groq.local.example.ts to groq.local.ts and add your key from https://console.groq.com
 */
const defaults = {
  apiKey:
    (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GROQ_API_KEY) || '',
};

let GROQ_CONFIG = defaults;
try {
  const local = require('./groq.local');
  if (local.GROQ_CONFIG?.apiKey) {
    GROQ_CONFIG = { apiKey: local.GROQ_CONFIG.apiKey };
  }
} catch {
  // no groq.local – use defaults (e.g. from .env)
}

export { GROQ_CONFIG };
