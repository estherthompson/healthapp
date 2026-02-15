import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  launchImageLibrary,
  launchCamera,
} from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuroraBlobBackground } from '../components/AuroraBlobBackground';
import { recognizeFoodImage } from '../services/logmealApi';
import {
  getEntriesByMealForDate,
  addEntries,
  removeEntry,
  getTodayTotalPortion,
  type MealType,
  type FoodLogEntry,
} from '../storage/foodLogStore';

const MEALS: { key: MealType; label: string; icon: string }[] = [
  { key: 'breakfast', label: 'Breakfast', icon: 'sunny-outline' },
  { key: 'lunch', label: 'Lunch', icon: 'restaurant-outline' },
  { key: 'dinner', label: 'Dinner', icon: 'moon-outline' },
  { key: 'snacks', label: 'Snacks', icon: 'cafe-outline' },
];

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatToday(): string {
  const d = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${days[d.getDay()]}, ${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
}

const EMPTY_BY_MEAL: Record<MealType, FoodLogEntry[]> = {
  breakfast: [],
  lunch: [],
  dinner: [],
  snacks: [],
};

export function FoodDiaryScreen() {
  const [entriesVersion, setEntriesVersion] = useState(0);
  const [byMeal, setByMeal] = useState<Record<MealType, FoodLogEntry[]>>(EMPTY_BY_MEAL);
  const [totalPortion, setTotalPortion] = useState(0);
  const [logLoading, setLogLoading] = useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLogLoading(true);
      const [mealData, total] = await Promise.all([
        getEntriesByMealForDate(todayStr()),
        getTodayTotalPortion(),
      ]);
      if (!cancelled) {
        setByMeal(mealData);
        setTotalPortion(total);
      }
      setLogLoading(false);
    })();
    return () => { cancelled = true; };
  }, [entriesVersion]);

  const totalItems = Object.values(byMeal).reduce((n, arr) => n + arr.length, 0);

  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const refreshLog = useCallback(() => setEntriesVersion((v) => v + 1), []);

  const runScanAndAddToMeal = useCallback(async (meal: MealType, fromLibrary: boolean = false) => {
    const launcher = fromLibrary ? launchImageLibrary : launchCamera;
    if (typeof launcher !== 'function') {
      Alert.alert(
        'Not available',
        'Camera or gallery is not linked. Rebuild the app after running "pod install" in the ios folder.'
      );
      return;
    }
    const result = await launcher({
      mediaType: 'photo',
      selectionLimit: 1,
      saveToPhotos: false,
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.75,
    });
    if (result.didCancel || !result.assets?.[0]?.uri) return;
    setScanLoading(true);
    setScanError(null);
    try {
      const apiResult = await recognizeFoodImage(result.assets[0].uri, { language: 'eng' });
      const items = (apiResult.segmentation_results ?? [])
        .map((seg) => seg.recognition_results?.[0])
        .filter(Boolean)
        .map((r) => ({ name: r!.name, portion_g: Math.round(200 * (r!.prob || 0.5)) || 100 }));
      if (items.length > 0) {
        await addEntries(meal, items);
        refreshLog();
      } else setScanError('No food detected');
    } catch (e) {
      setScanError(e instanceof Error ? e.message : 'Scan failed');
    } finally {
      setScanLoading(false);
    }
  }, [refreshLog]);

  const openScanThenChooseMeal = useCallback((meal: MealType) => {
    Alert.alert('Scan meal', 'Take a photo or choose from gallery', [
      { text: 'Take photo', onPress: () => runScanAndAddToMeal(meal, false) },
      { text: 'Choose from gallery', onPress: () => runScanAndAddToMeal(meal, true) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [runScanAndAddToMeal]);

  const showAddOptions = useCallback((meal: MealType) => {
    openScanThenChooseMeal(meal);
  }, [openScanThenChooseMeal]);

  const handleRemoveEntry = useCallback((entry: FoodLogEntry) => {
    Alert.alert('Remove item', `Remove "${entry.name}" from ${entry.meal}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await removeEntry(entry.id);
          refreshLog();
        },
      },
    ]);
  }, [refreshLog]);

  return (
    <AuroraBlobBackground style={styles.gradient}>
      <View style={styles.paperTint} pointerEvents="none" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Food Diary</Text>
        <Text style={styles.dateLabel}>{formatToday()}</Text>
        {(totalItems > 0 || totalPortion > 0) && (
          <Text style={styles.summary}>
            {totalItems} item{totalItems !== 1 ? 's' : ''} · {totalPortion}g logged
          </Text>
        )}

        {scanLoading && (
          <View style={styles.loadingBar}>
            <ActivityIndicator size="small" color="#5a4a3a" />
            <Text style={styles.loadingBarText}>Scanning…</Text>
          </View>
        )}
        {scanError && <Text style={styles.scanErrorText}>{scanError}</Text>}

        {logLoading && (
          <View style={styles.loadingBar}>
            <ActivityIndicator size="small" color="#5a4a3a" />
            <Text style={styles.loadingBarText}>Loading diary…</Text>
          </View>
        )}

        {!logLoading && MEALS.map(({ key, label, icon }) => (
          <View key={key} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Ionicons name={icon as any} size={20} color="#292524" />
              <Text style={styles.mealTitle}>{label}</Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => showAddOptions(key)}
                disabled={scanLoading}
              >
                <Ionicons name="add-circle" size={24} color="#ea580c" />
              </TouchableOpacity>
            </View>
            <View style={styles.mealList}>
              {byMeal[key].length === 0 ? (
                <Text style={styles.emptyMeal}>No items yet</Text>
              ) : (
                byMeal[key].map((entry) => (
                  <TouchableOpacity
                    key={entry.id}
                    style={styles.logRow}
                    onPress={() => handleRemoveEntry(entry)}
                    onLongPress={() => handleRemoveEntry(entry)}
                  >
                    <Text style={styles.logName} numberOfLines={1}>{entry.name}</Text>
                    <Text style={styles.logPortion}>{entry.portion_g}g</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        ))}

        <View style={styles.bottomPad} />
      </ScrollView>
    </AuroraBlobBackground>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  paperTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,250,240,0.12)',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#292524',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  dateLabel: { fontSize: 15, color: '#57534e', marginBottom: 2 },
  summary: { fontSize: 13, color: '#78716c', marginBottom: 20 },
  loadingBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  loadingBarText: { fontSize: 14, color: '#57534e' },
  scanErrorText: { fontSize: 13, color: '#991b1b', marginBottom: 12 },
  mealCard: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  mealTitle: { fontSize: 17, fontWeight: '600', color: '#292524', marginLeft: 8, flex: 1 },
  addBtn: { padding: 4 },
  mealList: { paddingHorizontal: 14, paddingVertical: 8 },
  emptyMeal: { fontSize: 14, color: '#a8a29e', paddingVertical: 8 },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  logName: { fontSize: 15, color: '#292524', flex: 1, marginRight: 8 },
  logPortion: { fontSize: 13, color: '#78716c' },
  bottomPad: { height: 24 },
});
