# BloomAi (React Native) – iOS-focused

iOS-first health app: Apple Health (HealthKit), period tracking, food diary, and an AI wellness chat that uses your data for symptom reasoning and misinformation checking. Android is supported but secondary.

## Stack

- **React Native** (bare, no Expo)
- **iOS:** [@kingstinct/react-native-healthkit](https://github.com/kingstinct/react-native-healthkit) for HealthKit (steps, sleep, heart rate, activity, etc.)
- **Android:** [react-native-health-connect](https://github.com/matinzd/react-native-health-connect) for Health Connect
- **Navigation:** React Navigation (bottom tabs)

## Prerequisites

- **Node.js** (see `engines` in `package.json`)
- **iOS:** Mac with Xcode 15+ and a **physical iPhone or iPad** (HealthKit does not work in the Simulator)
- **Android:** Optional; device or emulator with Health Connect

---

## Developing without a Mac (Windows / Linux)

If you have an iPhone and a Windows (or Linux) PC but **no Mac**, you can still do almost all development and testing:

- **Lint, typecheck, and run unit tests** (no simulator or device needed):
  ```bash
  cd HealthInsightsApp
  npm run validate
  ```
  This runs ESLint, TypeScript checking, and Jest (domain logic, baseline comparisons, AI response parsing, safety).

- **What you can edit:** All TypeScript/React, domain logic (`src/domain/`), services, and the iOS health implementation file. Tests use mock health data, so you don’t need HealthKit.

- **Full guide:** [docs/DEVELOPING_WITHOUT_MAC.md](docs/DEVELOPING_WITHOUT_MAC.md) – what you can do without a Mac and a short “when you get a Mac” checklist.

---

## How to run the app (when you have a Mac)

Commands below assume you’re in the **HealthInsightsApp** folder (or repo root, as noted).

### 1. Install JS dependencies

```bash
cd HealthInsightsApp
npm install
```

### 2. Run on iOS (physical device only)

1. **CocoaPods:**
   ```bash
   cd HealthInsightsApp/ios && pod install && cd ../..
   ```

2. **Open in Xcode:**
   ```bash
   open HealthInsightsApp/ios/HealthInsightsApp.xcworkspace
   ```
   Use the **`.xcworkspace`** file, not the `.xcodeproj`.

3. **Select your iPhone** as the run destination (top-left in Xcode). Do not choose a Simulator.

4. **Signing:** If prompted, open **Signing & Capabilities** for the HealthInsightsApp target, enable **Automatically manage signing**, and choose your **Team** (Apple ID).

5. **Run:** Press ▶️ in Xcode, or:
   ```bash
   cd HealthInsightsApp && npm run ios
   ```

6. **Metro:** If the app asks to connect to Metro, start it in a separate terminal:
   ```bash
   cd HealthInsightsApp && npm start
   ```

7. **On the device:** If you see “Untrusted Developer”, go to **Settings → General → VPN & Device Management**, tap your developer profile, and choose **Trust**. Then allow Health data access when the app asks.

### 3. Reloading vs rebuilding

- **Reload** (press **`r`** in the Metro terminal or shake device → Reload) for most JS/UI changes.
- **Rebuild** only when you add/remove native dependencies, change native code, or change iOS/Android project settings.

### 4. Run on Android (optional)

From **HealthInsightsApp**:

```bash
npm run android
```

Use an emulator or a device with Health Connect. Start Metro with `npm start` if the app needs to load the bundle.

---

## Project layout (iOS-focused)

| Path | Purpose |
|------|--------|
| `App.tsx` | Root with bottom tabs (Home, Chat, Food, Period) |
| `src/screens/` | HomeScreen, **ChatScreen** (symptom + misinformation), FoodDiaryScreen, PeriodScreen |
| `src/domain/health/` | Health data abstraction; **mock** (no Mac) and **native** (HealthKit on iOS) |
| `src/domain/context/` | Context aggregation, baseline comparisons (testable with mock data) |
| `src/domain/reasoning/` | AI prompts, response parsing, safety, misinformation mode |
| `src/services/healthService.ios.ts` | **HealthKit** implementation (steps, sleep, heart rate, activity, etc.) |
| `src/services/healthService.android.ts` | Health Connect implementation |
| `src/services/aiService.ts` | LLM calls (Groq/OpenRouter); see `src/config/ai.local.example.ts` |

- **Chat** uses aggregated context (health, nutrition, period, meds) and returns structured reasoning + disclaimers.
- **AI setup:** Copy `src/config/ai.local.example.ts` to `ai.local.ts` and add your API key (e.g. Groq). See [docs/AI_SETUP.md](docs/AI_SETUP.md).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run validate` | Lint + typecheck + test (use this when developing without a Mac) |
| `npm run lint` | ESLint only |
| `npm run typecheck` | TypeScript only (`tsc --noEmit`) |
| `npm run test` | Jest only |
| `npm start` | Start Metro bundler |
| `npm run ios` | Run on iOS (Mac + device) |
| `npm run android` | Run on Android |

---

## Notes

- HealthKit **requires a physical iPhone/iPad**; Simulator does not provide Health data.
- Do not commit API keys; use `src/config/*.local.ts` (gitignored) or env vars.
- Original Swift/iOS reference app: `../HealthInsightsChatbot` (if present).
