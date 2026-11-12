// src/features/battleground/lib/persistence.ts
/** Storage keys and saved-state checks for the Battleground Simulator. */
import type { BattleRound, BattleSession } from "../types";
import { isRecord } from "./text";

export const BATTLE_STORAGE_KEYS = {
  form: "practice.battleground.form.v1",
  session: "practice.battleground.session.v1",
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

/** Accepts a saved session only when the fields the board reads are present and typed. */
export function asSavedSession(value: unknown): BattleSession | null {
  if (!isRecord(value)) return null;
  const valid =
    typeof value.topic === "string" &&
    typeof value.userHealth === "number" &&
    typeof value.opponentHealth === "number" &&
    typeof value.roundNumber === "number" &&
    Array.isArray(value.roundScores) &&
    isRecord(value.userProfile) &&
    isRecord(value.opponentProfile);
  if (!valid) return null;
  const session = value as unknown as BattleSession;
  return { ...session, rounds: Array.isArray(value.rounds) ? (value.rounds as BattleRound[]) : [] };
}
