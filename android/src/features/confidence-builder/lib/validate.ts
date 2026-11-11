// src/features/confidence-builder/lib/validate.ts
/** Input checks for the Confidence Builder. Limits match the form fields. */
import { comfortOptions, focusOptions, ratingOptions } from "../options";
import type { ComfortLevel, ConfidenceFocus, Rating } from "../types";

export const SITUATION_MAX = 300;
export const INSTRUCTIONS_MAX = 1000;
export const REFLECTION_MAX = 500;
export const MIN_TASKS = 1;
export const MAX_TASKS = 5;
export const DEFAULT_TASKS = 3;

export function requireText(value: string, label: string, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}

export function clampCount(value: unknown, fallback = DEFAULT_TASKS): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.round(Math.min(MAX_TASKS, Math.max(MIN_TASKS, value)));
}

export function isFocus(value: unknown): value is ConfidenceFocus {
  return focusOptions.some((option) => option.value === value);
}

export function isComfort(value: unknown): value is ComfortLevel {
  return comfortOptions.some((option) => option.value === value);
}

export function isRating(value: unknown): value is Rating {
  return ratingOptions.some((option) => option.value === value);
}
