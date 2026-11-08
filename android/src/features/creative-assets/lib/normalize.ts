// src/features/creative-assets/lib/normalize.ts
/**
 * Turns raw model output into the typed result the screen renders. Every list is checked, every
 * suggestion is read field by field, and suggestions without text are dropped.
 */
import type { CreativeAssetsResult, CreativeSuggestion } from "../types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function listOf(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeCreativeAssets(raw: { suggestions?: unknown }): CreativeAssetsResult {
  const suggestions: CreativeSuggestion[] = listOf(raw.suggestions)
    .filter(isRecord)
    .map((item) => ({
      suggestion: textOf(item.suggestion),
      explanation: textOf(item.explanation),
    }))
    .filter((item) => item.suggestion);
  return { suggestions };
}
