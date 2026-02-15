import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useHealth } from '../hooks/useHealth';
import type { HealthStatus } from '../services/healthService';
import { AuroraBlobBackground } from '../components/AuroraBlobBackground';

function statusLabel(s: HealthStatus): string {
  switch (s) {
    case 'authorized':
      return 'Authorized';
    case 'denied':
      return 'Access denied';
    case 'not_available':
      return 'Health data not available';
    case 'not_requested':
      return 'Not requested';
    default:
      return 'Unknown';
  }
}

export function HomeScreen() {
  const { stepCount, status, available, loading, requestAuth, refreshSteps } =
    useHealth();
  const authorized = status === 'authorized';

  if (loading && status === 'unknown') {
    return (
      <AuroraBlobBackground style={styles.gradient}>
        <View style={styles.paperTint} pointerEvents="none" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#292524" />
          <Text style={styles.loadingText}>Checking health access…</Text>
        </View>
      </AuroraBlobBackground>
    );
  }

  return (
    <AuroraBlobBackground style={styles.gradient}>
      <View style={styles.paperTint} pointerEvents="none" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.heart}>✦</Text>
          <Text style={styles.title}>Health Insights</Text>
          <Text style={styles.phase}>Phase 1: Health foundation</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.statusRow}>
            <Text style={styles.statusIcon}>{authorized ? '✓' : '!'}</Text>
            <Text style={styles.statusLabel}>Health status:</Text>
            <Text
              style={[
                styles.statusValue,
                authorized ? styles.statusOk : styles.statusWarn,
              ]}
            >
              {statusLabel(status)}
            </Text>
          </View>
          {!authorized && available && (
            <TouchableOpacity
              style={styles.authButton}
              onPress={requestAuth}
              disabled={loading}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.2)']}
                style={styles.authButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.authButtonText}>
                  {loading ? 'Requesting…' : 'Request health permission'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>Today's steps</Text>
          <Text style={styles.stepsValue}>{stepCount}</Text>
          <Text style={styles.stepsUnit}>steps</Text>
          {authorized && (
            <TouchableOpacity style={styles.refreshButton} onPress={refreshSteps}>
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.goalsCard}>
          <Text style={styles.goalsTitle}>Phase 1 goals</Text>
          <GoalRow done={true} label="App opens" />
          <GoalRow done={authorized} label="Health permission works" />
          <GoalRow done={authorized && stepCount >= 0} label="Shows step count" />
        </View>
        </ScrollView>
    </AuroraBlobBackground>
  );
}

function GoalRow({ done, label }: { done: boolean; label: string }) {
  return (
    <View style={styles.goalRow}>
      <Text style={styles.goalIcon}>{done ? '✓' : '○'}</Text>
      <Text style={styles.goalLabel}>{label}</Text>
    </View>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#292524',
  },
  header: {
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 28,
  },
  heart: {
    fontSize: 42,
    marginBottom: 8,
    color: '#292524',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#292524',
    letterSpacing: 0.5,
  },
  phase: {
    fontSize: 14,
    color: '#44403c',
    marginTop: 6,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  statusIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#292524',
  },
  statusLabel: {
    fontWeight: '500',
    fontSize: 16,
    color: '#292524',
  },
  statusValue: {
    fontSize: 16,
  },
  statusOk: {
    color: '#166534',
  },
  statusWarn: {
    color: '#b45309',
  },
  authButton: {
    marginTop: 14,
    borderRadius: 12,
    overflow: 'hidden',
  },
  authButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  authButtonText: {
    color: '#292524',
    fontSize: 16,
    fontWeight: '600',
  },
  stepsCard: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 20,
    padding: 28,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  stepsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#292524',
    marginBottom: 8,
  },
  stepsValue: {
    fontSize: 58,
    fontWeight: '700',
    color: '#292524',
    letterSpacing: -1,
  },
  stepsUnit: {
    fontSize: 16,
    color: '#44403c',
    marginTop: 4,
  },
  refreshButton: {
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  refreshButtonText: {
    color: '#292524',
    fontSize: 16,
    fontWeight: '500',
  },
  goalsCard: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  goalsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#292524',
    marginBottom: 12,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalIcon: {
    fontSize: 16,
    marginRight: 10,
    color: '#292524',
  },
  goalLabel: {
    fontSize: 15,
    color: '#292524',
  },
});
