// src/features/prompt-refiner/lib/validate.ts
/** Input checks for the Prompt Refiner. */

export const ORIGINAL_MAX = 6000;
export const GOAL_MAX = 1000;
export const PROMPT_MAX = 1000;

export function requireText(value: string, label: string, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}

export function optionalText(value: string, max: number): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}
