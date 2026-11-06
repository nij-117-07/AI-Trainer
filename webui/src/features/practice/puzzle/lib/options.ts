// src/features/practice/puzzle/lib/options.ts
/**
 * Form options for the Puzzle Generator.
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const puzzleTypeOptions: FieldOption[] = [
  { value: "riddle", label: "Riddle" },
  { value: "logic grid", label: "Logic Grid" },
  { value: "sequence", label: "Sequence" },
  { value: "wordplay", label: "Wordplay" },
  { value: "cipher", label: "Cipher" },
];

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
