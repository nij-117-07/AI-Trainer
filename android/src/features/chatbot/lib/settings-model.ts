// src/features/chatbot/lib/settings-model.ts
/** Chatbot-wide settings: defaults, limits, and reading saved values. Pure functions only. */
import type { ChatbotSettings } from "../types";

export const DEFAULT_CHATBOT_SETTINGS: ChatbotSettings = {
  defaultPersonaId: "",
  streamReplies: true,
  historyLimit: 30,
  autoSpeak: false,
};

export const HISTORY_LIMIT_RANGE = { min: 2, max: 100 } as const;

export function validateHistoryLimit(value: number): string | null {
  if (!Number.isInteger(value) || value < HISTORY_LIMIT_RANGE.min || value > HISTORY_LIMIT_RANGE.max) {
    return `History length must be a whole number from ${HISTORY_LIMIT_RANGE.min} to ${HISTORY_LIMIT_RANGE.max}.`;
  }
  return null;
}

export function normalizeChatbotSettings(value: unknown): ChatbotSettings {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const limit = raw.historyLimit;
  const validLimit =
    typeof limit === "number" && validateHistoryLimit(limit) === null ? limit : DEFAULT_CHATBOT_SETTINGS.historyLimit;
  return {
    defaultPersonaId: typeof raw.defaultPersonaId === "string" ? raw.defaultPersonaId : "",
    streamReplies: typeof raw.streamReplies === "boolean" ? raw.streamReplies : DEFAULT_CHATBOT_SETTINGS.streamReplies,
    historyLimit: validLimit,
    autoSpeak: typeof raw.autoSpeak === "boolean" ? raw.autoSpeak : DEFAULT_CHATBOT_SETTINGS.autoSpeak,
  };
}
