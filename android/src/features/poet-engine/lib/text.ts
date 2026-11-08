// src/features/poet-engine/lib/text.ts
/**
 * Text readers. They accept any value the model returns, so a missing or wrongly typed field
 * becomes an empty string instead of a crash.
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
