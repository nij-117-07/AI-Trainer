// src/features/socratic/options.ts
/**
 * Confidence presets for the Socratic Challenger. Values match the webui options and the backend
 * Literal type, so the field does not accept custom text.
 */

export interface ConfidenceChoice {
  value: string;
  label: string;
}

export const CONFIDENCE_LEVELS = ["low", "medium", "high", "certain"] as const;

export const CONFIDENCE_OPTIONS: ConfidenceChoice[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "certain", label: "Certain" },
];

export const DEFAULT_CONFIDENCE = "medium";
