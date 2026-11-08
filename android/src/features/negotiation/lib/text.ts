// src/features/negotiation/lib/text.ts
/** Readers for raw model output. Any value the model returns becomes a safe value, as in the backend. */

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

/** Whole number clamped to [low, high]. Falls back when the value is missing or not numeric. */
export function wholeOf(value: unknown, fallback: number, low: number, high: number): number {
  const parsed = toFiniteNumber(value);
  if (parsed === null) return fallback;
  return Math.max(low, Math.min(high, Math.trunc(parsed)));
}
