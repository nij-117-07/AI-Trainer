// src/features/rewriter/options.ts
/**
 * Transformation goal presets for the Rewriter form. Values match the webui options. The form also
 * accepts a custom goal, which the signature treats as a suggestion, not a fixed list.
 */
import type { SelectOption } from "@/components/tool/SelectField";

export const TONE_OPTIONS: SelectOption[] = [
  { value: "professional", label: "Professional" },
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "witty", label: "Witty" },
  { value: "warm", label: "Warm" },
  { value: "empathetic", label: "Empathetic" },
  { value: "concise", label: "Concise" },
  { value: "persuasive", label: "Persuasive" },
];

export const AUDIENCE_OPTIONS: SelectOption[] = [
  { value: "general audience", label: "General audience" },
  { value: "students", label: "Students" },
  { value: "children", label: "Children" },
  { value: "customers", label: "Customers" },
  { value: "software engineers", label: "Software engineers" },
  { value: "managers", label: "Managers" },
  { value: "investors", label: "Investors" },
  { value: "executives", label: "Executives" },
];

export const TRANSFORMATION_GOAL_OPTIONS: SelectOption[] = [
  { value: "paraphrase", label: "Paraphrase" },
  { value: "shorten", label: "Shorten" },
  { value: "expand", label: "Expand" },
  { value: "simplify", label: "Simplify" },
];
