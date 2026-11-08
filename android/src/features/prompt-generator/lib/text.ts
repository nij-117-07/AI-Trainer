// src/features/prompt-generator/lib/text.ts
/** Text helpers. Readers accept any value the model returns, so a wrong type becomes empty text. */

export function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
