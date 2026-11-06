// src/features/practice/socratic/lib/options.ts
/**
 * Form options for the Socratic Challenger.
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const confidenceLevelOptions: FieldOption[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "certain", label: "Certain" },
];
