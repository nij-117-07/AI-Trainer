// src/features/linguistic/lesson/lib/options.ts
/**
 * Form option lists for the Lesson tool.
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const cefrLevelOptions: FieldOption[] = [
  { value: "A1", label: "A1 — Beginner" },
  { value: "A2", label: "A2 — Elementary" },
  { value: "B1", label: "B1 — Intermediate" },
  { value: "B2", label: "B2 — Upper Intermediate" },
  { value: "C1", label: "C1 — Advanced" },
  { value: "C2", label: "C2 — Proficient" },
];

export const learningFocusOptions: FieldOption[] = [
  { value: "Grammar", label: "Grammar" },
  { value: "Vocabulary", label: "Vocabulary" },
  { value: "Conversation", label: "Conversation" },
  { value: "Culture", label: "Culture" },
  { value: "Pronunciation", label: "Pronunciation" },
];

export const complexityWeightOptions: FieldOption[] = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];
