// src/features/bias-inoculator/options.ts
/**
 * Form defaults and dropdown options for the Cognitive Bias Inoculator. Values match the webui
 * options and the backend bias enum.
 */
import type { BiasFormValues } from "./types";

export interface BiasChoice {
  value: string;
  label: string;
}

export const TARGET_BIAS_OPTIONS: BiasChoice[] = [
  { value: "random", label: "Random bias" },
  { value: "anchoring", label: "Anchoring" },
  { value: "availability", label: "Availability" },
  { value: "confirmation", label: "Confirmation" },
  { value: "sunk_cost", label: "Sunk Cost" },
  { value: "framing", label: "Framing" },
];

export const BIAS_FORM_DEFAULTS: BiasFormValues = {
  userInterest: "Trading",
  targetBias: "random",
};
