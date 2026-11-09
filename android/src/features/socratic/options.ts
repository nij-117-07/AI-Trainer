// src/features/socratic/options.ts
/**
 * Options for the Socratic Challenger: how confident the user is, and which way the challenger
 * pushes. Values are fixed, so the form does not accept custom text.
 */
import type { SocraticFocus } from "./types";

export interface SocraticChoice {
  value: string;
  label: string;
  hint?: string;
}

export const CONFIDENCE_LEVELS = ["low", "medium", "high", "certain"] as const;

export const CONFIDENCE_OPTIONS: SocraticChoice[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "certain", label: "Certain" },
];

export const DEFAULT_CONFIDENCE = "medium";

export const FOCUS_OPTIONS: SocraticChoice[] = [
  { value: "challenge", label: "Challenge my belief", hint: "Tests whether the belief holds up and what would prove it wrong." },
  { value: "both-sides", label: "Argue both sides", hint: "Builds the strongest case for each side before you decide." },
  { value: "assumptions", label: "Expose my assumptions", hint: "Digs out the premises you rely on without saying them." },
];

export const DEFAULT_FOCUS: SocraticFocus = "both-sides";

export const HISTORY_LIMIT = 20;
export const STATEMENT_MAX = 2000;
