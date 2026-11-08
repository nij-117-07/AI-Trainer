// src/features/flexible-writer/lib/validate.ts
/**
 * Input checks for the Flexible Writer form. Lengths match the webui zod schema, so a request is
 * rejected here before it reaches the model.
 */

export const SYSTEM_PROMPT_MAX = 2000;
export const INPUT_DATA_MAX = 20000;
export const INSTRUCTIONS_MAX = 2000;

export function requireText(value: string, label: string, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}

export function optionalText(value: string, label: string, max: number): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed || undefined;
}
