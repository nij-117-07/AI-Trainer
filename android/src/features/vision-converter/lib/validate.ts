// src/features/vision-converter/lib/validate.ts
/**
 * Input checks for the Vision Converter. An image is required. The instruction is optional and
 * falls back to the webui default, which the backend also uses when the field is missing.
 */
import type { ImageInput } from "@/lib/image";

export const DEFAULT_INSTRUCTION = "Convert the image to markdown.";
export const INSTRUCTION_MAX = 1000;

export function requireImage(image: ImageInput | null): ImageInput {
  if (!image) throw new Error("Choose an image to convert first.");
  return image;
}

export function instructionOrDefault(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length > INSTRUCTION_MAX) {
    throw new Error(`Instruction must be ${INSTRUCTION_MAX} characters or fewer.`);
  }
  return trimmed || DEFAULT_INSTRUCTION;
}
