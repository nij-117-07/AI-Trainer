// src/features/rewriter/lib/persistence.ts
/** Storage key and saved-draft helper for the Rewriter. */
import { isRecord } from "./text";

export const REWRITER_STORAGE_KEY = "language-learner.rewriter.process.v1";

export const SAVE_FAILED_MESSAGE = "Changes couldn't be saved. They'll try again.";

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
