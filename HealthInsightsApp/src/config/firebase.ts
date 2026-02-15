/**
 * Firebase client config for the app.
 * Do NOT use the Admin SDK JSON in the app – that file has a private key and is for server only.
 *
 * Get this config from Firebase Console:
 * Project (bloomai-574b1) → Project settings → General → Your apps → Add app (Web) → copy the config.
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
