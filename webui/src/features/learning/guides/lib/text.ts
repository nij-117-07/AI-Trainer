// src/features/learning/guides/lib/text.ts
/**
 * Small text helpers for the Guides tool forms.
 */

/** Splits newline-separated textarea input into a trimmed, non-empty array. */
export function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
