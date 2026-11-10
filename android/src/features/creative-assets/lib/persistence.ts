// src/features/creative-assets/lib/persistence.ts
/** Storage keys, defaults, and saved-form merge for the Creative Assets tool. */
import type { CreativeAssetsFormValues } from "../types";

export const CREATIVE_ASSETS_FORM_KEY = "tools.creative-assets.form.v1";
export const CREATIVE_ASSETS_RESULT_KEY = "tools.creative-assets.result.v2";

export const CREATIVE_ASSETS_DEFAULTS: CreativeAssetsFormValues = {
  taskType: "Hashtags",
  userQuery: "",
  context: "",
  referenceExamples: "",
  numberOfSuggestions: 3,
};

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
