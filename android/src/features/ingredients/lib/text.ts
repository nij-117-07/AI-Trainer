// src/features/ingredients/lib/text.ts
/**
 * Text and list readers. They accept any value the model returns, so a missing or wrongly typed
 * field becomes an empty value instead of a crash.
 */

export function listOf(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Accepts an array of text, or a newline-separated string, and returns trimmed non-empty items. */
export function textList(value: unknown): string[] {
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return listOf(value).map(textOf).filter(Boolean);
}

export function numberOf(value: unknown): number | null {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? Math.round(parsed) : null;
}
