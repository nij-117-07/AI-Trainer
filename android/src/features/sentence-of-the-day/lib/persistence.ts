// src/features/sentence-of-the-day/lib/persistence.ts
/** Storage keys and saved-draft merge for the Sentence of the Day form and the last sentence. */
import { isRecord } from "./text";

export const SENTENCE_FORM_KEY = "language-learner.sentence-of-the-day.generate.v2";
export const SENTENCE_RESULT_KEY = "language-learner.sentence-of-the-day.sentence.v1";

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
