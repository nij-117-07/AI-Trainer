// src/features/riddle/options.ts
/**
 * Dropdown presets and defaults for the Riddle Generator. Values match the webui options and the
 * backend Literal types. The choice fields do not accept custom text.
 */
import type { RiddleFormValues } from "./types";

export interface RiddleChoice {
  value: string;
  label: string;
}

export const COGNITIVE_DOMAINS = ["verbal", "mathematical", "spatial", "lateral"] as const;
export const DIFFICULTY_LEVELS = ["novice", "intermediate", "expert", "genius"] as const;

export const COGNITIVE_DOMAIN_OPTIONS: RiddleChoice[] = [
  { value: "verbal", label: "Verbal" },
  { value: "mathematical", label: "Mathematical" },
  { value: "spatial", label: "Spatial" },
  { value: "lateral", label: "Lateral" },
];

export const DIFFICULTY_OPTIONS: RiddleChoice[] = [
  { value: "novice", label: "Novice" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
  { value: "genius", label: "Genius" },
];

export const DEFAULT_FORM: RiddleFormValues = {
  fieldOfInterest: "Space",
  targetDomain: "lateral",
  difficultyLevel: "intermediate",
};
