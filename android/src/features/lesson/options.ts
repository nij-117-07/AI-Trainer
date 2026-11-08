// src/features/lesson/options.ts
/**
 * Dropdown presets and defaults for the Language Lesson form. Values match the backend enums
 * (Backend/linguistic/lesson/schemas.py) and the webui options.
 */
import type { SelectOption } from "@/components/tool/SelectField";
import type { LessonFormValues } from "./types";

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export const LEARNING_FOCUSES = ["Grammar", "Vocabulary", "Conversation", "Culture", "Pronunciation"] as const;
export const COMPLEXITY_WEIGHTS = ["Low", "Medium", "High"] as const;

export const CEFR_LEVEL_OPTIONS: SelectOption[] = [
  { value: "A1", label: "A1 — Beginner" },
  { value: "A2", label: "A2 — Elementary" },
  { value: "B1", label: "B1 — Intermediate" },
  { value: "B2", label: "B2 — Upper Intermediate" },
  { value: "C1", label: "C1 — Advanced" },
  { value: "C2", label: "C2 — Proficient" },
];

export const LEARNING_FOCUS_OPTIONS: SelectOption[] = LEARNING_FOCUSES.map((focus) => ({ value: focus, label: focus }));

export const COMPLEXITY_WEIGHT_OPTIONS: SelectOption[] = COMPLEXITY_WEIGHTS.map((weight) => ({
  value: weight,
  label: weight,
}));

export const LESSON_DEFAULTS: LessonFormValues = {
  nativeLanguage: "English",
  targetLanguage: "Japanese",
  currentLevel: "A2",
  lastLessonSummary: "",
  learningFocus: "Vocabulary",
  complexityWeight: "Medium",
  seed: "",
  userCustomInstruction: "",
};
