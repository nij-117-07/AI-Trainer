// src/features/markdown-viewer/lib/stats.ts
/** Word and line counts shown with the editor. */

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function countLines(text: string): number {
  return text.split("\n").length;
}
