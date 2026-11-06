// src/features/learning/explainer/lib/options.ts
/**
 * Label/value option sets for shared dropdown fields. Keeps tool pages DRY
 * and gives users friendly labels over the raw API enum values.
 */
import type { FieldOption } from "../components/fields";

export const expertiseLevelOptions: FieldOption[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
];

export const explanationStyleOptions: FieldOption[] = [
  { value: "academic", label: "Academic" },
  { value: "practical", label: "Practical" },
  { value: "with examples", label: "With Examples" },
];

export const roadmapStyleOptions: FieldOption[] = [
  { value: "academic", label: "Academic" },
  { value: "practical", label: "Practical" },
  { value: "with examples", label: "With Examples" },
  { value: "conceptual", label: "Conceptual" },
];

export const userLevelOptions: FieldOption[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

export const questionCategoryOptions: FieldOption[] = [
  { value: "conceptual-bridge", label: "Conceptual Bridge" },
  { value: "counterfactual", label: "Counterfactual" },
  { value: "first-principles", label: "First Principles" },
  { value: "applied-case-study", label: "Applied Case Study" },
  { value: "reductio-ad-absurdum", label: "Reductio ad Absurdum" },
];

export const numQuestionsOptions: FieldOption[] = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));
