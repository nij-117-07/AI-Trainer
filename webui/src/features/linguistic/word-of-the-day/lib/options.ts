// src/features/linguistic/word-of-the-day/lib/options.ts
/**
 * Form option lists for the Word of the Day tool.
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const proficiencyOptions: FieldOption[] = [
  { value: "basic", label: "Basic" },
  { value: "academic", label: "Academic" },
  { value: "poetic", label: "Poetic" },
  { value: "slang", label: "Slang" },
];
