// src/features/idioms/lib/text.ts
/** Readers that accept any value the model returns, so a missing or wrongly typed field becomes empty text. */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
