// src/features/sentence-of-the-day/options.ts
/**
 * Dropdown presets and defaults for the Sentence of the Day form. Values match the backend enums
 * (Backend/linguistic/sentence_of_the_day/schemas.py) and the webui options.
 */
import type { SelectOption } from "@/components/tool/SelectField";
import type { SentenceFormValues } from "./types";

export const CONTEXT_SETTINGS = ["business", "casual", "literary", "romantic", "travel"] as const;
export const COMPLEXITY_LEVELS = ["beginner", "intermediate", "advanced", "native-level"] as const;

export const CONTEXT_SETTING_OPTIONS: SelectOption[] = [
  { value: "business", label: "Business" },
  { value: "casual", label: "Casual" },
  { value: "literary", label: "Literary" },
  { value: "romantic", label: "Romantic" },
  { value: "travel", label: "Travel" },
];

export const COMPLEXITY_LEVEL_OPTIONS: SelectOption[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "native-level", label: "Native Level" },
];

export const SENTENCE_DEFAULTS: SentenceFormValues = {
  targetLanguage: "Spanish",
  nativeLanguage: "English",
  contextSetting: "literary",
  complexityLevel: "advanced",
};
