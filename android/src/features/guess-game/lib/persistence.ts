// src/features/guess-game/lib/persistence.ts
/** Device storage keys and the saved-draft merge for the Guess Game setup form. */
import { isRecord } from "./guard";

export const GUESS_GAME_KEYS = {
  form: "practice.guess-game.form.v1",
  session: "practice.guess-game.session.v1",
} as const;

/** Takes each saved field only when its type matches the default, so a damaged draft falls back. */
export function mergeSavedForm<T extends object>(defaults: T, saved: unknown): T {
  if (!isRecord(saved)) return defaults;
  const merged = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T & string)[]) {
    const value = saved[key];
    if (typeof value === typeof defaults[key]) merged[key] = value as T[typeof key];
  }
  return merged;
}
