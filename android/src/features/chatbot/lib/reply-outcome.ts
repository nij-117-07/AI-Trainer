// src/features/chatbot/lib/reply-outcome.ts
/** Decides how a finished reply is saved: done, stopped by the user, or failed. Pure functions only. */
import type { ChatMessage } from "../types";

export interface ReplyResult {
  reply: string;
  failure: string | null;
  stopped: boolean;
}

export function replyOutcome({ reply, failure, stopped }: ReplyResult): Pick<ChatMessage, "status" | "content" | "error"> {
  if (failure) return { status: "error", content: reply, error: failure };
  if (stopped) return { status: "stopped", content: reply, error: null };
  if (reply.trim()) return { status: "done", content: reply, error: null };
  return { status: "error", content: "", error: "The model returned an empty reply." };
}
