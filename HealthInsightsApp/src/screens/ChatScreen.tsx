
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuroraBlobBackground } from '../components/AuroraBlobBackground';
import { getHealthProvider } from '../domain/health';
import {
  aggregateContext,
  getNutritionForDate,
  getCycleContext,
  getMedicationContext,
  getProfileBasic,
  getState,
  getMedicalInfo,
} from '../domain/context';
import {
  buildSymptomReasoningPrompt,
  buildMisinformationPrompt,
  parseReasoningResponse,
  parseMisinformationResponse,
  detectEmergencyTrigger,
  getEmergencySafetyMessage,
} from '../domain/reasoning';
import type { ReasoningResponse, MisinformationResponse } from '../domain/reasoning';
import { chatCompletion } from '../services/aiService';

type ChatMode = 'symptom' | 'misinformation';

export function ChatScreen() {
  const [mode, setMode] = useState<ChatMode>('symptom');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reasoningResult, setReasoningResult] = useState<ReasoningResponse | null>(null);
  const [misinfoResult, setMisinfoResult] = useState<MisinformationResponse | null>(null);
  const [emergencyBanner, setEmergencyBanner] = useState(false);

  const runSymptomReasoning = useCallback(async () => {
    const message = input.trim();
    if (!message) return;

    setError(null);
    setMisinfoResult(null);
    setReasoningResult(null);
    setEmergencyBanner(detectEmergencyTrigger(message));
    setLoading(true);

    try {
      const provider = getHealthProvider();
      const today = new Date().toISOString().slice(0, 10);
      const context = await aggregateContext(today, {
        healthProvider: provider,
        getNutritionForDate,
        getCycleContext,
        getMedications: getMedicationContext,
        getProfileBasic,
        getState,
        getMedicalInfo,
      });
      const { system, user } = buildSymptomReasoningPrompt(message, context);
      const raw = await chatCompletion([
        { role: 'system', content: system },
        { role: 'user', content: user },
      ]);
      const parsed = parseReasoningResponse(raw);
      setReasoningResult(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [input]);

  const runMisinformationCheck = useCallback(async () => {
    const claim = input.trim();
    if (!claim) return;

    setError(null);
    setReasoningResult(null);
    setMisinfoResult(null);
    setLoading(true);

    try {
      const { system, user } = buildMisinformationPrompt(claim);
      const raw = await chatCompletion([
        { role: 'system', content: system },
        { role: 'user', content: user },
      ]);
      const parsed = parseMisinformationResponse(raw);
      setMisinfoResult(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [input]);

  const handleSend = useCallback(() => {
    if (mode === 'symptom') runSymptomReasoning();
    else runMisinformationCheck();
  }, [mode, runSymptomReasoning, runMisinformationCheck]);

  return (
    <AuroraBlobBackground style={styles.gradient}>
      <View style={styles.paperTint} pointerEvents="none" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'symptom' && styles.modeBtnActive]}
            onPress={() => {
              setMode('symptom');
              setReasoningResult(null);
              setMisinfoResult(null);
              setError(null);
            }}
          >
            <Text style={[styles.modeBtnText, mode === 'symptom' && styles.modeBtnTextActive]}>
              Symptom reasoning
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'misinformation' && styles.modeBtnActive]}
            onPress={() => {
              setMode('misinformation');
              setReasoningResult(null);
              setMisinfoResult(null);
              setError(null);
            }}
          >
            <Text style={[styles.modeBtnText, mode === 'misinformation' && styles.modeBtnTextActive]}>
              Check a claim
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          I help you think through symptoms with your data. I am not a doctor. When in doubt, see a
          healthcare provider.
        </Text>

        {emergencyBanner && (
          <View style={styles.emergencyBanner}>
            <Ionicons name="warning" size={20} color="#b91c1c" />
            <Text style={styles.emergencyText}>{getEmergencySafetyMessage()}</Text>
          </View>
        )}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {reasoningResult && (
            <ReasoningCard response={reasoningResult} />
          )}
          {misinfoResult && (
            <MisinformationCard response={misinfoResult} />
          )}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#5a4a3a" />
              <Text style={styles.loadingText}>Thinking…</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={
              mode === 'symptom'
                ? 'e.g. I feel dizzy today. Should I go to the doctor?'
                : 'Paste a claim you saw online to evaluate'
            }
            placeholderTextColor="#78716c"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={2000}
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.sendBtn, loading && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={loading || !input.trim()}
          >
            <Ionicons name="send" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </AuroraBlobBackground>
  );
}

function ReasoningCard({ response }: { response: ReasoningResponse }) {
  return (
    <View style={styles.card}>
      <View style={styles.alertRow}>
        <Ionicons name="shield-checkmark" size={18} color="#15803d" />
        <Text style={styles.safetyAlert}>{response.safety_alert}</Text>
      </View>
      {response.baseline_comparison.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compared to your baseline</Text>
          {response.baseline_comparison.map((line, i) => (
            <Text key={i} style={styles.bullet}>• {line}</Text>
          ))}
        </View>
      )}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Possible causes</Text>
        {response.possible_causes.map((c, i) => (
          <View key={i} style={styles.causeBlock}>
            <Text style={styles.causeText}>{c.cause}</Text>
            <Text style={styles.confidenceBadge}>{c.confidence}</Text>
            {c.supporting_data.length > 0 &&
              c.supporting_data.map((s, j) => (
                <Text key={j} style={styles.supportingData}>↳ {s}</Text>
              ))}
          </View>
        ))}
      </View>
      {response.red_flags.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.redFlagsTitle]}>When to see a doctor</Text>
          {response.red_flags.map((r, i) => (
            <Text key={i} style={styles.redFlag}>⚠ {r}</Text>
          ))}
        </View>
      )}
      <Text style={styles.reflection}>{response.reflection_prompt}</Text>
      {response.follow_up_questions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow-up questions</Text>
          {response.follow_up_questions.map((q, i) => (
            <Text key={i} style={styles.bullet}>• {q}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

function MisinformationCard({ response }: { response: MisinformationResponse }) {
  return (
    <View style={styles.card}>
      <Text style={styles.safetyAlert}>{response.disclaimer}</Text>
      <Text style={styles.sectionTitle}>Claim analyzed</Text>
      <Text style={styles.causeText}>{response.claim_analyzed}</Text>
      <Text style={styles.confidenceBadge}>Evidence: {response.evidence_confidence}</Text>
      {response.common_misconceptions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common misconceptions</Text>
          {response.common_misconceptions.map((m, i) => (
            <Text key={i} style={styles.bullet}>• {m}</Text>
          ))}
        </View>
      )}
      {response.alternative_explanations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other possibilities</Text>
          {response.alternative_explanations.map((a, i) => (
            <Text key={i} style={styles.bullet}>• {a}</Text>
          ))}
        </View>
      )}
      <Text style={styles.reflection}>{response.critical_evaluation_prompt}</Text>
    </View>
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
    paddingHorizontal: 16,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  modeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(41,37,36,0.08)',
  },
  modeBtnActive: {
    backgroundColor: '#5a4a3a',
  },
  modeBtnText: {
    fontSize: 14,
    color: '#44403c',
    fontWeight: '500',
  },
  modeBtnTextActive: {
    color: '#fef08a',
  },
  disclaimer: {
    fontSize: 12,
    color: '#57534e',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(185,28,28,0.12)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#b91c1c',
  },
  emergencyText: {
    flex: 1,
    fontSize: 13,
    color: '#991b1b',
    fontWeight: '500',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  safetyAlert: {
    flex: 1,
    fontSize: 13,
    color: '#44403c',
    lineHeight: 20,
  },
  section: { marginTop: 14 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#292524',
    marginBottom: 6,
  },
  redFlagsTitle: { color: '#b91c1c' },
  bullet: {
    fontSize: 13,
    color: '#44403c',
    lineHeight: 20,
    marginLeft: 4,
    marginBottom: 2,
  },
  causeBlock: {
    marginBottom: 10,
    paddingLeft: 4,
  },
  causeText: {
    fontSize: 14,
    color: '#292524',
    lineHeight: 20,
  },
  confidenceBadge: {
    fontSize: 11,
    color: '#78716c',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  supportingData: {
    fontSize: 12,
    color: '#57534e',
    marginTop: 2,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  redFlag: {
    fontSize: 13,
    color: '#991b1b',
    lineHeight: 20,
    marginBottom: 4,
  },
  reflection: {
    fontSize: 14,
    color: '#5a4a3a',
    fontWeight: '600',
    marginTop: 14,
    lineHeight: 22,
  },
  errorBox: {
    backgroundColor: 'rgba(185,28,28,0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: '#991b1b',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#57534e',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingVertical: 12,
    paddingBottom: 24,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#292524',
    borderWidth: 1,
    borderColor: 'rgba(41,37,36,0.15)',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#5a4a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
