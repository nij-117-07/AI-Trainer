// src/features/practice/foresight-trainer/lib/options.ts
/**
 * Form options for the Foresight Trainer.
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const difficultyOptions: FieldOption[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];
