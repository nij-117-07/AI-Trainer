// src/features/prompt-generator/lib/persistence.ts
/** Storage key and saved-draft helpers for the Prompt Generator. */

export const PROMPT_GENERATOR_STORAGE_KEY = "tools.prompt-generator.generate.v1";

export interface SavedDraft<TForm, TResult> {
  form: TForm;
  result: TResult | null;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
