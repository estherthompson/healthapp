import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

/**
 * Phase 2 placeholder: AI Chatbot integration
 * - Health data summarization
 * - OpenAI API integration
 * - Chat UI with message bubbles
 */
export function ChatScreen() {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={[styles.container, isDark && styles.bgDark]}>
      <Text style={[styles.title, isDark && styles.textDark]}>
        Wellness Chat
      </Text>
      <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
        Phase 2: AI chatbot coming next. You’ll be able to ask things like “How
        active was I this week?” and get personalized wellness insights.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgDark: {
    backgroundColor: '#1c1c1e',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  textDark: {
    color: '#e5e5ea',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  subtitleDark: {
    color: '#8e8e93',
  },
});
