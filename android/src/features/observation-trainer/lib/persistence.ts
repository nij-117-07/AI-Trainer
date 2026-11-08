// src/features/observation-trainer/lib/persistence.ts
/** Storage key and saved-session helpers for the Observation Trainer. */
import { DEFAULT_OBSERVATION_FORM } from "../options";
import type { ObservationFormValues, ObservationTrainResult } from "../types";
import { readTrainResult } from "./normalize";
import { isRecord } from "./text";

export const OBSERVATION_SESSION_KEY = "practice.observation-trainer.session.v1";

export interface SavedObservationSession {
  form: ObservationFormValues;
  result: ObservationTrainResult | null;
}

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

export function parseSavedSession(saved: unknown): SavedObservationSession {
  if (!isRecord(saved)) return { form: DEFAULT_OBSERVATION_FORM, result: null };
  return { form: parseSavedForm(saved.form), result: readTrainResult(saved.result) };
}
