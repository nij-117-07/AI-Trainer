// src/features/idioms/lib/persistence.ts
/** Storage keys and saved-draft merge for the Idioms form and the last lesson. */
import { isRecord } from "./text";

export const IDIOMS_FORM_KEY = "language-learner.idioms.generate.v2";
export const IDIOMS_LESSON_KEY = "language-learner.idioms.lesson.v1";

export const SAVE_FAILED_MESSAGE = "Changes couldn't be saved. They'll try again.";

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
