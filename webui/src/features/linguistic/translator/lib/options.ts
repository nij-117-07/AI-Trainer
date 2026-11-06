// src/features/linguistic/translator/lib/options.ts
/**
 * Form option lists for the Translator tool.
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const toneOptions: FieldOption[] = [
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "business", label: "Business" },
  { value: "poetic", label: "Poetic" },
  { value: "technical", label: "Technical" },
];
