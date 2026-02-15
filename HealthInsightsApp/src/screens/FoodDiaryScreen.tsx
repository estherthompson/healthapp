import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { AuroraBlobBackground } from '../components/AuroraBlobBackground';
import {
  getDishes,
  type LogMealDishesResponse,
  type LogMealDishItem,
} from '../services/logmealApi';

const CATEGORY_LABELS: Record<keyof LogMealDishesResponse, string> = {
  food: 'Food',
  drinks: 'Drinks',
  ingredients: 'Ingredients',
  sauces: 'Sauces',
  combo: 'Combo dishes',
  customRecipe: 'Custom recipes',
};

function DishSection({
  title,
  items,
}: {
  title: string;
  items: LogMealDishItem[];
}) {
  if (!items?.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.dishList}>
        {items.slice(0, 50).map((item) => (
          <View key={`${item.id}-${item.name}`} style={styles.dishRow}>
            <Text style={styles.dishName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.portionSize}>{item.portion_size}g</Text>
          </View>
        ))}
        {items.length > 50 && (
          <Text style={styles.moreText}>+{items.length - 50} more</Text>
        )}
      </View>
    </View>
  );
}

/**
 * Food Diary – log meals and track nutrition via LogMeal API
 */
export function FoodDiaryScreen() {
  const [data, setData] = useState<LogMealDishesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDishes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDishes({ language: 'eng', cookingMeasures: true });
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dishes');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadDishes();
  }, [loadDishes]);

  return (
    <AuroraBlobBackground style={styles.gradient}>
      <View style={styles.paperTint} pointerEvents="none" />
      <View style={styles.container}>
        <Text style={styles.title}>Food Diary</Text>
        <Text style={styles.subtitle}>
          Recognizable dishes from LogMeal. Use this list when logging meals.
        </Text>

        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#5a4a3a" />
            <Text style={styles.loadingText}>Loading dishes…</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadDishes}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && data && (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={loadDishes}
                tintColor="#5a4a3a"
              />
            }
          >
            {(Object.keys(CATEGORY_LABELS) as (keyof LogMealDishesResponse)[]).map(
              (key) => (
                <DishSection
                  key={key}
                  title={CATEGORY_LABELS[key]}
                  items={data[key] ?? []}
                />
              )
            )}
          </ScrollView>
        )}
      </View>
    </AuroraBlobBackground>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  paperTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,250,240,0.12)',
  },
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#292524',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#44403c',
    marginBottom: 16,
    lineHeight: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: '#57534e',
  },
  errorBox: {
    backgroundColor: 'rgba(185,28,28,0.12)',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#991b1b',
    marginBottom: 12,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#b91c1c',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#292524',
    marginBottom: 8,
  },
  dishList: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
    padding: 12,
  },
  dishRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  dishName: {
    fontSize: 14,
    color: '#292524',
    flex: 1,
    marginRight: 8,
  },
  portionSize: {
    fontSize: 12,
    color: '#78716c',
  },
  moreText: {
    fontSize: 12,
    color: '#78716c',
    marginTop: 6,
    fontStyle: 'italic',
  },
});
