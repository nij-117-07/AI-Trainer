// src/features/observation-trainer/lib/persistence.ts
/** Storage keys and saved-value readers for the Observation Trainer. The form and the report use separate keys. */
import { DEFAULT_OBSERVATION_FORM } from "../options";
import type { ObservationFormValues } from "../types";
import { isRecord } from "./text";

export const OBSERVATION_FORM_KEY = "practice.observation-trainer.form.v1";
export const OBSERVATION_RESULT_KEY = "practice.observation-trainer.result.v1";

/** Takes each saved field only when its type matches the default, so a damaged draft falls back cleanly. */
export function parseSavedForm(saved: unknown): ObservationFormValues {
  if (!isRecord(saved)) return DEFAULT_OBSERVATION_FORM;
  const merged = { ...DEFAULT_OBSERVATION_FORM };
  for (const key of Object.keys(DEFAULT_OBSERVATION_FORM) as (keyof ObservationFormValues)[]) {
    const value = saved[key];
    if (typeof value === typeof DEFAULT_OBSERVATION_FORM[key]) {
      (merged as Record<string, unknown>)[key] = value;
    }
  }
  return merged;
}
