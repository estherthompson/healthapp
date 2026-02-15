# Hooking up a real LLM (free options)

The wellness chat uses an OpenAI-compatible chat API. If no key is set, the app shows a **mock** response. To use a real model:

---

## Option 1: Groq (recommended – free, no credit card)

1. Sign up at **[console.groq.com](https://console.groq.com)**.
2. Create an API key: **[console.groq.com/keys](https://console.groq.com/keys)**.
3. In the project:
   - Copy `src/config/ai.local.example.ts` to `src/config/ai.local.ts`.
   - Open `ai.local.ts` and set `apiKey` to your Groq API key.
   - Leave `endpoint` and `model` as-is (they’re already set for Groq).

Example `ai.local.ts`:

```ts
export const AI_CONFIG = {
  endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  apiKey: 'gsk_xxxxxxxxxxxx',  // your key from Groq
  model: 'llama-3.1-8b-instruct',
};
```

Groq’s free tier has rate limits but is sufficient for development and light use.

---

## Option 2: OpenRouter (free models)

1. Sign up at **[openrouter.ai](https://openrouter.ai)** and get an API key at **[openrouter.ai/keys](https://openrouter.ai/keys)**.
2. Copy `src/config/ai.local.example.ts` to `src/config/ai.local.ts`.
3. Use the OpenRouter endpoint and a **free** model (models with `:free` in the name):

```ts
export const AI_CONFIG = {
  endpoint: 'https://openrouter.ai/api/v1/chat/completions',
  apiKey: 'YOUR_OPENROUTER_KEY',
  model: 'google/gemma-2-9b-it:free',  // or meta-llama/llama-3.1-8b-instruct:free
};
```

---

## File vs env vars

- **Local file (recommended):** `src/config/ai.local.ts` is gitignored. The app loads it automatically (see `src/config/ai.ts`). Use this so you never commit keys.
- **Env vars:** If your build supports env vars (e.g. Expo), you can set:
  - `EXPO_PUBLIC_AI_ENDPOINT`
  - `EXPO_PUBLIC_AI_API_KEY`
  - `EXPO_PUBLIC_AI_MODEL`  
  `ai.ts` will use these when `ai.local.ts` is not present.

---

## Security

- Do **not** commit `ai.local.ts` or put real keys in `ai.example.ts` / `ai.local.example.ts`.
- In production, prefer a backend that holds the API key and proxies requests so the key never ships in the app.
