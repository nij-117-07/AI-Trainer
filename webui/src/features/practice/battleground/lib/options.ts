// src/features/practice/battleground/lib/options.ts
/**
 * Form options for the Battleground Simulator.
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const difficultyOptions: FieldOption[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];
