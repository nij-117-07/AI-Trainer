// src/features/observation-trainer/options.ts
/** Defaults for the Observation Trainer form. Text fields start empty, and placeholders show examples. */
import type { ObservationFormValues } from "./types";

export const DEFAULT_OBSERVATION_FORM: ObservationFormValues = {
  imageRequirements: "",
  trainingScenario: "",
  userObservations: "",
  contextCategory: "",
  trainingFocus: "",
  revealHidden: true,
};
