# Developing for iOS without a Mac

This app is **iOS-focused**. If you have an iPhone and a Windows (or Linux) PC but no Mac, you can still do most development and testing on your computer. You’ll run the app on your iPhone only when you get access to a Mac (or a cloud Mac).

---

## What you can do without a Mac

All of this runs on Windows/Linux with **Node.js** and **npm** only:

### 1. Run the full check (lint + TypeScript + tests)

From the `HealthInsightsApp` folder:

```bash
npm run validate
```

This runs:

- **Lint** – ESLint on the codebase  
- **Typecheck** – `tsc --noEmit` (no build, just type checking)  
- **Tests** – Jest (domain logic, parsers, baseline comparisons)

If `validate` passes, the code is consistent and the testable logic works. No simulator or device needed.

### 2. Run individual commands

```bash
npm run lint      # ESLint only
npm run typecheck # TypeScript only
npm run test      # Jest only
```

### 3. What’s covered by tests (no iOS needed)

- **Context / baseline** – `computeBaselineComparisons()` with mock health data  
- **AI response parsing** – `parseReasoningResponse`, `parseMisinformationResponse`  
- **Safety** – emergency trigger detection (you can add more tests in `__tests__/`)  
- **Mock health provider** – deterministic metrics for any date  
- **Full chatbot flow** – `__tests__/chatFlow.test.ts`: aggregates context from mock “Apple Health” data, builds the symptom prompt, parses a fixture AI response. Proves the pipeline works with the right data shape.

All of this is in `src/domain/` and is written to be testable without HealthKit or any native code.

### 4. Verify the AI chatbot (with mock health data)

To confirm the chatbot pipeline works **assuming** you have the right data from Apple Health:

1. **Run the chatbot flow tests** (mock data only, no API key needed):
   ```bash
   npm run test:chat
   ```
   This runs the same flow as the app: aggregate context from “health” data → build prompt → parse AI response. The tests use the **mock health provider** (realistic sleep, steps, heart rate, etc.) so the data shape matches what HealthKit would provide on iOS.

2. **Optional: one real AI call** (uses your Groq key from `ai.local.ts`):
   - **Windows (PowerShell):** `$env:E2E_GROQ="1"; npm run test -- --testPathPattern=chatFlow --testTimeout=20000`
   - **Windows (Cmd):** `set E2E_GROQ=1 && npm run test -- --testPathPattern=chatFlow --testTimeout=20000`
   - **Mac/Linux:** `E2E_GROQ=1 npm run test -- --testPathPattern=chatFlow --testTimeout=20000`  
   One test will call Groq with the mock health context and assert the response parses. If it passes, the real AI works with that data.

### 5. Edit everything except native iOS code

You can safely change:

- All **TypeScript/React** – screens, components, hooks  
- **Domain logic** – `src/domain/` (health abstraction, context aggregation, reasoning, safety)  
- **Services** – AI, Firebase, LogMeal, etc.  
- **iOS health implementation** – `src/services/healthService.ios.ts` (it only runs on a Mac/device, but you can edit it)

Avoid editing **Swift** and **Xcode project files** unless you have a Mac to build and fix any breakage.

### 6. iOS-first design

- **Health:** The main implementation is HealthKit in `healthService.ios.ts`. The app uses an abstract health provider; on non‑iOS (e.g. Windows) it uses the **mock** provider so the same code paths run.
- **Chat, context, AI:** Identical on iOS and Android; no platform branching.
- When you run on a real iPhone (with a Mac), the app will use **HealthKit** automatically; no extra setup for “iOS mode.”

---

## When you get access to a Mac

1. **Clone/open the repo** on the Mac.  
2. **Install dependencies:**  
   `cd HealthInsightsApp && npm install`  
3. **Install CocoaPods:**  
   `cd ios && pod install && cd ..`  
4. **Open in Xcode:**  
   `open ios/HealthInsightsApp.xcworkspace`  
5. **Select your iPhone** (physical device; HealthKit doesn’t work in Simulator).  
6. **Signing:** In Xcode, set your Team under Signing & Capabilities.  
7. **Run** (▶️) and **connect your iPhone** via USB. Trust the developer certificate on the device if prompted.  
8. **Metro:** Start Metro with `npm start` in a terminal so the app can load the JS bundle (or use Xcode’s run, which can start Metro for you depending on setup).

After that, you can develop on the Mac and run on your iPhone as described in the main README.

---

## Summary

| Task                         | Without Mac | With Mac + iPhone   |
|-----------------------------|------------|---------------------|
| Lint, typecheck, unit tests | ✅ `npm run validate` | ✅ Same            |
| Edit TS/React/domain code   | ✅         | ✅                  |
| Run app on device           | ❌         | ✅ Xcode + iPhone   |
| Test HealthKit with real data | ❌       | ✅                  |

Focus on **`npm run validate`** and feature work in **`src/`**; when you have a Mac, use the README to run on your iPhone.
