import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { useHealth } from '../hooks/useHealth';
import type { HealthStatus } from '../services/healthService';

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
  const { stepCount, status, available, loading, requestAuth } = useHealth();
  const isDark = useColorScheme() === 'dark';
  const authorized = status === 'authorized';

  if (loading && status === 'unknown') {
    return (
      <View style={[styles.centered, isDark && styles.bgDark]}>
        <ActivityIndicator size="large" />
        <Text style={[styles.loadingText, isDark && styles.textDark]}>
          Checking health access…
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.bgDark]}>
      <View style={styles.header}>
        <Text style={styles.heart}>❤️</Text>
        <Text style={[styles.title, isDark && styles.textDark]}>
          Health Insights
        </Text>
        <Text style={[styles.phase, isDark && styles.phaseDark]}>
          Phase 1: Health foundation
        </Text>
      </View>

      <View style={[styles.card, isDark && styles.cardDark]}>
        <View style={styles.statusRow}>
          <Text style={styles.statusIcon}>{authorized ? '✓' : '!'}</Text>
          <Text style={[styles.statusLabel, isDark && styles.textDark]}>
            Health status:
          </Text>
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
            <Text style={styles.authButtonText}>
              {loading ? 'Requesting…' : 'Request health permission'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.stepsCard, isDark && styles.cardDark]}>
        <Text style={[styles.stepsTitle, isDark && styles.textDark]}>
          Today's steps
        </Text>
        <Text style={[styles.stepsValue, isDark && styles.textDark]}>
          {stepCount}
        </Text>
        <Text style={[styles.stepsUnit, isDark && styles.phaseDark]}>steps</Text>
      </View>

      <View style={[styles.goalsCard, isDark && styles.cardDark]}>
        <Text style={[styles.goalsTitle, isDark && styles.textDark]}>
          Phase 1 goals
        </Text>
        <GoalRow done={true} label="App opens" isDark={isDark} />
        <GoalRow done={authorized} label="Health permission works" isDark={isDark} />
        <GoalRow
          done={authorized && stepCount >= 0}
          label="Shows step count"
          isDark={isDark}
        />
      </View>
    </View>
  );
}

function GoalRow({
  done,
  label,
  isDark,
}: {
  done: boolean;
  label: string;
  isDark: boolean;
}) {
  return (
    <View style={styles.goalRow}>
      <Text style={styles.goalIcon}>{done ? '✓' : '○'}</Text>
      <Text style={[styles.goalLabel, isDark && styles.textDark]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  bgDark: {
    backgroundColor: '#1c1c1e',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  textDark: {
    color: '#e5e5ea',
  },
  phaseDark: {
    color: '#8e8e93',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  heart: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  phase: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardDark: {
    backgroundColor: '#2c2c2e',
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
  },
  statusLabel: {
    fontWeight: '500',
    fontSize: 16,
    color: '#000',
  },
  statusValue: {
    fontSize: 16,
  },
  statusOk: {
    color: '#34c759',
  },
  statusWarn: {
    color: '#ff9500',
  },
  authButton: {
    marginTop: 12,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  stepsCard: {
    backgroundColor: '#f2f2f7',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  stepsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  stepsValue: {
    fontSize: 56,
    fontWeight: '700',
    color: '#000',
  },
  stepsUnit: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  goalsCard: {
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    padding: 16,
  },
  goalsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  goalIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  goalLabel: {
    fontSize: 15,
    color: '#000',
  },
});
