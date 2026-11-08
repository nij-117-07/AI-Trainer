// src/features/charts/lib/persistence.ts
/** Storage keys and saved-draft helpers for the Chart.js Generator. */
import { isRecord } from "./text";

export interface SavedChartState<TForm, TResult> {
  form: TForm;
  result: TResult | null;
}

export const CHART_STORAGE_KEYS = {
  draft: "tools.charts.generate.v1",
  history: "tools.charts.history.v1",
} as const;

/**
 * Takes each saved field only when its type matches the default, so an old or damaged draft
 * falls back to the default for that field.
 */
export function mergeSavedForm<T extends object>(defaults: T, saved: unknown): T {
  if (!isRecord(saved)) return defaults;
  const merged = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T & string)[]) {
    const value = saved[key];
    if (typeof value === typeof defaults[key]) merged[key] = value as T[typeof key];
  }
  return merged;
}
