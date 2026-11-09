// src/features/observation-trainer/lib/validate.ts
/**
 * Input checks for the Observation Trainer. Lengths match the webui zod schema, so a request is
 * rejected here before it reaches the model.
 */
import type { ImageInput } from "@/lib/image";

export const IMAGE_REQUIREMENTS_MAX = 300;
export const SCENARIO_MAX = 500;
export const OBSERVATIONS_MAX = 5000;
export const CONTEXT_MAX = 200;
export const FOCUS_MAX = 200;

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

export function requireImage(image: ImageInput | null): ImageInput {
  if (!image) throw new Error("Choose an image to observe first.");
  return image;
}
