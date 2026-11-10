// src/features/message-refiner/lib/validate.ts
/** Input checks for the Message Refiner. */

export const MESSAGE_MAX = 4000;
export const AUDIENCE_MAX = 300;
export const GOAL_MAX = 300;
export const SUBJECT_MAX = 200;
export const EDIT_INSTRUCTION_MAX = 500;

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
