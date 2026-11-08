// src/features/creative-assets/lib/persistence.ts
/** Storage key and saved-draft helper for the Creative Assets tool. */

export interface SavedCreativeAssetsState<TForm, TResult> {
  form: TForm;
  result: TResult | null;
}

export const CREATIVE_ASSETS_STORAGE_KEY = "tools.creative-assets.generate.v1";

/**
 * Takes each saved field only when its type matches the default, so an old or damaged draft
 * falls back to the default for that field.
 */
export function mergeSavedForm<T extends object>(defaults: T, saved: unknown): T {
  if (typeof saved !== "object" || saved === null || Array.isArray(saved)) return defaults;
  const record = saved as Record<string, unknown>;
  const merged = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T & string)[]) {
    const value = record[key];
    if (typeof value === typeof defaults[key]) merged[key] = value as T[typeof key];
  }
  return merged;
}
