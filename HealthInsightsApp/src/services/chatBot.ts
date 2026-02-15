/**
 * Wellness chatbot: uses Groq API when EXPO_PUBLIC_GROQ_API_KEY is set in .env,
 * otherwise falls back to local replies.
 */

import { EXPO_PUBLIC_GROQ_API_KEY } from '@env';
import { getGroqReply, type ChatMessage } from './groqChat';

const GREETING_INPUTS = [
  'hi', 'hello', 'hey', 'hey there', 'hi there', 'hello there',
  'good morning', 'good afternoon', 'good evening', 'morning', 'evening',
  'howdy', 'yo', 'sup', 'what\'s up', 'hiya',
];

const GREETING_REPLIES = [
  'Hi! How can I help you today?',
  'Hello! What\'s on your mind?',
  'Hey! I\'m here for your wellness. What would you like to talk about?',
];

const HOW_ARE_YOU_INPUTS = [
  'how are you', 'how are you doing', 'how\'s it going', 'how goes it',
  'how do you do', 'how have you been', 'you good', 'are you ok',
  'what\'s up', 'how is it going', 'how are things', 'how ya doing',
];

const HOW_ARE_YOU_REPLIES = [
  "I'm doing well, thanks for asking! How are you?",
  "I'm here and ready to help. How are you feeling today?",
  "Doing great! How can I support you today?",
];

function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.?!,]+$/g, '');
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function matchesAny(input: string, phrases: string[]): boolean {
  const n = normalize(input);
  return phrases.some((phrase) => {
    const p = normalize(phrase);
    return n === p || n.startsWith(p + ' ') || n.endsWith(' ' + p) || n.includes(' ' + p + ' ');
  });
}

function getLocalReply(userMessage: string): string {
  const trimmed = userMessage.trim();
  if (!trimmed) return "Send me a message and I'll reply!";

  if (matchesAny(trimmed, GREETING_INPUTS)) return pick(GREETING_REPLIES);
  if (matchesAny(trimmed, HOW_ARE_YOU_INPUTS)) return pick(HOW_ARE_YOU_REPLIES);

  return "I'm here to help with wellness and health. You can say hi, ask how I'm doing, or ask about your health—like how active you've been. What would you like to know?";
}

/**
 * Returns a bot reply. Uses Groq when EXPO_PUBLIC_GROQ_API_KEY is set in .env,
 * otherwise uses local replies. Pass messageHistory for Groq context and
 * userContextSummary so the bot can use profile/steps (e.g. pregnancy-safe advice).
 */
export async function getBotResponse(
  userMessage: string,
  messageHistory: ChatMessage[] = [],
  userContextSummary?: string
): Promise<string> {
  const key = typeof EXPO_PUBLIC_GROQ_API_KEY === 'string' ? EXPO_PUBLIC_GROQ_API_KEY.trim() : '';
  if (key) {
    try {
      return await getGroqReply(key, userMessage.trim(), messageHistory, userContextSummary);
    } catch (e) {
      console.warn('Groq API failed, using local reply:', e);
      return getLocalReply(userMessage);
    }
  }
  return getLocalReply(userMessage);
}
