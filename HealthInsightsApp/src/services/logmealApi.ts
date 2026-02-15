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

/** One detected dish from image recognition (top match per region). */
export interface LogMealRecognizedDish {
  id: number;
  name: string;
  prob: number;
}

/** One food region detected in the image. */
export interface LogMealSegmentationItem {
  food_item_position: number;
  recognition_results: Array<{ id: number; name: string; prob: number }>;
}

export interface LogMealRecognitionResponse {
  imageId: number;
  segmentation_results: LogMealSegmentationItem[];
  foodType?: { id: number; name: string };
  occasion?: string;
}

const DISHES_PATH = '/v2/dataset/dishes';
const SEGMENTATION_PATH = '/v2/image/segmentation/complete';

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

/**
 * Sends a food image to LogMeal for recognition (scan meal).
 * Uses APIUser token (userApiKey) if set, else company apiKey.
 * Returns detected food regions and top dish matches.
 * The image must be smaller than 1MB; use a resized/compressed URI (e.g. from picker with maxWidth/maxHeight/quality).
 */
export async function recognizeFoodImage(
  imageUri: string,
  options?: { language?: LogMealLanguage }
): Promise<LogMealRecognitionResponse> {
  const { baseUrl, apiKey, userApiKey } = LOGMEAL_CONFIG;
  // Scan endpoint requires API User token; prefer userApiKey over company apiKey
  const token = (userApiKey && !userApiKey.startsWith('YOUR_')) ? userApiKey : apiKey;
  if (!token || token.startsWith('YOUR_LOGMEAL_')) {
    throw new Error('LogMeal API key not set. Add your key in src/config/logmeal.ts (apiKey or userApiKey).');
  }

  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  } as unknown as Blob);

  const params = new URLSearchParams();
  if (options?.language) params.set('language', options.language);
  const url = `${baseUrl}${SEGMENTATION_PATH}${params.toString() ? `?${params.toString()}` : ''}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 401 && /user not allowed|APIUser|admin/i.test(text)) {
      throw new Error(
        'Scan meal requires an API User token from LogMeal (not the company key). ' +
        'In LogMeal dashboard create an API User and set its token as userApiKey in src/config/logmeal.ts. ' +
        'See https://logmeal.com/api/user-types/'
      );
    }
    throw new Error(`LogMeal API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json() as Promise<LogMealRecognitionResponse>;
}
