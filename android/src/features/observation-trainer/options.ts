// src/features/observation-trainer/options.ts
/** Defaults for the Observation Trainer form. They match the webui defaults. */
import type { ObservationFormValues } from "./types";

export const DEFAULT_OBSERVATION_FORM: ObservationFormValues = {
  imageRequirements: "",
  trainingScenario: "Crime scene investigation",
  userObservations: "",
  contextCategory: "",
  trainingFocus: "",
  revealHidden: true,
};
