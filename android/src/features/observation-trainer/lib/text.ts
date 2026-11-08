// src/features/observation-trainer/lib/text.ts
/**
 * Readers for model output and saved drafts. Each one accepts any value and returns a safe
 * default, so a missing or wrongly typed field never crashes a screen.
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

export function numberOf(value: unknown): number | null {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : null;
}
