// src/features/practice/bias-inoculator/lib/options.ts
/**
 * Form options for the Cognitive Bias Inoculator.
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const targetBiasOptions: FieldOption[] = [
  { value: "random", label: "Random bias" },
  { value: "anchoring", label: "Anchoring" },
  { value: "availability", label: "Availability" },
  { value: "confirmation", label: "Confirmation" },
  { value: "sunk_cost", label: "Sunk Cost" },
  { value: "framing", label: "Framing" },
];
