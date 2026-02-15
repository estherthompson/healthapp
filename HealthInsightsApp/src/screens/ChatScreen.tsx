import React, { useCallback, useState, useRef, useEffect } from 'react';
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
  buildConversationSystemPrompt,
  buildMisinformationPrompt,
  parseMisinformationResponse,
  detectEmergencyTrigger,
  getEmergencySafetyMessage,
} from '../domain/reasoning';
import type { MisinformationResponse } from '../domain/reasoning';
import { chatCompletion } from '../services/aiService';
import type { ChatMessage } from '../services/aiService';

type ChatMode = 'symptom' | 'misinformation';

type ChatEntry =
  | { role: 'user'; text: string }
  | { role: 'assistant'; text: string; misinfo?: MisinformationResponse };

/** Keep last N messages in API payload so we don't exceed context window. */
const MAX_HISTORY_MESSAGES = 20;

export function ChatScreen() {
  const [mode, setMode] = useState<ChatMode>('symptom');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emergencyBanner, setEmergencyBanner] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const sendingRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(t);
  }, [messages, loading]);

  const runSymptomReasoning = useCallback(async (message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;
    if (sendingRef.current) return;
    sendingRef.current = true;

    setError(null);
    setEmergencyBanner(detectEmergencyTrigger(trimmed));
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
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
      const systemContent = buildConversationSystemPrompt(context);
      const recent = messages.slice(-MAX_HISTORY_MESSAGES);
      const history: ChatMessage[] = recent.map((m) => ({
        role: m.role,
        content: m.text,
      }));
      const apiMessages: ChatMessage[] = [
        { role: 'system', content: systemContent },
        ...history,
        { role: 'user', content: trimmed },
      ];
      const raw = await chatCompletion(apiMessages);
      const reply =
        typeof raw === 'string' && raw.trim()
          ? raw.trim()
          : "I didn't get a response. Please try again.";
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Something went wrong.';
      setError(errMsg);
      setMessages((prev) => [...prev, { role: 'assistant', text: errMsg }]);
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  }, [messages]);

  const runMisinformationCheck = useCallback(async (claim: string) => {
    const trimmed = claim.trim();
    if (!trimmed) return;
    if (sendingRef.current) return;
    sendingRef.current = true;

    setError(null);
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      const { system, user } = buildMisinformationPrompt(trimmed);
      const raw = await chatCompletion([
        { role: 'system', content: system },
        { role: 'user', content: user },
      ]);
      const parsed = parseMisinformationResponse(raw);
      const summary =
        parsed.claim_analyzed +
        (parsed.evidence_confidence ? ` (Evidence: ${parsed.evidence_confidence})` : '');
      setMessages((prev) => [...prev, { role: 'assistant', text: summary, misinfo: parsed }]);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Something went wrong.';
      setError(errMsg);
      setMessages((prev) => [...prev, { role: 'assistant', text: errMsg }]);
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || loading) return;
    if (mode === 'symptom') runSymptomReasoning(text);
    else runMisinformationCheck(text);
  }, [mode, input, loading, runSymptomReasoning, runMisinformationCheck]);

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
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((entry, idx) => {
            if (entry.role === 'user') {
              return (
                <View key={idx} style={styles.userBubbleWrap}>
                  <View style={styles.userBubble}>
                    <Text style={styles.userBubbleText}>{entry.text}</Text>
                  </View>
                </View>
              );
            }
            return (
              <View key={idx}>
                <View style={styles.assistantBubbleWrap}>
                  <View style={styles.assistantBubble}>
                    <Text style={styles.assistantBubbleText}>{entry.text}</Text>
                  </View>
                </View>
                {entry.misinfo && (
                  <MisinformationCard response={entry.misinfo} />
                )}
              </View>
            );
          })}
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
                ? 'Say hi, or ask about your food log, sleep, how you feel…'
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
  userBubbleWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  userBubble: {
    maxWidth: '85%',
    backgroundColor: '#5a4a3a',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  userBubbleText: {
    fontSize: 15,
    color: '#fef08a',
    lineHeight: 20,
  },
  assistantBubbleWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  assistantBubble: {
    maxWidth: '85%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(41,37,36,0.1)',
  },
  assistantBubbleText: {
    fontSize: 15,
    color: '#292524',
    lineHeight: 22,
  },
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
