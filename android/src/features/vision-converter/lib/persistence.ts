// src/features/vision-converter/lib/persistence.ts
/** Storage key and saved-draft reader for the Vision Converter. The image itself is not saved. */
export const VISION_STORAGE_KEY = "tools.vision-converter.state.v1";

export interface SavedVisionState {
  instruction: string;
  markdownOutput: string | null;
}

export function parseSavedState(value: unknown): SavedVisionState {
  const saved: Record<string, unknown> =
    typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  return {
    instruction: typeof saved.instruction === "string" ? saved.instruction : "",
    markdownOutput: typeof saved.markdownOutput === "string" ? saved.markdownOutput : null,
  };
}
