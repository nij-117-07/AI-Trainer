// src/features/roleplay-chatbot/lib/normalize.ts
/** Turns model output into typed reply values. Missing fields become empty strings. */
import type { ChatTurn, RoleplayTurnResult } from "../types";

export function textOf(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function normalizeTurn(raw: unknown): RoleplayTurnResult {
  const source = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  return {
    response: textOf(source.characterResponse).trim(),
    emotion: textOf(source.emotionTag).trim(),
    action: textOf(source.actionDescription).trim(),
  };
}

/** Lists the earlier turns in the backend's transcript format. */
export function formatHistory(history: ChatTurn[], characterName: string): string {
  const turns = Array.isArray(history) ? history : [];
  const lines = turns.flatMap((turn) => {
    if (turn.role === "user") return [`[User]: ${turn.content}`];
    if (turn.role === "assistant") return [`[${characterName}]: ${turn.content}`];
    return [];
  });
  return lines.length === 0 ? "No previous interaction." : lines.join("\n");
}
