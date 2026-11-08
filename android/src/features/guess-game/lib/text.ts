// src/features/guess-game/lib/text.ts
/** Readers for model output. Each accepts any value and returns a safe default for bad data. */

export function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function isTrue(value: unknown): boolean {
  return value === true || (typeof value === "string" && value.trim().toLowerCase() === "true");
}

/** Reads a 0 to 1 score. Missing or non-numeric values become 0. */
export function clampUnit(value: unknown): number {
  const parsed = typeof value === "string" ? Number(value) : value;
  if (typeof parsed !== "number" || !Number.isFinite(parsed)) return 0;
  return Math.min(1, Math.max(0, parsed));
}
