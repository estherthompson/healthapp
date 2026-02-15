import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useHealth } from '../hooks/useHealth';
import type { HealthStatus } from '../services/healthService';
import { AuroraBlobBackground } from '../components/AuroraBlobBackground';

function formatDate(): string {
  const d = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

function getHealthServiceName(): string {
  return Platform.OS === 'ios' ? 'Apple Health' : 'Health Connect';
}

function getConnectToHealthLabel(): string {
  return Platform.OS === 'ios' ? 'Connect to Apple Health' : 'Connect to Health Connect';
}

function statusLabel(s: HealthStatus): string {
  switch (s) {
    case 'authorized':
      return getHealthServiceName();
    case 'denied':
      return getConnectToHealthLabel();
    case 'not_available':
      return 'Not available';
    case 'not_requested':
      return getConnectToHealthLabel();
    default:
      return '…';
  }
}

export function HomeScreen() {
  const {
    stepCount,
    waterLiters,
    distanceKm,
    activeEnergyKcal,
    flightsClimbed,
    exerciseMinutes,
    sleepMinutes,
    restingHeartRateBpm,
    status,
    available,
    loading,
    requestAuth,
  } = useHealth();
  const authorized = status === 'authorized';

  if (loading && status === 'unknown') {
    return (
      <AuroraBlobBackground style={styles.gradient}>
        <View style={styles.paperTint} pointerEvents="none" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#5a4a3a" />
          <Text style={styles.loadingText}>Checking health access…</Text>
        </View>
      </AuroraBlobBackground>
    );
  }

  const stepsEncouragement = stepCount > 0 ? 'Keep it up!' : 'Let\'s move!';
  const sleepHours = sleepMinutes >= 60 ? (sleepMinutes / 60).toFixed(1) : null;
  const sleepDisplay = sleepHours ? `${sleepHours} hrs` : `${sleepMinutes} min`;

  return (
    <AuroraBlobBackground style={styles.gradient}>
      <View style={styles.paperTint} pointerEvents="none" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/bloom-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Hey there!</Text>
            <Text style={styles.date}>{formatDate()}</Text>
          </View>
        </View>

        <View style={styles.statusWrap}>
          {authorized ? (
            <View style={[styles.pill, styles.pillOk, styles.pillRow]}>
              <Ionicons name="checkmark-circle" size={16} color="#166534" />
              <Text style={styles.pillText}>{statusLabel(status)}</Text>
            </View>
          ) : available ? (
            <TouchableOpacity
              style={[styles.pill, styles.pillAction]}
              onPress={requestAuth}
              disabled={loading}
            >
              <Text style={styles.pillTextAction}>
                {loading ? 'Requesting…' : statusLabel(status)}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.pill, styles.pillMuted]}>
              <Text style={styles.pillTextMuted}>{statusLabel(status)}</Text>
            </View>
          )}
        </View>

        <View style={[styles.heroCard, styles.heroSteps]}>
          <Text style={styles.heroLabel}>Steps today</Text>
          <Text style={styles.heroValue}>{stepCount.toLocaleString()}</Text>
          <Text style={styles.heroSublabel}>{stepsEncouragement}</Text>
        </View>

        <View style={[styles.heroCard, styles.heroWater]}>
          <Text style={styles.heroLabel}>Water today</Text>
          <Text style={styles.heroValue}>
            {waterLiters > 0 ? waterLiters.toFixed(1) : '—'}
          </Text>
          <Text style={styles.heroSublabel}>
            {waterLiters > 0 ? 'L' : 'No data yet'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Today at a glance</Text>

        <View style={styles.metricRow}>
          <View style={[styles.miniCard, styles.miniSleep]}>
            <Ionicons name="moon-outline" size={26} color="#92400e" style={styles.miniIcon} />
            <Text style={styles.miniValue}>
              {sleepMinutes > 0 ? sleepDisplay : '—'}
            </Text>
            <Text style={styles.miniLabel}>Sleep</Text>
          </View>
          <View style={[styles.miniCard, styles.miniDistance]}>
            <Ionicons name="walk-outline" size={26} color="#5c4033" style={styles.miniIcon} />
            <Text style={styles.miniValue}>
              {distanceKm > 0 ? `${distanceKm} km` : '—'}
            </Text>
            <Text style={styles.miniLabel}>Distance</Text>
          </View>
          <View style={[styles.miniCard, styles.miniHeart]}>
            <Ionicons name="heart-outline" size={26} color="#6b5b73" style={styles.miniIcon} />
            <Text style={styles.miniValue}>
              {restingHeartRateBpm != null ? `${restingHeartRateBpm}` : '—'}
            </Text>
            <Text style={styles.miniLabel}>Resting HR</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Activity details</Text>
          <View style={styles.detailsGrid}>
            <DetailItem label="Active energy" value={activeEnergyKcal} unit="kcal" />
            <DetailItem label="Flights climbed" value={flightsClimbed} unit="" />
            <DetailItem label="Exercise" value={exerciseMinutes} unit="min" />
          </View>
        </View>
        <View style={styles.bottomPad} />
      </ScrollView>
    </AuroraBlobBackground>
  );
}

function DetailItem({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  const display = value > 0 ? `${value}${unit ? ` ${unit}` : ''}` : '—';
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{display}</Text>
    </View>
  );
}

const cardRadius = 20;
const miniRadius = 16;
const palette = {
  text: '#292524',
  textMuted: '#57534e',
  green: 'rgba(74, 124, 89, 0.22)',
  greenBorder: 'rgba(74, 124, 89, 0.35)',
  orange: 'rgba(180, 83, 9, 0.18)',
  orangeBorder: 'rgba(180, 83, 9, 0.3)',
  brown: 'rgba(107, 83, 68, 0.2)',
  brownBorder: 'rgba(107, 83, 68, 0.35)',
  purple: 'rgba(124, 92, 158, 0.2)',
  purpleBorder: 'rgba(124, 92, 158, 0.35)',
  water: 'rgba(56, 189, 248, 0.2)',
  waterBorder: 'rgba(56, 189, 248, 0.4)',
  card: 'rgba(255,255,255,0.4)',
  cardBorder: 'rgba(0,0,0,0.06)',
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  paperTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,250,240,0.12)',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 72,
    paddingBottom: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: palette.text,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 72,
    height: 72,
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: palette.text,
    letterSpacing: 0.3,
  },
  date: {
    fontSize: 15,
    color: palette.textMuted,
    marginTop: 4,
  },
  statusWrap: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pillOk: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },
  pillAction: {
    backgroundColor: palette.brown,
    borderWidth: 1,
    borderColor: palette.brownBorder,
  },
  pillTextAction: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.text,
  },
  pillMuted: {
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  pillTextMuted: {
    fontSize: 14,
    color: palette.textMuted,
  },
  heroCard: {
    borderRadius: cardRadius,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
  },
  heroSteps: {
    backgroundColor: palette.green,
    borderColor: palette.greenBorder,
  },
  heroWater: {
    backgroundColor: palette.water,
    borderColor: palette.waterBorder,
  },
  heroLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.textMuted,
    marginBottom: 6,
  },
  heroValue: {
    fontSize: 48,
    fontWeight: '700',
    color: palette.text,
    letterSpacing: -1,
  },
  heroSublabel: {
    fontSize: 15,
    color: palette.textMuted,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: palette.text,
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  miniCard: {
    flex: 1,
    borderRadius: miniRadius,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 0,
  },
  miniSleep: {
    backgroundColor: palette.orange,
    borderColor: palette.orangeBorder,
  },
  miniDistance: {
    backgroundColor: palette.brown,
    borderColor: palette.brownBorder,
  },
  miniHeart: {
    backgroundColor: palette.purple,
    borderColor: palette.purpleBorder,
  },
  miniIcon: {
    marginBottom: 6,
  },
  miniValue: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
  },
  miniLabel: {
    fontSize: 12,
    color: palette.textMuted,
    marginTop: 2,
  },
  detailsCard: {
    backgroundColor: palette.card,
    borderRadius: cardRadius,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: palette.cardBorder,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text,
    marginBottom: 14,
  },
  detailsGrid: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: palette.cardBorder,
  },
  detailLabel: {
    fontSize: 15,
    color: palette.textMuted,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.text,
  },
  bottomPad: {
    height: 24,
  },
});
