// src/features/interview/lib/text.ts
/**
 * Readers for model output and stored data. Each accepts any value and returns a safe default, so a
 * missing or wrongly typed field never reaches a `.length` or `.map` call.
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

/** Accepts a list of text or a newline-separated string, and returns trimmed non-empty items. */
export function textList(value: unknown): string[] {
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return listOf(value).map(textOf).filter(Boolean);
}

export function numberOf(value: unknown): number | undefined {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : undefined;
}

/** Reads a score on the 0 to 10 scale. Missing or non-numeric values become 0. */
export function scoreOf(value: unknown): number {
  const parsed = numberOf(value) ?? 0;
  return Math.min(10, Math.max(0, parsed));
}

export function pickOption<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/** Reads a map of name to number. Accepts an object or a JSON string holding one. */
export function numberRecord(value: unknown): Record<string, number> {
  let source: unknown = value;
  if (typeof value === "string") {
    try {
      source = JSON.parse(value);
    } catch {
      return {};
    }
  }
  if (!isRecord(source)) return {};
  const out: Record<string, number> = {};
  for (const [key, item] of Object.entries(source)) {
    const parsed = numberOf(item);
    if (parsed !== undefined) out[key] = parsed;
  }
  return out;
}
