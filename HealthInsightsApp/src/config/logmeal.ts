/**
 * LogMeal API config.
 * Uses logmeal.local.ts if present (gitignored), else placeholders.
 * For local keys: copy logmeal.local.example.ts to logmeal.local.ts and add your keys.
 */
const defaults = {
  baseUrl: 'https://api.logmeal.com',
  apiKey: 'YOUR_LOGMEAL_COMPANY_API_KEY',
  userApiKey: 'YOUR_LOGMEAL_USER_API_KEY',
};

let LOGMEAL_CONFIG = defaults;
try {
  const local = require('./logmeal.local');
  if (local.LOGMEAL_CONFIG) LOGMEAL_CONFIG = local.LOGMEAL_CONFIG;
} catch {
  // no local override
}

export { LOGMEAL_CONFIG };
