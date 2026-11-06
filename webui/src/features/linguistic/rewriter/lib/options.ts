// src/features/linguistic/rewriter/lib/options.ts
/**
 * Form option lists for the Rewriter tool.
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const transformationGoalOptions: FieldOption[] = [
  { value: "paraphrase", label: "Paraphrase" },
  { value: "shorten", label: "Shorten" },
  { value: "expand", label: "Expand" },
  { value: "simplify", label: "Simplify" },
];
