// src/features/translator/lib/normalize.ts
/**
 * Turns raw model output into the typed translation the screen renders. Missing or wrongly typed
 * fields become empty text instead of a crash.
 */
import type { TranslationResponse } from "../types";

export function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeTranslation(raw: {
  rationale?: unknown;
  translatedText?: unknown;
  culturalNotes?: unknown;
}): TranslationResponse {
  return {
    rationale: textOf(raw.rationale),
    translatedText: textOf(raw.translatedText),
    culturalNotes: textOf(raw.culturalNotes),
  };
}
