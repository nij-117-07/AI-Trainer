// src/features/linguistic/idioms/lib/options.ts
/**
 * Form option lists for the Idioms tool.
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const proficiencyOptions: FieldOption[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "native-aspirant", label: "Native Aspirant" },
];
