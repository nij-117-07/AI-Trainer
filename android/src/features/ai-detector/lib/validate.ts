// src/features/ai-detector/lib/validate.ts
/**
 * Input checks for the AI Detector. Lengths match Backend/tools/ai_detector/schemas.py and the
 * webui zod schemas, so a request is rejected here before it reaches the model.
 */

export const TEXT_MAX = 50_000;
export const COMMENTS_MAX = 2_000;

export function requireText(value: string, label: string, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max.toLocaleString("en-US")} characters or fewer.`);
  return trimmed;
}

export function optionalText(value: string, label: string, max: number): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length > max) throw new Error(`${label} must be ${max.toLocaleString("en-US")} characters or fewer.`);
  return trimmed || undefined;
}
