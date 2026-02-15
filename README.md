# Health Insights Chatbot

Health data (steps) + AI wellness chatbot. **The main app is the React Native app** in `HealthInsightsApp/` (iOS + Android). The Swift app in `HealthInsightsChatbot/` is the original iOS-only prototype.

- **Run the app:** See [HealthInsightsApp/README.md](HealthInsightsApp/README.md) for setup and `npm run ios` / `npm run android`.

## Project Overview

This project follows a **3-phase approach** to avoid getting overwhelmed:

### Phase 1: HealthKit Foundation (CURRENT)
- [x] iOS SwiftUI app setup
- [x] HealthKit capability enabled
- [x] Permission request system
- [x] Basic step count reading
- [x] Simple UI displaying health data

### Phase 2: AI Chatbot Integration (NEXT)
- [ ] Health data summarization
- [ ] OpenAI API integration
- [ ] Simple chat interface
- [ ] Basic wellness insights

### Phase 3: Advanced Features (FUTURE)
- [ ] Weekly trends analysis
- [ ] Multiple health metrics
- [ ] Mood journaling
- [ ] Visual graphs and charts



## Getting Started

### Prerequisites
- Xcode 15.0 or later
- iOS 17.0 or later
- Physical iOS device (HealthKit doesn't work in simulator)

### Setup Instructions

1. **Open the project in Xcode:**
   ```bash
   open HealthInsightsChatbot.xcodeproj
   ```

2. **Configure your development team:**
   - Select the project in Xcode
   - Go to "Signing & Capabilities"
   - Select your development team
   - Update the bundle identifier if needed

3. **Build and run on a physical device:**
   - HealthKit requires a real device
   - The simulator won't show real health data

4. **Grant permissions:**
   - When prompted, allow access to Health data
   - The app will show your actual step count

## App Structure

```
HealthInsightsChatbot/
├── HealthInsightsChatbotApp.swift    # App entry point
├── ContentView.swift                 # Main UI
├── HealthKitManager.swift           # HealthKit integration
├── Info.plist                      # App permissions
└── HealthInsightsChatbot.entitlements # HealthKit capability
```

## Key Components

### HealthKitManager
- Handles HealthKit authorization
- Fetches step count data
- Observable object for SwiftUI integration

### ContentView
- Clean, modern UI
- Shows authorization status
- Displays step count prominently
- Phase 1 progress tracker

