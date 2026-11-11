// src/features/idioms/lib/text.ts
/** Readers that accept any value the model returns, so a missing or wrongly typed field becomes empty text. */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** One line of plain text from Markdown, cut at a word boundary, for the summary of a closed disclosure. */
export function plainSummary(markdown: string, max = 90): string {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^\s*(?:[-+*]|\d+\.)\s+/gm, "")
    .replace(/[`*_#>|~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${cut.slice(0, space > 0 ? space : max).trimEnd()}…`;
}
