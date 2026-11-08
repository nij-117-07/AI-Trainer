// src/features/clarity-trainer/lib/persistence.ts
/** Storage keys, defaults, and restore helpers for the Clarity Trainer's saved form and round. */
import type { ClarityRound, ScenarioFormValues } from "../types";
import { isRecord, recordOf } from "./text";

export const CLARITY_STORAGE_KEYS = {
  form: "practice.clarity-trainer.form.v1",
  round: "practice.clarity-trainer.round.v1",
} as const;

export const FORM_DEFAULTS: ScenarioFormValues = {
  difficulty: "random",
  category: "random",
  userContext: "Software engineer",
};

/** Takes each saved field only when its type matches the default, so a damaged draft falls back per field. */
export function restoreForm(raw: unknown): ScenarioFormValues {
  const saved = recordOf(raw);
  return {
    difficulty: typeof saved.difficulty === "string" ? saved.difficulty : FORM_DEFAULTS.difficulty,
    category: typeof saved.category === "string" ? saved.category : FORM_DEFAULTS.category,
    userContext: typeof saved.userContext === "string" ? saved.userContext : FORM_DEFAULTS.userContext,
  };
}

/** Accepts a saved round only when it still has a scenario object; anything else starts fresh. */
export function restoreRound(raw: unknown): ClarityRound | null {
  if (!isRecord(raw) || !isRecord(raw.scenario)) return null;
  return {
    scenario: raw.scenario as unknown as ClarityRound["scenario"],
    response: typeof raw.response === "string" ? raw.response : "",
    evaluation: isRecord(raw.evaluation) ? (raw.evaluation as unknown as ClarityRound["evaluation"]) : null,
  };
}
