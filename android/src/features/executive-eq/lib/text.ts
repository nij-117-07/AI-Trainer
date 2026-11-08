// src/features/executive-eq/lib/text.ts
/**
 * Text and list helpers. The readers accept any value the model returns, so a missing or
 * wrongly typed field becomes an empty value instead of a crash.
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
  if (typeof value === "string") return value.split("\n").map((line) => line.trim()).filter(Boolean);
  return listOf(value).map(textOf).filter(Boolean);
}

/** Returns the first allowed value that matches case-insensitively, otherwise the default. */
export function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  const candidate = textOf(value).toLowerCase();
  return allowed.find((option) => option.toLowerCase() === candidate) ?? fallback;
}

export function orFallback(value: string, fallback: string): string {
  return value.trim() ? value : fallback;
}
