# API keys (chatbot and other services)

**Where to add your API key**

1. **Copy** `apiKeys.example.ts` → **paste as** `apiKeys.local.ts` (same folder).
2. Open `apiKeys.local.ts` and set your key, e.g.:
   ```ts
   export const OPENAI_API_KEY = 'sk-your-key-here';
   ```
3. **Do not commit** `apiKeys.local.ts` — it is in `.gitignore`.

**Get an OpenAI key:** [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

The app reads the key from `apiKeys.ts`, which loads `apiKeys.local.ts` when it exists. Right now the chatbot uses local replies only; when you add an API (e.g. OpenAI), use `OPENAI_API_KEY` from `../config/apiKeys` in your API client.
