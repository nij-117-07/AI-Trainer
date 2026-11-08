// src/features/roleplay/lib/history.ts
/**
 * Conversation history for each turn. Only the newest messages that fit the character budget are
 * sent, so long scenes stay inside the model's context window.
 */
import type { ChatMessage } from "../types";
import { listOf, textOf } from "./text";

export const HISTORY_MAX_CHARS = 12000;
export const NO_HISTORY_TEXT = "No previous interaction.";

const ROLE_LABELS: Record<string, string> = {
  user: "User",
  assistant: "Assistant",
};

/** Keeps the newest messages whose combined length fits the budget, in their original order. */
export function trimHistory(history: ChatMessage[], maxChars: number = HISTORY_MAX_CHARS): ChatMessage[] {
  const kept: ChatMessage[] = [];
  let total = 0;
  for (const entry of [...listOf(history)].reverse()) {
    const message = entry as Partial<ChatMessage> | null;
    const content = textOf(message?.content);
    if (!content || !message?.role || !ROLE_LABELS[message.role]) continue;
    if (total + content.length > maxChars) break;
    total += content.length;
    kept.unshift({ role: message.role, content });
  }
  return kept;
}

/** Formats the kept messages as one line per turn, the transcript shape the backend expects. */
export function formatHistory(history: ChatMessage[]): string {
  const lines = trimHistory(history).map((message) => `[${ROLE_LABELS[message.role]}]: ${message.content}`);
  return lines.length === 0 ? NO_HISTORY_TEXT : lines.join("\n");
}
