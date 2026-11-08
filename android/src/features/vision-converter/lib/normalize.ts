// src/features/vision-converter/lib/normalize.ts
/** Reads the model output defensively, so a missing or wrongly typed field becomes empty Markdown. */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeMarkdown(value: unknown): string {
  return isRecord(value) ? textOf(value.markdownOutput) : "";
}
