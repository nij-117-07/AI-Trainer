// src/features/poet-engine/lib/persistence.ts
/** Storage key and saved-draft helper for the Poet Engine. */
import { isRecord } from "./text";

export const POET_ENGINE_STORAGE_KEY =
  "language-learner.poet-engine.explain.v1";

/**
 * Takes each saved field only when its type matches the default, so an old or damaged draft
 * falls back to the default for that field.
 */
export function mergeSavedForm<T extends object>(
  defaults: T,
  saved: unknown,
): T {
  if (!isRecord(saved)) return defaults;
  const merged = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T & string)[]) {
    const value = saved[key];
    if (typeof value === typeof defaults[key])
      merged[key] = value as T[typeof key];
  }
  return merged;
}
