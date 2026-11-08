// src/features/prompt-generator/lib/validate.ts
/**
 * Input checks for the Prompt Generator form. Lengths match the webui zod schema, so a request is
 * rejected here before it reaches the model.
 */
import { splitLines } from "./text";

export const SCENARIO_MAX = 200;
export const CONTEXT_MAX = 2000;
export const INSTRUCTIONS_MAX = 2000;
export const REFERENCE_SAMPLES_MAX = 3000;
export const PAST_PROMPT_MAX = 5000;
export const SEED_MAX = 200;

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

/** Newline-separated list input. Returns undefined when empty so the optional field is omitted. */
export function optionalLines(value: string, label: string, max: number): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  const lines = splitLines(trimmed);
  return lines.length > 0 ? lines.join("\n") : undefined;
}
