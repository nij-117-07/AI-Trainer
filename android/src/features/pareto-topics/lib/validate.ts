// src/features/pareto-topics/lib/validate.ts
/** Input checks for the 80/20 Topics. Limits match the form fields. */

export const FIELD_MAX = 200;
export const GOAL_MAX = 200;
export const LEVEL_MAX = 100;
export const INSTRUCTIONS_MAX = 1000;

export function requireText(value: string, label: string, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}
