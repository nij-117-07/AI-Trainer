// src/features/lesson/lib/persistence.ts
/** Storage keys and saved-draft merge for the Language Lesson form and the last lesson. */
import { isRecord } from "./text";

export const LESSON_FORM_KEY = "language-learner.lesson.generate.v2";
export const LESSON_RESULT_KEY = "language-learner.lesson.result.v1";

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
