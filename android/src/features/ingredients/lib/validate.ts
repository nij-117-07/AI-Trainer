// src/features/ingredients/lib/validate.ts
/**
 * Input checks for the Ingredients Checker. The photo is required, as in the webui and backend.
 * Manual text is optional and capped at the length the webui textarea is meant to hold.
 */
import type { ImageInput } from "@/lib/image";

export const MANUAL_TEXT_MAX_LENGTH = 2000;

export function optionalText(value: string, label: string, max: number): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed || undefined;
}

export function requireImage(image: ImageInput | null): ImageInput {
  if (!image) throw new Error("Choose an ingredients photo to analyze.");
  return image;
}
