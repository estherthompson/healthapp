/**
 * API keys for the app. Never commit real keys.
 * Add your key in apiKeys.local.ts (copy from apiKeys.example.ts).
 * apiKeys.local.ts is gitignored.
 */
function getOpenAIKey(): string {
  try {
    const local = require('./apiKeys.local');
    return (local.OPENAI_API_KEY as string)?.trim() ?? '';
  } catch {
    return '';
  }
}

export const OPENAI_API_KEY = getOpenAIKey();
