/**
 * Wellness chatbot: uses Groq API when key is set (groq.local.ts or .env),
 * otherwise falls back to local replies.
 */

import { GROQ_CONFIG } from '../config/groq';
import { getGroqReply, type ChatMessage } from './groqChat';

const apiKey = (GROQ_CONFIG?.apiKey ?? '').trim();
const isPlaceholder = !apiKey || apiKey.includes('YOUR_') || apiKey.startsWith('gsk_YOUR_');

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
  'how u', 'how r u', 'howru', 'how are u',
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

/** True if the message is a simple greeting or "how are you" (so we can reply without full symptom pipeline). */
export function isSimpleGreeting(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return matchesAny(trimmed, GREETING_INPUTS) || matchesAny(trimmed, HOW_ARE_YOU_INPUTS);
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
  const keyToUse = isPlaceholder ? '' : apiKey;
  if (keyToUse) {
    try {
      return await getGroqReply(keyToUse, userMessage.trim(), messageHistory, userContextSummary);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn('Groq API failed, using local reply:', e);
      if (msg.includes('Invalid Groq API key') || msg.includes('invalid_api_key')) {
        return (
          "The chat can't reach the AI right now because the Groq API key is invalid or expired. " +
          "Get a new key at https://console.groq.com and add it to src/config/groq.local.ts (copy groq.local.example.ts to groq.local.ts and paste your key)."
        );
      }
      return getLocalReply(userMessage);
    }
  }
  if (isPlaceholder) {
    return (
      "To use the AI chat, add your Groq API key: get one at https://console.groq.com, then copy groq.local.example.ts to groq.local.ts in src/config and set apiKey to your key."
    );
  }
  return getLocalReply(userMessage);
}
