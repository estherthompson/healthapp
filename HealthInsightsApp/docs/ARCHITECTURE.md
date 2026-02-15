# Health Reasoning Assistant – Architecture

This document describes the architecture for the context-aware AI health reasoning assistant. The design is **platform-agnostic** and supports **development on Windows** without macOS or Apple Health.

---

## 1. Folder structure

```
src/
├── config/                 # API keys, Firebase, AI endpoint (env-based)
│   ├── ai.ts
│   ├── ai.example.ts
│   ├── firebase.ts
│   └── logmeal.ts
├── domain/                 # Business logic (no UI, testable)
│   ├── health/             # Health data abstraction
│   │   ├── types.ts        # IHealthDataProvider, DailyHealthMetrics, HealthMetricsSummary
│   │   ├── mockHealthProvider.ts
│   │   ├── nativeHealthAdapter.ts
│   │   └── index.ts        # getHealthProvider()
│   ├── context/            # Context aggregation
│   │   ├── types.ts        # AggregatedContext, BaselineComparison, Nutrition, Cycle, Meds
│   │   ├── baselineComparisons.ts  # Pure comparison logic
│   │   ├── contextAggregator.ts    # aggregateContext()
│   │   ├── adapters.ts     # getNutritionForDate, getCycleContext, getMedicationContext
│   │   └── index.ts
│   └── reasoning/         # AI reasoning engine
│       ├── types.ts        # ReasoningResponse, MisinformationResponse
│       ├── promptBuilder.ts
│       ├── responseParser.ts
│       ├── safety.ts       # Emergency triggers, disclaimers
│       └── index.ts
├── services/              # I/O and platform-specific
│   ├── healthService.ts    # Platform dispatch → .ios / .android
│   ├── healthService.ios.ts
│   ├── healthService.android.ts
│   ├── medicationService.ts
│   ├── periodService.ts
│   ├── logmealApi.ts
│   ├── firestore.ts
│   └── aiService.ts        # chatCompletion() → LLM
├── storage/               # Local / cloud storage
│   ├── foodLogStore.ts
│   └── periodFeelingsStore.ts
├── hooks/
│   └── useHealth.ts
├── screens/
│   ├── HomeScreen.tsx
│   ├── ChatScreen.tsx      # Symptom + misinformation modes
│   ├── FoodDiaryScreen.tsx
│   └── PeriodScreen.tsx
└── components/
```

---

## 2. Data flow

1. **Health data ingestion (abstracted)**  
   - `IHealthDataProvider`: `getMetricsForDate(date)`, `get7DaySummary(endDate)`, `get30DaySummary(endDate)`.
   - **Mock**: `mockHealthProvider` – generates deterministic mock data; use on Windows / Expo Go.
   - **Native**: `nativeHealthAdapter` – uses existing `healthService` for “today”; 7/30-day can mix today from device and mock for other days until native history APIs are used.

2. **Provider selection**  
   - `getHealthProvider(forceMock?)`: returns mock when not on iOS/Android (e.g. web/Expo), or when `forceMock === true`.

3. **Context aggregation**  
   - `aggregateContext(date, deps)`:
     - Calls health provider + `getNutritionForDate`, `getCycleContext`, `getMedications`.
     - Builds `AggregatedContext`: today, last7Days, last30Days, nutrition, cycle, medications, **baselineComparisons**.
   - `computeBaselineComparisons()`: pure functions; testable with JSON/mock inputs.

4. **AI prompt builder**  
   - Symptom: `buildSymptomReasoningPrompt(userMessage, context)` → `{ system, user }`.
   - Misinformation: `buildMisinformationPrompt(claim)` → `{ system, user }`.
   - System prompt enforces: disclaimers, confidence levels, multiple causes, red flags, reflection, no definitive diagnosis.

5. **AI request**  
   - `aiService.chatCompletion(messages)` → raw string (OpenAI-compatible endpoint).
   - If no API key/endpoint configured, returns mock JSON for development.

6. **Response parsing**  
   - `parseReasoningResponse(raw)` → `ReasoningResponse`.
   - `parseMisinformationResponse(raw)` → `MisinformationResponse`.
   - Tolerates markdown-wrapped JSON; fallbacks for missing fields.

7. **Chat UI**  
   - ChatScreen: mode (symptom / misinformation), input, emergency banner if trigger detected, structured render of safety_alert, baseline_comparison, possible_causes, red_flags, reflection_prompt, follow_up_questions.

---

## 3. Separation of concerns

| Layer | Responsibility |
|-------|----------------|
| **Health ingestion** | `IHealthDataProvider` + mock / native implementations; no UI. |
| **Mock health provider** | Deterministic mock data for 7/30-day and single-day; runnable without device. |
| **Context aggregation** | Combine health + nutrition + cycle + meds; compute baseline comparisons (pure where possible). |
| **AI prompt builder** | Build system + user prompts with context and safety instructions. |
| **Chat response renderer** | Map `ReasoningResponse` / `MisinformationResponse` to UI; show disclaimers and emergency banner. |

---

## 4. Testability

- **Health**: Test `mockHealthProvider` and `computeBaselineComparisons` with fixed dates and JSON.
- **Context**: Test `aggregateContext` with a fake `IHealthDataProvider` and stub adapters (e.g. in-memory nutrition/cycle/meds).
- **Reasoning**: Test `parseReasoningResponse` / `parseMisinformationResponse` with sample JSON strings; test `detectEmergencyTrigger` with keyword strings.
- No dependency on iOS or HealthKit in tests; use mock provider and JSON fixtures.

---

## 5. Secure health data storage (recommendations)

- **On-device**: Prefer platform secure storage (e.g. Keychain / Keystore) for any cached tokens or keys; avoid storing raw health data in plain text in AsyncStorage for sensitive fields.
- **Transit**: Use HTTPS only for AI and any backend; do not send health data to third parties except as needed for the reasoning backend, with clear privacy policy.
- **Backend**: If you persist health or chat history on a server, encrypt at rest, use strict access control, and comply with HIPAA or local health-data regulations if applicable.
- **API keys**: Keep AI (and other) API keys out of source control; use `ai.example.ts` and env vars (e.g. `EXPO_PUBLIC_AI_API_KEY`); in production use a backend proxy that holds the key and forwards requests.

---

## 6. Guardrails (no hallucinated medical advice)

- **System prompt**: Explicit “do not diagnose or prescribe”; “use cautious, probabilistic language”; “multiple possible causes.”
- **Structured output**: Enforces `safety_alert`, `red_flags`, `confidence` (high/medium/low), and reflection/follow-up.
- **Emergency triggers**: `detectEmergencyTrigger()` scans user input; when matched, show emergency banner and suggest 911/ER.
- **UI**: Permanent disclaimer that the app is a reasoning assistant, not a doctor; red flags section always visible when present.

---

## 7. Windows / no-iOS development

- Use **mock health provider** (automatic when not on iOS/Android, or `getHealthProvider(true)`).
- Run and test on **Android emulator** or **Expo Go**; no Mac required.
- All aggregation and reasoning logic runs in JS/TS; no native HealthKit code path needed for feature development.
- When adding real 7/30-day history from HealthKit/Health Connect, extend `nativeHealthAdapter` (or add a dedicated history API) and keep the same `IHealthDataProvider` interface.
