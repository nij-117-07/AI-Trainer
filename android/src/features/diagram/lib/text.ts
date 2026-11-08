// src/features/diagram/lib/text.ts
/**
 * Readers for stored data and model output. They accept any value, so a missing or wrongly typed
 * field becomes empty text instead of a crash.
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
