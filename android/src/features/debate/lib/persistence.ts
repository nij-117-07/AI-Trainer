// src/features/debate/lib/persistence.ts
/** Storage keys, defaults, and restore helpers for the Debate Engine's saved form and session. */
import type { DebateSession, PersonaFormValues } from "../types";
import { isRecord, recordOf } from "./text";

export const DEBATE_STORAGE_KEYS = {
  form: "practice.debate.form.v1",
  session: "practice.debate.session.v1",
} as const;

export const FORM_DEFAULTS: PersonaFormValues = {
  archetype: "Cynical Academic",
  style: "data-driven",
  intensity: 7,
  influences: "Keynes, Behavioral Economics",
  topic: "Universal Basic Income",
  customConstraints: "",
};

/** Takes each saved field only when its type matches the default, so a damaged draft falls back per field. */
export function restoreForm(raw: unknown): PersonaFormValues {
  const saved = recordOf(raw);
  return {
    archetype: typeof saved.archetype === "string" ? saved.archetype : FORM_DEFAULTS.archetype,
    style: typeof saved.style === "string" ? saved.style : FORM_DEFAULTS.style,
    intensity: typeof saved.intensity === "number" ? saved.intensity : FORM_DEFAULTS.intensity,
    influences: typeof saved.influences === "string" ? saved.influences : FORM_DEFAULTS.influences,
    topic: typeof saved.topic === "string" ? saved.topic : FORM_DEFAULTS.topic,
    customConstraints:
      typeof saved.customConstraints === "string" ? saved.customConstraints : FORM_DEFAULTS.customConstraints,
  };
}

/** Accepts a saved session only when both personas and the topic are present. */
export function restoreSession(raw: unknown): DebateSession | null {
  if (!isRecord(raw) || typeof raw.topic !== "string") return null;
  if (!isRecord(raw.proPersona) || !isRecord(raw.conPersona)) return null;
  return raw as unknown as DebateSession;
}
