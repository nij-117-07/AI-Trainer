// src/lib/image.ts
/**
 * Shrinks a picked photo so its longest side is at most MAX_IMAGE_DIMENSION, and re-encodes
 * it as JPEG. This matches the webui grader, which resizes to 1024px before sending.
 */
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

/** A picked image, base64-encoded so it can be sent to the model. */
export interface ImageInput {
  uri: string;
  mimeType: string;
  base64: string;
}

export const MAX_IMAGE_DIMENSION = 1024;
const JPEG_QUALITY = 0.7;

export interface PickedImage {
  uri: string;
  width: number;
  height: number;
}

export function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export async function resizeImage(picked: PickedImage): Promise<ImageInput> {
  const size = fitWithin(picked.width, picked.height, MAX_IMAGE_DIMENSION);
  const result = await manipulateAsync(
    picked.uri,
    [{ resize: size }],
    { compress: JPEG_QUALITY, format: SaveFormat.JPEG, base64: true },
  );
  if (!result.base64) {
    throw new Error("Could not read the selected image. Try another one.");
  }
  return { uri: result.uri, mimeType: "image/jpeg", base64: result.base64 };
}
