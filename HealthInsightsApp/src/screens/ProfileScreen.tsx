import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { AuroraBlobBackground } from '../components/AuroraBlobBackground';
import {
  getProfileBasic,
  setProfileBasic,
  getState,
  setState,
  getMedicalInfo,
  setAllergies,
  setIntolerances,
  addMedication,
  removeMedication,
  addCondition,
  removeCondition,
  addInfectionOrDisease,
  removeInfectionOrDisease,
} from '../storage/profileStore';
import type {
  UserProfileBasic,
  UserState,
  MedicationEntry,
  ConditionEntry,
  InfectionOrDiseaseEntry,
} from '../domain/context/types';

type SexOption = UserProfileBasic['sex'];
type StressOption = NonNullable<UserState['stressLevel']>;
type PeriodFlowOption = NonNullable<UserState['periodFlow']>;
type ConditionType = ConditionEntry['type'];

const SEX_OPTIONS: { value: SexOption; label: string }[] = [
  { value: null, label: 'Prefer not to say' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
];

const STRESS_OPTIONS: { value: StressOption; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
];

const PERIOD_FLOW_OPTIONS: { value: PeriodFlowOption; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' },
];

const CONDITION_TYPES: { value: ConditionType; label: string }[] = [
  { value: 'chronic', label: 'Chronic' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'mental', label: 'Mental' },
];

function parseList(input: string): string[] {
  return input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function formatList(items: string[]): string {
  return items.join(', ');
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export function ProfileScreen() {
  const [saved, setSaved] = useState(false);

  // --- State ---
  const [stressLevel, setStressLevel] = useState<StressOption | null>(null);
  const [onPeriod, setOnPeriod] = useState(false);
  const [periodFlow, setPeriodFlow] = useState<PeriodFlowOption | null>(null);
  const [dietChange, setDietChange] = useState('');
  const [currentlySick, setCurrentlySick] = useState('');
  const [moodToday, setMoodToday] = useState('');

  // --- Profile ---
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<SexOption>(null);
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [pregnant, setPregnant] = useState<'yes' | 'no' | null>(null);
  const [pregnancyWeeks, setPregnancyWeeks] = useState('');
  const [breastfeeding, setBreastfeeding] = useState<'yes' | 'no' | null>(null);
  const [breastfeedingDuration, setBreastfeedingDuration] = useState('');

  // --- Medical ---
  const [medications, setMedications] = useState<MedicationEntry[]>([]);
  const [conditions, setConditions] = useState<ConditionEntry[]>([]);
  const [allergiesText, setAllergiesText] = useState('');
  const [intolerancesText, setIntolerancesText] = useState('');
  const [infections, setInfections] = useState<InfectionOrDiseaseEntry[]>([]);

  // Add forms (inline)
  const [newMedName, setNewMedName] = useState('');
  const [newMedWhen, setNewMedWhen] = useState('');
  const [newMedStart, setNewMedStart] = useState('');
  const [newCondName, setNewCondName] = useState('');
  const [newCondType, setNewCondType] = useState<ConditionType>('chronic');
  const [newInfName, setNewInfName] = useState('');
  const [newInfDate, setNewInfDate] = useState('');

  const load = useCallback(() => {
    const p = getProfileBasic();
    const s = getState();
    const m = getMedicalInfo();

    setAge(p.age != null ? String(p.age) : '');
    setSex(p.sex ?? null);
    setHeightCm(p.heightCm != null ? String(p.heightCm) : '');
    setWeightKg(p.weightKg != null ? String(p.weightKg) : '');
    setPregnant(p.pregnant ?? null);
    setPregnancyWeeks(p.pregnancyWeeks ?? '');
    setBreastfeeding(p.breastfeeding ?? null);
    setBreastfeedingDuration(p.breastfeedingDuration ?? '');

    setStressLevel(s.stressLevel ?? null);
    setOnPeriod(s.onPeriod === true);
    setPeriodFlow(s.periodFlow ?? null);
    setDietChange(s.dietChange ?? '');
    setCurrentlySick(s.currentlySick ?? '');
    setMoodToday(s.moodToday ?? '');

    setMedications(m.medications);
    setConditions(m.conditions);
    setAllergiesText(formatList(m.allergies));
    setIntolerancesText(formatList(m.intolerances));
    setInfections(m.infectionsOrDiseases);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(() => {
    setState({
      stressLevel: stressLevel ?? undefined,
      onPeriod: onPeriod || undefined,
      periodFlow: onPeriod ? (periodFlow ?? undefined) : undefined,
      dietChange: dietChange.trim() || undefined,
      currentlySick: currentlySick.trim() || undefined,
      moodToday: moodToday.trim() || undefined,
    });

    const ageNum = age.trim() ? parseInt(age.trim(), 10) : undefined;
    const heightNum = heightCm.trim() ? parseFloat(heightCm.trim()) : undefined;
    const weightNum = weightKg.trim() ? parseFloat(weightKg.trim()) : undefined;
    setProfileBasic({
      age: ageNum != null && !Number.isNaN(ageNum) ? ageNum : null,
      sex,
      heightCm: heightNum != null && !Number.isNaN(heightNum) ? heightNum : null,
      weightKg: weightNum != null && !Number.isNaN(weightNum) ? weightNum : null,
      pregnant: pregnant ?? undefined,
      pregnancyWeeks: pregnancyWeeks.trim() || undefined,
      breastfeeding: breastfeeding ?? undefined,
      breastfeedingDuration: breastfeedingDuration.trim() || undefined,
      pregnancyOrBreastfeeding: pregnant === 'yes' || breastfeeding === 'yes',
    });

    setAllergies(parseList(allergiesText));
    setIntolerances(parseList(intolerancesText));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [
    stressLevel,
    onPeriod,
    periodFlow,
    dietChange,
    currentlySick,
    moodToday,
    age,
    sex,
    heightCm,
    weightKg,
    pregnant,
    pregnancyWeeks,
    breastfeeding,
    breastfeedingDuration,
    allergiesText,
    intolerancesText,
  ]);

  const addMed = useCallback(() => {
    const name = newMedName.trim();
    const when = newMedWhen.trim();
    if (!name || !when) return;
    const entry = addMedication({
      name,
      whenTake: when,
      startDate: newMedStart.trim() || null,
    });
    setMedications((prev) => [...prev, entry]);
    setNewMedName('');
    setNewMedWhen('');
    setNewMedStart('');
  }, [newMedName, newMedWhen, newMedStart]);

  const delMed = useCallback((id: string) => {
    removeMedication(id);
    setMedications((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const addCond = useCallback(() => {
    const name = newCondName.trim();
    if (!name) return;
    const entry = addCondition({ name, type: newCondType });
    setConditions((prev) => [...prev, entry]);
    setNewCondName('');
  }, [newCondName, newCondType]);

  const delCond = useCallback((id: string) => {
    removeCondition(id);
    setConditions((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addInf = useCallback(() => {
    const name = newInfName.trim();
    if (!name) return;
    const entry = addInfectionOrDisease({
      name,
      dateNoted: newInfDate.trim() || null,
    });
    setInfections((prev) => [...prev, entry]);
    setNewInfName('');
    setNewInfDate('');
  }, [newInfName, newInfDate]);

  const delInf = useCallback((id: string) => {
    removeInfectionOrDisease(id);
    setInfections((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return (
    <AuroraBlobBackground style={styles.gradient}>
      <View style={styles.paperTint} pointerEvents="none" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          This info helps the wellness chat give you relevant, personalized reasoning. State reflects
          how you are right now; Profile is stable; Medical includes medications, conditions, and
          allergies.
        </Text>

        <SectionHeader title="State (how you are right now)" />
        <Text style={styles.label}>Stress level</Text>
        <View style={styles.chipRow}>
          {STRESS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chip, stressLevel === opt.value && styles.chipActive]}
              onPress={() => setStressLevel(opt.value)}
            >
              <Text style={[styles.chipText, stressLevel === opt.value && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>On period</Text>
          <Switch
            value={onPeriod}
            onValueChange={setOnPeriod}
            trackColor={{ false: '#d6d3d1', true: '#a8a29e' }}
            thumbColor={onPeriod ? '#5a4a3a' : '#f5f5f4'}
          />
        </View>
        {onPeriod && (
          <>
            <Text style={styles.label}>Flow</Text>
            <View style={styles.chipRow}>
              {PERIOD_FLOW_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.chip, periodFlow === opt.value && styles.chipActive]}
                  onPress={() => setPeriodFlow(opt.value)}
                >
                  <Text style={[styles.chipText, periodFlow === opt.value && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={styles.label}>Diet change (optional)</Text>
        <TextInput
          style={styles.input}
          value={dietChange}
          onChangeText={setDietChange}
          placeholder="e.g. started keto, eating less"
          placeholderTextColor="#78716c"
        />

        <Text style={styles.label}>Currently sick (optional)</Text>
        <TextInput
          style={styles.input}
          value={currentlySick}
          onChangeText={setCurrentlySick}
          placeholder="e.g. cold, flu"
          placeholderTextColor="#78716c"
        />

        <Text style={styles.label}>Mood today (optional)</Text>
        <TextInput
          style={styles.input}
          value={moodToday}
          onChangeText={setMoodToday}
          placeholder="e.g. stressed, calm, tired"
          placeholderTextColor="#78716c"
        />

        <SectionHeader title="Profile (basic info)" />
        <Text style={styles.label}>Age (years)</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder="e.g. 28"
          placeholderTextColor="#78716c"
          keyboardType="number-pad"
        />
        <Text style={styles.label}>Sex</Text>
        <View style={styles.chipRow}>
          {SEX_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={String(opt.value)}
              style={[styles.chip, sex === opt.value && styles.chipActive]}
              onPress={() => setSex(opt.value)}
            >
              <Text style={[styles.chipText, sex === opt.value && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Height (cm)</Text>
        <TextInput
          style={styles.input}
          value={heightCm}
          onChangeText={setHeightCm}
          placeholder="e.g. 165"
          placeholderTextColor="#78716c"
          keyboardType="decimal-pad"
        />
        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput
          style={styles.input}
          value={weightKg}
          onChangeText={setWeightKg}
          placeholder="e.g. 62"
          placeholderTextColor="#78716c"
          keyboardType="decimal-pad"
        />

        <SectionHeader title="Pregnancy" />
        <Text style={styles.label}>Are you pregnant?</Text>
        <View style={styles.chipRow}>
          <TouchableOpacity
            style={[styles.chip, pregnant === 'yes' && styles.chipActive]}
            onPress={() => setPregnant('yes')}
          >
            <Text style={[styles.chipText, pregnant === 'yes' && styles.chipTextActive]}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, pregnant === 'no' && styles.chipActive]}
            onPress={() => {
              setPregnant('no');
              setPregnancyWeeks('');
            }}
          >
            <Text style={[styles.chipText, pregnant === 'no' && styles.chipTextActive]}>No</Text>
          </TouchableOpacity>
        </View>
        {pregnant === 'yes' && (
          <>
            <Text style={styles.label}>How long? (weeks)</Text>
            <TextInput
              style={styles.input}
              value={pregnancyWeeks}
              onChangeText={setPregnancyWeeks}
              placeholder="e.g. 12"
              placeholderTextColor="#78716c"
              keyboardType="number-pad"
              maxLength={3}
            />
          </>
        )}

        <SectionHeader title="Breastfeeding" />
        <Text style={styles.label}>Are you breastfeeding?</Text>
        <View style={styles.chipRow}>
          <TouchableOpacity
            style={[styles.chip, breastfeeding === 'yes' && styles.chipActive]}
            onPress={() => setBreastfeeding('yes')}
          >
            <Text style={[styles.chipText, breastfeeding === 'yes' && styles.chipTextActive]}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, breastfeeding === 'no' && styles.chipActive]}
            onPress={() => {
              setBreastfeeding('no');
              setBreastfeedingDuration('');
            }}
          >
            <Text style={[styles.chipText, breastfeeding === 'no' && styles.chipTextActive]}>No</Text>
          </TouchableOpacity>
        </View>
        {breastfeeding === 'yes' && (
          <>
            <Text style={styles.label}>How long? (weeks or months)</Text>
            <TextInput
              style={styles.input}
              value={breastfeedingDuration}
              onChangeText={setBreastfeedingDuration}
              placeholder="e.g. 3 months"
              placeholderTextColor="#78716c"
            />
          </>
        )}

        <SectionHeader title="Medical info" />
        <Text style={styles.label}>Medications (name, when you take it, start date)</Text>
        {medications.map((m) => (
          <View key={m.id} style={styles.listRow}>
            <Text style={styles.listText}>
              {m.name} — {m.whenTake}
              {m.startDate ? ` (from ${m.startDate})` : ''}
            </Text>
            <TouchableOpacity onPress={() => delMed(m.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.deleteBtn}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.addRow}>
          <TextInput
            style={[styles.input, styles.inputSmall]}
            value={newMedName}
            onChangeText={setNewMedName}
            placeholder="Name"
            placeholderTextColor="#78716c"
          />
          <TextInput
            style={[styles.input, styles.inputSmall]}
            value={newMedWhen}
            onChangeText={setNewMedWhen}
            placeholder="When (e.g. morning)"
            placeholderTextColor="#78716c"
          />
          <TextInput
            style={[styles.input, styles.inputSmall]}
            value={newMedStart}
            onChangeText={setNewMedStart}
            placeholder="Start date"
            placeholderTextColor="#78716c"
          />
          <TouchableOpacity style={styles.addChip} onPress={addMed}>
            <Text style={styles.addChipText}>Add</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Conditions (chronic, temporary, or mental)</Text>
        {conditions.map((c) => (
          <View key={c.id} style={styles.listRow}>
            <Text style={styles.listText}>
              {c.name} ({c.type})
            </Text>
            <TouchableOpacity onPress={() => delCond(c.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.deleteBtn}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.addRow}>
          <TextInput
            style={[styles.input, styles.inputFlex]}
            value={newCondName}
            onChangeText={setNewCondName}
            placeholder="Condition name"
            placeholderTextColor="#78716c"
          />
          <View style={styles.chipRow}>
            {CONDITION_TYPES.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.chipSmall, newCondType === opt.value && styles.chipActive]}
                onPress={() => setNewCondType(opt.value)}
              >
                <Text style={[styles.chipText, newCondType === opt.value && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.addChip} onPress={addCond}>
            <Text style={styles.addChipText}>Add</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Allergies (comma-separated)</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={allergiesText}
          onChangeText={setAllergiesText}
          placeholder="e.g. penicillin, peanuts, pollen"
          placeholderTextColor="#78716c"
          multiline
        />
        <Text style={styles.label}>Intolerances (comma-separated)</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={intolerancesText}
          onChangeText={setIntolerancesText}
          placeholder="e.g. lactose, gluten"
          placeholderTextColor="#78716c"
          multiline
        />

        <Text style={styles.label}>Infections / diseases (optional, with date if known)</Text>
        {infections.map((i) => (
          <View key={i.id} style={styles.listRow}>
            <Text style={styles.listText}>
              {i.name}
              {i.dateNoted ? ` (${i.dateNoted})` : ''}
            </Text>
            <TouchableOpacity onPress={() => delInf(i.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.deleteBtn}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.addRow}>
          <TextInput
            style={[styles.input, styles.inputFlex]}
            value={newInfName}
            onChangeText={setNewInfName}
            placeholder="Name"
            placeholderTextColor="#78716c"
          />
          <TextInput
            style={[styles.input, styles.inputSmall]}
            value={newInfDate}
            onChangeText={setNewInfDate}
            placeholder="Date"
            placeholderTextColor="#78716c"
          />
          <TouchableOpacity style={styles.addChip} onPress={addInf}>
            <Text style={styles.addChipText}>Add</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={save}>
          <Text style={styles.saveBtnText}>{saved ? 'Saved' : 'Save profile'}</Text>
        </TouchableOpacity>
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
  content: { padding: 24, paddingBottom: 48 },
  intro: {
    fontSize: 14,
    color: '#57534e',
    lineHeight: 22,
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#292524',
    marginTop: 20,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#292524',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#292524',
    borderWidth: 1,
    borderColor: 'rgba(41,37,36,0.12)',
    marginBottom: 16,
  },
  inputSmall: { flex: 1, minWidth: 80 },
  inputFlex: { flex: 1 },
  inputMultiline: { minHeight: 64 },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(41,37,36,0.08)',
  },
  chipSmall: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(41,37,36,0.08)',
  },
  chipActive: { backgroundColor: '#5a4a3a' },
  chipText: { fontSize: 14, color: '#44403c', fontWeight: '500' },
  chipTextActive: { color: '#fef08a' },
  addRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  addChip: {
    backgroundColor: '#5a4a3a',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addChipText: { fontSize: 14, fontWeight: '600', color: '#fef08a' },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(41,37,36,0.08)',
  },
  listText: { fontSize: 14, color: '#292524', flex: 1 },
  deleteBtn: { fontSize: 13, color: '#b91c1c', fontWeight: '500' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
  },
  switchLabel: { fontSize: 15, color: '#292524', flex: 1 },
  saveBtn: {
    backgroundColor: '#5a4a3a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: '#fef08a' },
});
