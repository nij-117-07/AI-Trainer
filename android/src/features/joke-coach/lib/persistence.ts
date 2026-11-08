// src/features/joke-coach/lib/persistence.ts
/** Storage keys and saved-draft helpers for the Joke Coach modes. */
import { isRecord } from "./text";

export interface SavedModeState<TForm, TResult> {
  form: TForm;
  result: TResult | null;
}

export const JOKE_COACH_STORAGE_KEYS = {
  generate: "practice.joke-coach.generate.v1",
  evaluate: "practice.joke-coach.evaluate.v1",
  rewrite: "practice.joke-coach.rewrite.v1",
  classify: "practice.joke-coach.classify.v1",
  practice: "practice.joke-coach.practice.v1",
  crowd: "practice.joke-coach.crowd.v1",
} as const;

/** Takes each saved field only when its type matches the default, so a damaged draft falls back per field. */
export function mergeSavedForm<T extends object>(defaults: T, saved: unknown): T {
  if (!isRecord(saved)) return defaults;
  const merged = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T & string)[]) {
    const value = saved[key];
    if (typeof value === typeof defaults[key]) merged[key] = value as T[typeof key];
  }
  return merged;
}
