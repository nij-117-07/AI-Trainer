// src/features/learning/motivation/lib/options.ts
/**
 * Label/value option sets for the Motivation form fields.
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const quoteTypeOptions: FieldOption[] = [
  { value: "stoic", label: "Stoic" },
  { value: "modern", label: "Modern" },
  { value: "poetic", label: "Poetic" },
  { value: "tough-love", label: "Tough Love" },
];
