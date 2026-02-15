# BloomAi (React Native)

iOS + Android app: health data (steps, period, and more), period tracking, and in Phase 2, chat with an AI for wellness insights.

## Stack

- **React Native** (bare, no Expo)
- **iOS:** [@kingstinct/react-native-healthkit](https://github.com/kingstinct/react-native-healthkit) for HealthKit
- **Android:** [react-native-health-connect](https://github.com/matinzd/react-native-health-connect) for Health Connect
- **Navigation:** React Navigation (bottom tabs)

## Prerequisites

- Node.js (see `engines` in `package.json`)
- Xcode 15+ (iOS) / Android Studio (Android)
- **iOS:** Physical device (HealthKit does not work in the simulator)
- **Android:** Device or emulator with [Health Connect](https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata) installed (or Android 14+ where it’s built-in)

## How to run this application

All commands below are run from the **repo root** (the folder that contains `HealthInsightsApp`), unless noted.

### Connect to Metro (required for the app to load)

If the app shows **"Connect to Metro to develop JavaScript"** or a red error screen, the JavaScript bundler is not running. Start it and leave it running in a separate terminal:

```bash
cd HealthInsightsApp
npm start
```

Keep that terminal open. Then run the app from Xcode or `npm run ios` / `npm run android`. The app will connect to Metro and load your code.

### Do I need to rebuild every time?

**No.** For most changes (UI, screens, JavaScript/TypeScript, gradient colors, new components), you only need to **reload** the app: press **`r`** in the Metro terminal, or shake the device and tap **Reload**. The app fetches the latest JS from Metro.

**Rebuild** (run from Xcode or `npm run ios` / `npm run android` again) only when you:
- Add or remove a native dependency (e.g. a new npm package with native code)
- Change iOS/Android project settings (e.g. entitlements, Info.plist, AndroidManifest)
- Change native code (Swift, Kotlin, etc.)

### 1. Install JavaScript dependencies

```bash
cd HealthInsightsApp
npm install
cd ..
```

---

### 2. Run on iOS

**You need a physical iPhone or iPad.** HealthKit does not work in the iOS Simulator.

1. **Install CocoaPods dependencies** (from repo root):

   ```bash
   cd HealthInsightsApp/ios && pod install && cd ../..
   ```

2. **Open the workspace in Xcode** (use the `.xcworkspace` file, not the `.xcodeproj`):

   ```bash
   open HealthInsightsApp/ios/HealthInsightsApp.xcworkspace
   ```

3. **Select your physical device** as the run destination (top-left in Xcode, next to the Run button). Pick your connected iPhone/iPad by name—do not choose “iPhone 15 Simulator” or any simulator.

4. **Optional – Signing:** If Xcode asks for a team:
   - Select the **HealthInsightsApp** project in the left sidebar → **HealthInsightsApp** target → **Signing & Capabilities**.
   - Check **Automatically manage signing** and choose your **Team** (Apple ID).

5. **Run the app:**
   - Press the **Run** button in Xcode, or from the repo root:
     ```bash
     cd HealthInsightsApp && npm run ios
     ```

6. **On the device:** If you see “Untrusted Developer”, go to **Settings → General → VPN & Device Management**, tap your developer profile, and choose **Trust**. Then open the app again.

7. **In the app:** When prompted, allow access to Health data so the app can read your step count.

---

### 3. Run on Android

Use a device or emulator that has **Health Connect** (built-in on Android 14+, or install from the Play Store on older devices).

1. **From the repo root:**

   ```bash
   cd HealthInsightsApp && npm run android
   ```

2. **On the device:** If Health Connect isn’t set up, the system may ask you to enable a screen lock (PIN, pattern, or password). Grant the app **Steps** read access when prompted.

---

### Optional: Xcode signing (iOS)

If the app doesn’t install or run on your device:

- Open **HealthInsightsApp.xcworkspace** in Xcode.
- Click the **HealthInsightsApp** project (blue icon) in the left sidebar.
- Select the **HealthInsightsApp** target under **TARGETS**.
- Open the **Signing & Capabilities** tab.
- Enable **Automatically manage signing** and select your **Team** (your Apple ID). You can add an account under **Xcode → Settings → Accounts**.
- If Xcode suggests changing the **Bundle Identifier** (e.g. to make it unique), accept it.

The HealthKit entitlement is already in the project; you only need to set your team for signing.

## Project layout

- `App.tsx` – Root with bottom tabs (Home, Chat)
- `src/screens/HomeScreen.tsx` – Phase 1: health status, step count, refresh
- `src/screens/ChatScreen.tsx` – Phase 2 placeholder (AI chat)
- `src/services/healthService.ts` – Cross‑platform health API (steps, permissions)
- `src/services/healthService.ios.ts` – HealthKit implementation
- `src/services/healthService.android.ts` – Health Connect implementation
- `src/hooks/useHealth.ts` – React hook for health state and actions

## Phase 1 (current)

- Request health permission (HealthKit on iOS, Health Connect on Android)
- Show today’s step count and refresh
- Aurora-style gradient UI (purples, pinks, blues, greens)

## What can we track? (Steps is not the only thing)

Right now the app only reads **steps**. Both platforms support many more metrics; we can add them in Phase 2 or 3:

**iOS (HealthKit)**  
Steps, distance (walking/running), active energy, resting energy, heart rate, heart rate variability, sleep analysis, workouts (type, duration, calories), flights climbed, oxygen saturation, weight, mindful minutes, and 100+ other quantity/category types.

**Android (Health Connect)**  
Steps, distance, active/total calories burned, heart rate, sleep sessions, exercise sessions, weight, height, blood pressure, blood glucose, hydration, and more. Each type needs the right permission in `AndroidManifest.xml` and a corresponding read in the health service.

Adding a new metric means: (1) request the right permission, (2) read/aggregate that type in `healthService.ios.ts` and `healthService.android.ts`, (3) expose it in the summary for the chatbot.

## Phase 2 (next)

- Health data summarization
- OpenAI (or other) API integration
- Chat UI and wellness insights

## Notes

- The original Swift/iOS-only app lives in `../HealthInsightsChatbot` as a reference.
- Do not commit API keys; use env or a secure config for Phase 2.
