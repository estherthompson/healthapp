import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuroraBlobBackground } from '../components/AuroraBlobBackground';
import {
  requestPeriodPermission,
  logPeriod,
  getRecentPeriodEntries,
  type FlowLevel,
  type PeriodEntry,
} from '../services/periodService';

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function PeriodScreen() {
  const [startDate, setStartDate] = useState(todayStr());
  const [endDate, setEndDate] = useState(todayStr());
  const [flow, setFlow] = useState<FlowLevel>('medium');
  const [entries, setEntries] = useState<PeriodEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    const list = await getRecentPeriodEntries(90);
    setEntries(list);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleRequestPermission = async () => {
    setSaving(true);
    const ok = await requestPeriodPermission();
    setPermissionGranted(ok);
    setSaving(false);
    if (ok) loadEntries();
  };

  const handleLogPeriod = async () => {
    const start = new Date(startDate + 'T12:00:00');
    const end = new Date(endDate + 'T12:00:00');
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      Alert.alert('Invalid date', 'Please use YYYY-MM-DD format.');
      return;
    }
    if (start.getTime() > end.getTime()) {
      Alert.alert('Invalid range', 'Start date must be on or before end date.');
      return;
    }
    setSaving(true);
    const hasPermission = permissionGranted ?? (await requestPeriodPermission());
    if (!hasPermission) {
      setSaving(false);
      Alert.alert('Permission needed', 'Allow period data access to log.');
      return;
    }
    setPermissionGranted(true);
    try {
      await logPeriod(start, end, flow);
      await loadEntries();
      setStartDate(todayStr());
      setEndDate(todayStr());
    } catch (e) {
      Alert.alert('Error', 'Could not save. Try again.');
    }
    setSaving(false);
  };

  return (
    <AuroraBlobBackground style={styles.gradient}>
      <View style={styles.paperTint} pointerEvents="none" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Ionicons name="water-outline" size={32} color="#292524" style={styles.headerIcon} />
          <Text style={styles.title}>Period</Text>
          <Text style={styles.subtitle}>Log your period and track cycles</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Log period</Text>
          <Text style={styles.label}>Start date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="2025-02-01"
            placeholderTextColor="#a8a29e"
            autoCapitalize="none"
          />
          <Text style={styles.label}>End date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={endDate}
            onChangeText={setEndDate}
            placeholder="2025-02-05"
            placeholderTextColor="#a8a29e"
            autoCapitalize="none"
          />
          <Text style={styles.label}>Flow</Text>
          <View style={styles.flowRow}>
            {(['light', 'medium', 'heavy'] as FlowLevel[]).map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.flowBtn, flow === f && styles.flowBtnActive]}
                onPress={() => setFlow(f)}
              >
                <Text style={[styles.flowBtnText, flow === f && styles.flowBtnTextActive]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleLogPeriod}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#292524" />
            ) : (
              <Text style={styles.saveButtonText}>Save to health</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.permissionLink}
            onPress={handleRequestPermission}
            disabled={saving}
          >
            <Text style={styles.permissionLinkText}>
              {saving ? 'Checking…' : 'Allow period data access'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent entries</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#292524" style={styles.loader} />
          ) : entries.length === 0 ? (
            <Text style={styles.emptyText}>No period data logged yet.</Text>
          ) : (
            entries.slice(0, 30).map((e) => (
              <View key={e.date} style={styles.entryRow}>
                <Text style={styles.entryDate}>{formatDisplayDate(e.date)}</Text>
                <Text style={styles.entryFlow}>{e.flow}</Text>
              </View>
            ))
          )}
        </View>
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
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: { marginBottom: 8 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#292524',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: '#57534e',
    marginTop: 6,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#292524',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#57534e',
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#292524',
    marginBottom: 14,
  },
  flowRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  flowBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
  },
  flowBtnActive: {
    backgroundColor: 'rgba(124, 92, 158, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(124, 92, 158, 0.4)',
  },
  flowBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#57534e',
  },
  flowBtnTextActive: {
    color: '#5b4d63',
  },
  saveButton: {
    backgroundColor: 'rgba(107, 83, 68, 0.3)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(107, 83, 68, 0.5)',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#292524',
  },
  permissionLink: {
    marginTop: 14,
    alignItems: 'center',
  },
  permissionLinkText: {
    fontSize: 14,
    color: '#57534e',
  },
  loader: { marginVertical: 16 },
  emptyText: {
    fontSize: 15,
    color: '#57534e',
    fontStyle: 'italic',
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  entryDate: {
    fontSize: 15,
    color: '#292524',
  },
  entryFlow: {
    fontSize: 14,
    color: '#57534e',
    textTransform: 'capitalize',
  },
  bottomPad: { height: 24 },
});
