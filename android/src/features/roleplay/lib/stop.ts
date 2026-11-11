// src/features/roleplay/lib/stop.ts
/**
 * Stopped replies in the roleplay transcript. A stopped reply keeps its partial text and is flagged,
 * so the thread can say it is incomplete and offer Regenerate. Saved messages without the flag load as
 * complete replies.
 */
import type { ChatMessage } from "../types";
import { isRecord, textOf } from "./text";

export function appendStoppedReply(history: ChatMessage[], partial: string): ChatMessage[] {
  return [...history, { role: "assistant", content: partial.trim(), stopped: true }];
}

/** Reads one saved message. A stopped reply is kept even with no text; other empty messages are dropped. */
export function readMessage(entry: unknown): ChatMessage | null {
  if (!isRecord(entry)) return null;
  if (entry.role !== "user" && entry.role !== "assistant") return null;
  const content = textOf(entry.content);
  const stopped = entry.role === "assistant" && entry.stopped === true;
  if (!content && !stopped) return null;
  return { role: entry.role, content, stopped };
}
