// src/features/creative-assets/lib/normalize.ts
/**
 * Turns raw model output and stored JSON into the typed values the screens render. Every list is
 * checked, every suggestion is read field by field, and suggestions without text are dropped.
 */
import type { CreativeAssetsFormValues, CreativeAssetsResult, CreativeBatch, CreativeListItem, CreativeSuggestion } from "../types";
import { CREATIVE_ASSETS_DEFAULTS, mergeSavedForm } from "./persistence";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function listOf(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeCreativeAssets(raw: { suggestions?: unknown }): { suggestions: CreativeSuggestion[] } {
  const suggestions: CreativeSuggestion[] = listOf(raw.suggestions)
    .filter(isRecord)
    .map((item) => ({
      suggestion: textOf(item.suggestion),
      explanation: textOf(item.explanation),
    }))
    .filter((item) => item.suggestion);
  return { suggestions };
}

/** Stored JSON is not trusted. Keeps only valid batches and items, and returns null when nothing usable is saved. */
export function restoreCreativeAssetsResult(saved: unknown): CreativeAssetsResult | null {
  if (!isRecord(saved)) return null;
  const batches: CreativeBatch[] = listOf(saved.batches)
    .filter(isRecord)
    .map((batch) => ({
      id: textOf(batch.id),
      label: textOf(batch.label),
      items: listOf(batch.items)
        .filter(isRecord)
        .map((item): CreativeListItem => ({
          id: textOf(item.id),
          suggestion: textOf(item.suggestion),
          explanation: textOf(item.explanation),
          liked: item.liked === true,
        }))
        .filter((item) => item.id && item.suggestion),
    }))
    .filter((batch) => batch.id && batch.label && batch.items.length > 0);
  if (batches.length === 0) return null;
  const rounds = typeof saved.rounds === "number" && Number.isInteger(saved.rounds) && saved.rounds >= 1 ? saved.rounds : 1;
  return {
    form: mergeSavedForm<CreativeAssetsFormValues>(CREATIVE_ASSETS_DEFAULTS, saved.form),
    rounds,
    batches,
  };
}
