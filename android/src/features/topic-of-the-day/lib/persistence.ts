// src/features/topic-of-the-day/lib/persistence.ts
/** Storage keys and saved-draft merge for the Topic of the Day form and the last topic. */
import { isRecord } from "./text";

export const TOPIC_OF_THE_DAY_FORM_KEY = "learning.topic-of-the-day.form.v1";
export const TOPIC_OF_THE_DAY_RESULT_KEY = "learning.topic-of-the-day.topic.v1";

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
