// src/features/dharma-instructor/lib/transcript.ts
/**
 * Builds the reply text shown to the student and the conversation history sent to the model.
 * Student lines start with "Student:" and instructor replies start with "Instructor:".
 */
import type { DharmaMessage, DharmaTurn } from "../types";

export function formatTurn(turn: DharmaTurn): string {
  const parts = [turn.reply];
  if (turn.teaching) parts.push(`**Teaching:** ${turn.teaching}`);
  if (turn.practice) parts.push(`**Practice:** ${turn.practice}`);
  return parts.join("\n\n");
}

export function toHistory(messages: DharmaMessage[]): string[] {
  return messages.map((message) =>
    message.role === "user" ? `Student: ${message.content}` : `Instructor: ${message.content}`,
  );
}

export function formatHistory(lines: string[]): string {
  if (lines.length === 0) return "No earlier conversation.";
  return lines.join("\n");
}
