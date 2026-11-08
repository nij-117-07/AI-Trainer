// src/features/language-tester/lib/text.ts
/**
 * Readers for model output. Each one accepts any value and returns an empty value instead of
 * throwing, so a missing or wrongly typed field never crashes a screen.
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
  return typeof parsed === "number" && Number.isFinite(parsed) ? Math.round(parsed) : null;
}

export function boolOf(value: unknown): boolean {
  return value === true || value === "true";
}

/** Collapses line breaks so a value fits on one line of a prompt. */
export function oneLine(value: string): string {
  return value.replace(/\s*\n\s*/g, " ").trim();
}

export function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
