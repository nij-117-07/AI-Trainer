// src/features/guides/lib/text.ts
/**
 * Text and list helpers. The readers accept any value the model returns, so a missing or
 * wrongly typed field becomes an empty value instead of a crash.
 */

/** Splits newline-separated input into trimmed, non-empty lines. */
export function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function listOf(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Accepts an array of text, or a newline-separated string, and returns trimmed text items. */
export function textList(value: unknown): string[] {
  if (typeof value === "string") return splitLines(value);
  return listOf(value).map(textOf).filter(Boolean);
}

export function numberOf(value: unknown): number | null {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? Math.round(parsed) : null;
}

const HEX = "0123456789ABCDEF";

/** Random upper-case hex string, used as the blueprint build seed. */
export function seedId(length: number): string {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += HEX[Math.floor(Math.random() * HEX.length)];
  }
  return out;
}

/** Unique-enough seed that varies each generation, like the backend's uuid seeds. */
export function variationSeed(): string {
  return `${Date.now().toString(36)}-${seedId(8).toLowerCase()}`;
}
