// src/features/rewriter/options.ts
/**
 * Transformation goal presets for the Rewriter form. Values match the webui options and the
 * backend Literal, so the goal field does not accept custom text.
 */
import type { SelectOption } from "@/components/tool/SelectField";

export const TRANSFORMATION_GOALS = [
  "paraphrase",
  "shorten",
  "expand",
  "simplify",
] as const;

export const TRANSFORMATION_GOAL_OPTIONS: SelectOption[] = [
  { value: "paraphrase", label: "Paraphrase" },
  { value: "shorten", label: "Shorten" },
  { value: "expand", label: "Expand" },
  { value: "simplify", label: "Simplify" },
];
