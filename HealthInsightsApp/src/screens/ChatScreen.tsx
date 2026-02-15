import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { useAppData, buildUserContextSummary } from '../context/AppDataContext';
import { useHealth } from '../hooks/useHealth';
import { getBotResponse } from '../services/chatBot';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: "Hi! I'm your wellness assistant. Say hi or ask how I'm doing—I'm here to help.",
};

export function ChatScreen() {
  const isDark = useColorScheme() === 'dark';
  const { profile } = useAppData();
  const { stepCount, waterLiters } = useHealth();
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const userContextSummary = buildUserContextSummary(profile, stepCount, waterLiters);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  const [sending, setSending] = useState(false);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setInput('');
    setSending(true);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);

    const loadingId = `bot-loading-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: loadingId, role: 'assistant', text: 'Thinking…' },
    ]);

    const history = [...messages, userMsg]
      .filter((m) => m.role === 'assistant' ? m.text !== 'Thinking…' : true)
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.text }));

    try {
      const reply = await getBotResponse(trimmed, history, userContextSummary || undefined);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId ? { ...m, text: reply } : m
        )
      );
    } catch (e) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? { ...m, text: "Something went wrong. Please try again." }
            : m
        )
      );
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.bubbleWrap,
        item.role === 'user' ? styles.bubbleWrapUser : styles.bubbleWrapBot,
      ]}
    >
      <View
        style={[
          styles.bubble,
          item.role === 'user'
            ? [styles.bubbleUser, isDark && styles.bubbleUserDark]
            : [styles.bubbleBot, isDark && styles.bubbleBotDark],
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            item.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextBot,
            isDark && (item.role === 'user' ? styles.bubbleTextUserDark : styles.bubbleTextBotDark),
          ]}
        >
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark && styles.bgDark]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={[styles.inputRow, isDark && styles.inputRowDark]}>
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          value={input}
          onChangeText={setInput}
          placeholder="Message..."
          placeholderTextColor={isDark ? '#8e8e93' : '#999'}
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendButton, (!input.trim() || sending) && styles.sendDisabled]}
          onPress={sendMessage}
          disabled={!input.trim() || sending}
        >
          <Text style={styles.sendLabel}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bgDark: {
    backgroundColor: '#1c1c1e',
  },
  listContent: {
    padding: 16,
    paddingBottom: 8,
  },
  bubbleWrap: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  bubbleWrapUser: {
    alignItems: 'flex-end',
  },
  bubbleWrapBot: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  bubbleBot: {
    backgroundColor: '#e5e5ea',
    borderBottomLeftRadius: 4,
  },
  bubbleBotDark: {
    backgroundColor: '#2c2c2e',
  },
  bubbleUser: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  bubbleUserDark: {
    backgroundColor: '#0a84ff',
  },
  bubbleText: {
    fontSize: 16,
  },
  bubbleTextBot: {
    color: '#000',
  },
  bubbleTextBotDark: {
    color: '#e5e5ea',
  },
  bubbleTextUser: {
    color: '#fff',
  },
  bubbleTextUserDark: {
    color: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 24,
    gap: 8,
    backgroundColor: '#f2f2f7',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#c7c7cc',
  },
  inputRowDark: {
    backgroundColor: '#1c1c1e',
    borderTopColor: '#38383a',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#c7c7cc',
  },
  inputDark: {
    backgroundColor: '#2c2c2e',
    color: '#e5e5ea',
    borderColor: '#48484a',
  },
  sendButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  sendDisabled: {
    opacity: 0.5,
  },
  sendLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
