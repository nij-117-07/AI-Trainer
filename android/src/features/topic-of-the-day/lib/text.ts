// src/features/topic-of-the-day/lib/text.ts
/**
 * Readers that accept any value the model returns, so a missing or wrongly typed field becomes
 * empty text or an empty list instead of a crash.
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

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
