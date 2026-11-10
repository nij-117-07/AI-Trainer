// src/features/creative-assets/lib/batches.ts
/** Helpers for the batch list: building a new round, reading the ticked items, and labelling rounds. */
import type { CreativeAssetsResult, CreativeBatch, CreativeListItem, CreativeSuggestion } from "../types";

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Builds a round. Items from a "more" round start ticked, so the user only unticks what they reject. */
export function newBatch(label: string, suggestions: CreativeSuggestion[], liked: boolean): CreativeBatch {
  return {
    id: newId(),
    label,
    items: suggestions.map((item): CreativeListItem => ({ ...item, id: newId(), liked })),
  };
}

export function toggleItem(result: CreativeAssetsResult, itemId: string): CreativeAssetsResult {
  return {
    ...result,
    batches: result.batches.map((batch) => ({
      ...batch,
      items: batch.items.map((item) => (item.id === itemId ? { ...item, liked: !item.liked } : item)),
    })),
  };
}

/** Keeps only the ticked items, and drops batches that end up empty. */
export function keepLikedOnly(result: CreativeAssetsResult): CreativeAssetsResult {
  return {
    ...result,
    batches: result.batches
      .map((batch) => ({ ...batch, items: batch.items.filter((item) => item.liked) }))
      .filter((batch) => batch.items.length > 0),
  };
}

export function likedTexts(result: CreativeAssetsResult): string[] {
  const texts = result.batches.flatMap((batch) => batch.items.filter((item) => item.liked).map((item) => item.suggestion));
  return [...new Set(texts)];
}

export function nextBatchLabel(round: number, likedCount: number): string {
  return `Batch ${round} · from ${likedCount} liked`;
}
