// src/features/bias-inoculator/lib/persistence.ts
/** Storage key and saved-draft helpers for the Cognitive Bias Inoculator. */
import type { BiasScenario } from "../types";

export const BIAS_STORAGE_KEY = "practice.bias-inoculator.v1";

export interface SavedBiasState {
  form: unknown;
  result: unknown;
}

/**
 * Takes each saved field only when its type matches the default, so an old or damaged draft
 * falls back to the default for that field.
 */
export function mergeSavedForm<T extends object>(defaults: T, saved: unknown): T {
  if (typeof saved !== "object" || saved === null || Array.isArray(saved)) return defaults;
  const merged = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T & string)[]) {
    const value = (saved as Record<string, unknown>)[key];
    if (typeof value === typeof defaults[key]) merged[key] = value as T[typeof key];
  }
  return merged;
}

/** Accepts a saved scenario only when its text fields are present. */
export function asSavedScenario(value: unknown): BiasScenario | null {
  if (typeof value !== "object" || value === null) return null;
  const scenario = value as Partial<BiasScenario>;
  const valid = typeof scenario.scenarioSetup === "string" && typeof scenario.intuitiveTrap === "string";
  return valid ? (scenario as BiasScenario) : null;
}
