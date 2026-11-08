// src/features/clarity-trainer/lib/text.ts
/**
 * Readers for model output. Any field can be missing or the wrong type, so each reader returns
 * a safe fallback instead of throwing.
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function recordOf(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

export function listOf(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function textOf(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

/** Accepts a list of text, or a single string, and returns trimmed non-empty items. */
export function textList(value: unknown): string[] {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
  return listOf(value).map(textOf).filter(Boolean);
}

export function numberOf(value: unknown, fallback: number): number {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : fallback;
}

export function intOf(value: unknown, fallback: number): number {
  return Math.trunc(numberOf(value, fallback));
}

export function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}

/** Returns the candidate when it is one of the allowed values, otherwise the fallback. */
export function pickOption<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  const candidate = typeof value === "string" ? value.trim().toLowerCase() : "";
  const match = allowed.find((option) => option === candidate);
  return match ?? fallback;
}
