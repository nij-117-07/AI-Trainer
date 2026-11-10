// src/features/foresight-trainer/options.ts
/** Dropdown presets for the Foresight Trainer. Values match the webui options and the backend enums. */
import type { SelectOption } from "@/components/tool/SelectField";
import type { StartFormValues } from "./types";

export const FORM_DEFAULTS: StartFormValues = {
  userContext: "",
  mainTheme: "",
  difficulty: "intermediate",
  maxScenes: 5,
};

export const DIFFICULTY_OPTIONS: SelectOption[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const DIFFICULTY_LEVELS = DIFFICULTY_OPTIONS.map((option) => option.value);
