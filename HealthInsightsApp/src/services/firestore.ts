import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  type Firestore,
} from 'firebase/firestore';
import { FIREBASE_CONFIG, COLLECTIONS } from '../config/firebase';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

function getDb(): Firestore {
  if (!db) {
    if (!getApps().length) {
      app = initializeApp(FIREBASE_CONFIG);
    }
    db = getFirestore(app ?? undefined);
  }
  return db;
}

/** Check if Firebase is configured (not placeholder). */
export function isFirebaseConfigured(): boolean {
  return (
    FIREBASE_CONFIG.apiKey !== 'YOUR_WEB_APP_API_KEY' &&
    !!FIREBASE_CONFIG.apiKey
  );
}

// --- foodLog collection ---
// Documents: { id?, meal, name, portion_g, date, createdAt }

export interface FoodLogDoc {
  id: string;
  meal: string;
  name: string;
  portion_g: number;
  date: string;
  createdAt?: number;
}

export async function firestoreGetFoodLogForDate(date: string): Promise<FoodLogDoc[]> {
  if (!isFirebaseConfigured()) return [];
  try {
    const q = query(
      collection(getDb(), COLLECTIONS.FOOD_LOG),
      where('date', '==', date)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FoodLogDoc));
    list.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
    return list;
  } catch (e) {
    console.warn('[firestore] getFoodLogForDate', e);
    return [];
  }
}

export async function firestoreAddFoodEntry(entry: {
  meal: string;
  name: string;
  portion_g: number;
  date: string;
}): Promise<string> {
  const ref = await addDoc(collection(getDb(), COLLECTIONS.FOOD_LOG), {
    ...entry,
    createdAt: Date.now(),
  });
  return ref.id;
}

export async function firestoreAddFoodEntries(
  date: string,
  meal: string,
  items: Array<{ name: string; portion_g: number }>
): Promise<void> {
  const col = collection(getDb(), COLLECTIONS.FOOD_LOG);
  const now = Date.now();
  for (const item of items) {
    await addDoc(col, { meal, name: item.name, portion_g: item.portion_g, date, createdAt: now });
  }
}

export async function firestoreRemoveFoodEntry(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTIONS.FOOD_LOG, id));
}

// --- periodFeelings collection ---
// Document ID = date (YYYY-MM-DD). Fields: { date, feeling }

export async function firestoreGetPeriodFeeling(date: string): Promise<string | undefined> {
  if (!isFirebaseConfigured()) return undefined;
  try {
    const ref = doc(getDb(), COLLECTIONS.PERIOD_FEELINGS, date);
    const snap = await getDoc(ref);
    const data = snap.data();
    return data?.feeling;
  } catch (e) {
    console.warn('[firestore] getPeriodFeeling', e);
    return undefined;
  }
}

export async function firestoreSetPeriodFeeling(date: string, feeling: string): Promise<void> {
  await setDoc(doc(getDb(), COLLECTIONS.PERIOD_FEELINGS, date), { date, feeling });
}
