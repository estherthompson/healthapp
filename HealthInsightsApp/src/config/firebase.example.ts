/**
 * Copy this to firebase.ts and fill in the values from Firebase Console.
 *
 * The file you have (bloomai-574b1-firebase-adminsdk-....json) is the ADMIN SDK –
 * do NOT use it in the app. It contains a private key and is for server-side only.
 *
 * To get the CLIENT config for this app:
 * 1. Open https://console.firebase.google.com/ → project bloomai-574b1
 * 2. Project settings (gear) → General
 * 3. Under "Your apps", add a Web app if you haven’t (</> icon)
 * 4. Copy the firebaseConfig object (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId)
 * 5. Paste those values into src/config/firebase.ts (replace YOUR_... placeholders)
 *
 * Firestore collections (created automatically on first write):
 * - foodLog: each doc = one food entry (meal, name, portion_g, date, createdAt)
 * - periodFeelings: doc id = date (YYYY-MM-DD), fields { date, feeling }
 *
 * In Firebase Console → Firestore Database → Rules, allow read/write for development, e.g.:
 *   match /{document=**} { allow read, write: if true; }
 * (Tighten rules with auth when you add login.)
 */

export const FIREBASE_CONFIG = {
  apiKey: 'YOUR_WEB_APP_API_KEY',
  authDomain: 'bloomai-574b1.firebaseapp.com',
  projectId: 'bloomai-574b1',
  storageBucket: 'bloomai-574b1.firebasestorage.app',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_WEB_APP_ID',
};

export const COLLECTIONS = {
  FOOD_LOG: 'foodLog',
  PERIOD_FEELINGS: 'periodFeelings',
} as const;
