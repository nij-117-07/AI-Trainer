// src/features/practice/riddle/lib/options.ts
/**
 * Form options for the Riddle Generator.
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const cognitiveDomainOptions: FieldOption[] = [
  { value: "verbal", label: "Verbal" },
  { value: "mathematical", label: "Mathematical" },
  { value: "spatial", label: "Spatial" },
  { value: "lateral", label: "Lateral" },
];

export const difficultyLevelOptions: FieldOption[] = [
  { value: "novice", label: "Novice" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
  { value: "genius", label: "Genius" },
];
