// src/features/motivation/lib/normalise.ts
/**
 * Input checks and tolerant readers. Model output and stored drafts can be missing fields, so
 * every value read from them goes through these helpers before the screen uses it.
 */

export function requireText(value: string, label: string, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}

export function optionalText(value: string, max: number): string | undefined {
  const trimmed = value.trim().slice(0, max);
  return trimmed || undefined;
}

export function listOf<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function textOf(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function stringOr(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Local calendar date as YYYY-MM-DD, matching Python's str(date.today()). */
export function localDateString(date: Date = new Date()): string {
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
