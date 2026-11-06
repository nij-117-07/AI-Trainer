// src/features/learning/projects/lib/options.ts
/**
 * Label/value option sets for the Project Recommender form fields.
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const projectSizeOptions: FieldOption[] = [
  { value: "small", label: "Small (1-2 days)" },
  { value: "medium", label: "Medium (1 week)" },
  { value: "large", label: "Large (2-4 weeks)" },
];

export const projectDifficultyOptions: FieldOption[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];
