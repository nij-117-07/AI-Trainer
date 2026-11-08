// src/features/translator/lib/validate.ts
/**
 * Input checks for the Translator form. Lengths and the tone list match the webui zod schema, so
 * a request is rejected here before it reaches the model.
 */
import { TONES } from "../options";

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

export function requireTone(value: string): (typeof TONES)[number] {
  const match = TONES.find((tone) => tone === value);
  if (!match) throw new Error(`Tone must be one of: ${TONES.join(", ")}.`);
  return match;
}
