// src/features/word-of-the-day/lib/persistence.ts
/** Storage key and saved-draft merge for the Word of the Day form. */
import { isRecord } from "./text";

export const WORD_OF_THE_DAY_STORAGE_KEY = "language-learner.word-of-the-day.generate.v1";

export interface SavedWordOfTheDayState<TForm, TResult> {
  form: TForm;
  result: TResult | null;
}

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
