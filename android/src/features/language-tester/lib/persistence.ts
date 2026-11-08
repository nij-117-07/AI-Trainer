// src/features/language-tester/lib/persistence.ts
/** Storage keys and restore helpers for the Language Tester drafts, results, and roleplay history. */
import { isRecord, listOf, textOf } from "./text";
import { normalizeFeedback } from "./normalize";
import type { ChatTurn } from "../types";

export const LANGUAGE_TESTER_STORAGE_KEYS = {
  assessment: "language-learner.language-tester.assessment.v1",
  fib: "language-learner.language-tester.fib.v1",
  challenge: "language-learner.language-tester.challenge.v1",
  roleplaySettings: "language-learner.language-tester.roleplay.settings.v1",
  roleplayHistory: "language-learner.language-tester.roleplay.history.v1",
  roleplayDraft: "language-learner.language-tester.roleplay.draft.v1",
} as const;

/**
 * Takes each saved field only when its type matches the default, so an old or damaged draft
 * falls back to the default for that field.
 */
export function mergeSavedForm<T extends object>(defaults: T, saved: unknown): T {
  if (!isRecord(saved)) return defaults;
  const merged = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T & string)[]) {
    const value = saved[key];
    if (typeof value === typeof defaults[key]) merged[key] = value as T[typeof key];
  }
  return merged;
}

export function normalizeChatHistory(saved: unknown): ChatTurn[] {
  return listOf(saved)
    .filter(isRecord)
    .map((item): ChatTurn => {
      const turn: ChatTurn = {
        role: item.role === "user" ? "user" : "assistant",
        content: textOf(item.content),
      };
      if (isRecord(item.feedback)) turn.feedback = normalizeFeedback(item.feedback);
      return turn;
    })
    .filter((turn) => turn.content !== "");
}
