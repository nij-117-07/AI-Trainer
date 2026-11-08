// src/features/simulator/lib/validate.ts
/**
 * Input checks for the Simulator forms. Lengths match the webui zod schemas, so a request is
 * rejected here before it reaches the model.
 */

export const LIMITS = {
  persona: 1000,
  scenario: 2000,
  line: 2000,
  context: 2000,
  promptName: 200,
  promptContent: 10000,
} as const;

export function requireText(value: string, label: string, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}

/** Returns undefined when empty so the optional model input is left out. */
export function optionalText(value: string, label: string, max: number): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed || undefined;
}
