// src/features/clarity-trainer/options.ts
/**
 * Dropdown presets and input limits for the Clarity Trainer. Values match the webui options and
 * the backend enums, so these fields do not accept custom text.
 */
import { CATEGORY_VALUES, DIFFICULTY_VALUES } from "./types";

export interface ClarityChoice {
  value: string;
  label: string;
}

export const RANDOM_VALUE = "random";

export const DIFFICULTY_OPTIONS: ClarityChoice[] = [
  { value: RANDOM_VALUE, label: "Random" },
  ...DIFFICULTY_VALUES.map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) })),
];

const CATEGORY_LABELS: Record<(typeof CATEGORY_VALUES)[number], string> = {
  "team update": "Team Update",
  "giving feedback": "Giving Feedback",
  "difficult conversation": "Difficult Conversation",
  "pitch or ask": "Pitch or Ask",
  "status report": "Status Report",
  "conflict resolution": "Conflict Resolution",
  "presentation opening": "Presentation Opening",
  email: "Email",
  negotiation: "Negotiation",
  apology: "Apology",
};

export const CATEGORY_OPTIONS: ClarityChoice[] = [
  { value: RANDOM_VALUE, label: "Random" },
  ...CATEGORY_VALUES.map((value) => ({ value, label: CATEGORY_LABELS[value] })),
];

export const LIMITS = {
  userContext: 200,
  response: 2000,
} as const;
