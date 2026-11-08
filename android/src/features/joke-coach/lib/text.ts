// src/features/joke-coach/lib/text.ts
/**
 * Readers for raw model output. They mirror the backend's _coerce_* helpers: any value the model
 * returns becomes a safe value, so a missing or wrongly typed field never crashes a screen.
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function textOf(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

/** Accepts a list or a single value. A missing value gives an empty list. */
export function textList(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  const items = Array.isArray(value) ? value : [value];
  return items.map(textOf).filter(Boolean);
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/** Number clamped to [0, high]. Falls back when the value is missing or not numeric. */
export function scoreOf(value: unknown, fallback: number, high: number): number {
  const parsed = toFiniteNumber(value) ?? fallback;
  return Math.max(0, Math.min(high, parsed));
}

/** Whole number clamped to [low, high]. Falls back when the value is missing or not numeric. */
export function wholeOf(value: unknown, fallback: number, low: number, high: number): number {
  const parsed = toFiniteNumber(value);
  if (parsed === null) return fallback;
  return Math.max(low, Math.min(high, Math.trunc(parsed)));
}

export function booleanOf(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  return ["true", "1", "yes", "y"].includes(textOf(value).toLowerCase());
}

/** Lower-cased value when it is one of the allowed options, otherwise the fallback. */
export function pickOption<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  const candidate = textOf(value).toLowerCase();
  return (allowed as readonly string[]).includes(candidate) ? (candidate as T) : fallback;
}
