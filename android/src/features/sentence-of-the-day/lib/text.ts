// src/features/sentence-of-the-day/lib/text.ts
/**
 * Readers for model output and date helpers. Any value the model returns becomes a safe string or
 * list, so a missing or wrongly typed field never crashes the screen.
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

/** First line of a markdown text, without list or emphasis marks, cut to one short line for a collapsed section. */
export function oneLineSummary(text: string, max = 60): string {
  const line = text
    .split("\n")
    .map((part) => part.replace(/^\s*[-*+]\s+/, "").replace(/[*_`#]/g, "").trim())
    .find(Boolean) ?? "";
  return line.length > max ? `${line.slice(0, max - 1).trimEnd()}…` : line;
}

/** Local calendar date as YYYY-MM-DD, matching the backend's datetime.now() format. */
export function formatLocalDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
