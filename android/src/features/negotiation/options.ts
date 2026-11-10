// src/features/negotiation/options.ts
/** Difficulty options and allowed values for Negotiation Practice, matching the webui and backend. */
import type { ScenarioFormValues } from "./types";

export interface DifficultyChoice {
  value: string;
  label: string;
}

export const DIFFICULTY_OPTIONS: DifficultyChoice[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const DIFFICULTIES = DIFFICULTY_OPTIONS.map((option) => option.value);

/** Difficulty has a sensible default. The domain starts empty, and its placeholder shows examples. */
export const DEFAULT_SCENARIO_FORM: ScenarioFormValues = {
  difficulty: "intermediate",
  domain: "",
};
