import { LOGMEAL_CONFIG } from '../config/logmeal';

export interface LogMealDishItem {
  id: number;
  name: string;
  portion_size: number;
  cooking_measures?: number[];
}

export interface LogMealDishesResponse {
  food: LogMealDishItem[];
  drinks: LogMealDishItem[];
  ingredients: LogMealDishItem[];
  sauces: LogMealDishItem[];
  combo: LogMealDishItem[];
  customRecipe: LogMealDishItem[];
}

export type LogMealLanguage = 'eng' | 'spa' | 'cat' | 'ita' | 'nld' | 'fre' | 'ger' | 'tur' | 'gre' | 'heb';

export interface GetDishesOptions {
  /** Three-letter ISO 639-2/T. Defaults to API user language or english. */
  language?: LogMealLanguage;
  /** Include cooking measure ids for each dish/ingredient. */
  cookingMeasures?: boolean;
}

const DISHES_PATH = '/v2/dataset/dishes';

/**
 * Fetches all dishes/products detectable by LogMeal image recognition.
 * Requires a valid API key in LOGMEAL_CONFIG.
 */
export async function getDishes(options?: GetDishesOptions): Promise<LogMealDishesResponse> {
  const { baseUrl, apiKey } = LOGMEAL_CONFIG;
  if (!apiKey || apiKey.startsWith('YOUR_LOGMEAL_')) {
    throw new Error('LogMeal API key not set. Add your company key in src/config/logmeal.ts (apiKey).');
  }

  const params = new URLSearchParams();
  if (options?.cookingMeasures) params.set('cooking_measures', '');
  if (options?.language) params.set('language', options.language);

  const url = `${baseUrl}${DISHES_PATH}${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LogMeal API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json() as Promise<LogMealDishesResponse>;
}
