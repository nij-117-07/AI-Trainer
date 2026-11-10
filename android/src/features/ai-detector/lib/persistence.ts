// src/features/ai-detector/lib/persistence.ts
/** Storage key, empty state, and the reader that rebuilds the saved form and result safely. */
import type { AiDetectorSavedState, DetectFormValues } from "../types";
import { normalizeDetection } from "./normalize";

export const AI_DETECTOR_STORAGE_KEY = "tools.ai-detector.check.v1";

export const AI_DETECTOR_DEFAULTS: DetectFormValues = {
  textToCheck: "",
  additionalComments: "",
};

export const INITIAL_AI_DETECTOR_STATE: AiDetectorSavedState = {
  form: AI_DETECTOR_DEFAULTS,
  result: null,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringOf(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Rebuilds the saved state. Anything unreadable falls back to the empty value for that field. */
export function parseSavedState(saved: unknown): AiDetectorSavedState {
  if (!isRecord(saved)) return INITIAL_AI_DETECTOR_STATE;
  const form = isRecord(saved.form) ? saved.form : {};
  let result: AiDetectorSavedState["result"] = null;
  if (isRecord(saved.result)) {
    try {
      result = normalizeDetection(saved.result);
    } catch {
      result = null;
    }
  }
  return {
    form: {
      textToCheck: stringOf(form.textToCheck),
      additionalComments: stringOf(form.additionalComments),
    },
    result,
  };
}
