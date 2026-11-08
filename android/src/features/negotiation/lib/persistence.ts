// src/features/negotiation/lib/persistence.ts
/** Storage keys and saved-state checks for Negotiation Practice. */
import { isRecord } from "./text";
import type { NegotiationSession, ScenarioFormValues } from "../types";

export const NEGOTIATION_FORM_KEY = "practice.negotiation.form.v1";
export const NEGOTIATION_SESSION_KEY = "practice.negotiation.session.v1";

/** Takes each saved field only when its type matches the default, so a damaged draft falls back per field. */
export function mergeSavedForm(defaults: ScenarioFormValues, saved: unknown): ScenarioFormValues {
  if (!isRecord(saved)) return defaults;
  return {
    difficulty: typeof saved.difficulty === "string" ? saved.difficulty : defaults.difficulty,
    domain: typeof saved.domain === "string" ? saved.domain : defaults.domain,
  };
}

/** A saved session is kept only when its scenario and transcript are present. */
export function asSession(saved: unknown): NegotiationSession | null {
  if (!isRecord(saved) || !isRecord(saved.scenario) || !Array.isArray(saved.log)) return null;
  return saved as unknown as NegotiationSession;
}
