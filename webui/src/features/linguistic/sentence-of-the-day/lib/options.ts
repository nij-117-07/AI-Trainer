// src/features/linguistic/sentence-of-the-day/lib/options.ts
/**
 * Form option lists for the Sentence of the Day tool.
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const contextSettingOptions: FieldOption[] = [
  { value: "business", label: "Business" },
  { value: "casual", label: "Casual" },
  { value: "literary", label: "Literary" },
  { value: "romantic", label: "Romantic" },
  { value: "travel", label: "Travel" },
];

export const complexityLevelOptions: FieldOption[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "native-level", label: "Native Level" },
];
