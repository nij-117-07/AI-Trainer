// src/features/battleground/lib/text.ts
/**
 * Readers for raw model output. Each reader accepts any value the model returns, so a missing or
 * wrongly typed field becomes an empty value instead of a crash.
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function listOf(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function textOf(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

/** Accepts an array of text, or a newline-separated string, and returns trimmed text items. */
export function textList(value: unknown): string[] {
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return listOf(value).map(textOf).filter(Boolean);
}

/** Reads a dictionary whose values are text. Accepts an object or a JSON object string. */
export function textRecord(value: unknown): Record<string, string> {
  const source = parseRecord(value);
  const out: Record<string, string> = {};
  for (const [key, item] of Object.entries(source)) {
    const text = textOf(item);
    if (key.trim() && text) out[key.trim()] = text;
  }
  return out;
}

/** Reads a dictionary whose values are whole numbers, such as resource changes. */
export function numberRecord(value: unknown): Record<string, number> {
  const source = parseRecord(value);
  const out: Record<string, number> = {};
  for (const [key, item] of Object.entries(source)) {
    const number = numberOf(item);
    if (key.trim() && number !== null) out[key.trim()] = number;
  }
  return out;
}

export function numberOf(value: unknown): number | null {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : null;
}

export function booleanOf(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  return /^(true|yes|y|1)$/i.test(textOf(value));
}

/** Parses a JSON object string or passes an object through. Anything else becomes an empty object. */
export function parseRecord(value: unknown): Record<string, unknown> {
  if (isRecord(value)) return value;
  if (typeof value !== "string") return {};
  try {
    const parsed: unknown = JSON.parse(value);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}
