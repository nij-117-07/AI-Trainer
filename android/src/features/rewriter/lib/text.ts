// src/features/rewriter/lib/text.ts
/**
 * Text and list readers. They accept any value the model returns, so a missing or wrongly typed
 * field becomes an empty value instead of a crash.
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

export function textList(value: unknown): string[] {
  return listOf(value).map(textOf).filter(Boolean);
}
