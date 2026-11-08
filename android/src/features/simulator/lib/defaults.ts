// src/features/simulator/lib/defaults.ts
/** Starting values for the Simulator forms and the built-in persona prompts, as in the webui. */
import type { SimulationFormValues } from "../types";

export const RUN_DEFAULTS: SimulationFormValues = {
  persona: "A pragmatic retired starship captain.",
  scenario: "Oxygen levels at 15%. Distress signal detected.",
  userInput: "Captain, we must help them!",
  additionalContext: "Crew morale is low.",
};

export const CHAT_DEFAULTS = {
  persona: RUN_DEFAULTS.persona,
  scenario: RUN_DEFAULTS.scenario,
  draft: "",
};

/** Persona prompts shipped with the app. Saved prompts with the same name replace them. */
export const BUILT_IN_PROMPTS: Record<string, string> = {
  captain_crush: "You are a strict, no-nonsense starship captain.",
};
