// src/features/executive-eq/options.ts
/**
 * Dropdown presets for the Executive EQ Trainer. Values match the webui options and the backend
 * enums, so these fields do not accept custom text. Text fields start empty.
 */
import type { SelectOption } from "@/components/tool/SelectField";
import type { ScenarioFormValues } from "./types";

export const LEARNING_FOCUS_OPTIONS: SelectOption[] = [
  { value: "diplomatic_refusal", label: "Diplomatic refusal" },
  { value: "assertive_silence", label: "Assertive silence" },
  { value: "implied_authority", label: "Implied authority" },
  { value: "strategic_ambiguity", label: "Strategic ambiguity" },
];

export const DIFFICULTY_OPTIONS: SelectOption[] = [
  { value: "Rising Star", label: "Rising Star" },
  { value: "Seasoned Exec", label: "Seasoned Exec" },
  { value: "Ruthless Board", label: "Ruthless Board" },
  { value: "Crisis Mode", label: "Crisis Mode" },
];

export const DEFAULT_SCENARIO_FORM: ScenarioFormValues = {
  userRole: "",
  narrativeArc: "",
  learningFocus: "strategic_ambiguity",
  difficultyLevel: "Ruthless Board",
  industryContext: "",
};

export const LEARNING_FOCUSES = LEARNING_FOCUS_OPTIONS.map((option) => option.value);
export const DIFFICULTY_LEVELS = DIFFICULTY_OPTIONS.map((option) => option.value);
