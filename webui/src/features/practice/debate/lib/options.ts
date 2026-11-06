// src/features/practice/debate/lib/options.ts
/**
 * Form options for the Debate Engine.
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const sideOptions: FieldOption[] = [
  { value: "pro", label: "Pro (in favor)" },
  { value: "con", label: "Con (against)" },
];

export const strategyOptions: FieldOption[] = [
  { value: "attack", label: "Attack" },
  { value: "defend", label: "Defend" },
  { value: "counter", label: "Counter" },
];

export const turnModeOptions: FieldOption[] = [
  { value: "type", label: "Type it myself" },
  { value: "ai", label: "Generate with AI" },
];
