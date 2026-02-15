import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuroraBlobBackground } from '../components/AuroraBlobBackground';

/**
 * Food Diary – log meals and track nutrition
 */
export function FoodDiaryScreen() {
  return (
    <AuroraBlobBackground style={styles.gradient}>
      <View style={styles.paperTint} pointerEvents="none" />
      <View style={styles.container}>
        <Text style={styles.title}>Food Diary</Text>
        <Text style={styles.subtitle}>
          Log your meals and track nutrition. Coming soon.
        </Text>
      </View>
    </AuroraBlobBackground>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  paperTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,250,240,0.12)',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#292524',
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 16,
    color: '#44403c',
    textAlign: 'center',
    lineHeight: 26,
  },
});
