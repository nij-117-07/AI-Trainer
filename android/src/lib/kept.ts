// src/lib/kept.ts
/**
 * Kept items for generated results (DESIGN.md section 9.4). Items the user ticked stay when a new
 * batch is generated. Unticked items are dropped. A new item with the same key as a kept one is skipped.
 */

export interface KeepableItem {
  kept: boolean;
}

export function mergeKept<T extends KeepableItem>(previous: T[], generated: T[], keyOf: (item: T) => string): T[] {
  const kept = previous.filter((item) => item.kept);
  const keys = new Set(kept.map(keyOf));
  const fresh = generated.filter((item) => !keys.has(keyOf(item))).map((item) => ({ ...item, kept: false }));
  return [...kept, ...fresh];
}

export function keptCount<T extends KeepableItem>(items: T[]): number {
  return items.filter((item) => item.kept).length;
}
