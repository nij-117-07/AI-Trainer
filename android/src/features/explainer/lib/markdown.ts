// src/features/explainer/lib/markdown.ts
/**
 * Small Markdown parser for model output. Handles headings, bullet and numbered lists, block
 * quotes, fenced code, paragraphs, and inline bold, italic, and code. Anything else is kept as
 * plain text, so unusual output still shows.
 */

export type MarkdownBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "numbered"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "code"; text: string };

export interface InlineSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
}

const HEADING = /^(#{1,6})\s+(.*)$/;
const BULLET = /^\s*[-*+]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
const QUOTE = /^\s*>\s?(.*)$/;
const FENCE = /^\s*```/;

export function parseMarkdown(source: string): MarkdownBlock[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (FENCE.test(line)) {
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !FENCE.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push({ type: "code", text: code.join("\n") });
      continue;
    }

    const heading = HEADING.exec(trimmed);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2].trim() });
      index += 1;
      continue;
    }

    if (BULLET.test(line)) {
      const items: string[] = [];
      while (index < lines.length && BULLET.test(lines[index])) {
        items.push(BULLET.exec(lines[index])![1].trim());
        index += 1;
      }
      blocks.push({ type: "bullets", items });
      continue;
    }

    if (NUMBERED.test(line)) {
      const items: string[] = [];
      while (index < lines.length && NUMBERED.test(lines[index])) {
        items.push(NUMBERED.exec(lines[index])![1].trim());
        index += 1;
      }
      blocks.push({ type: "numbered", items });
      continue;
    }

    if (QUOTE.test(line)) {
      const quoted: string[] = [];
      while (index < lines.length && QUOTE.test(lines[index])) {
        quoted.push(QUOTE.exec(lines[index])![1]);
        index += 1;
      }
      blocks.push({ type: "quote", text: quoted.join("\n").trim() });
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !FENCE.test(lines[index]) &&
      !HEADING.test(lines[index].trim()) &&
      !BULLET.test(lines[index]) &&
      !NUMBERED.test(lines[index]) &&
      !QUOTE.test(lines[index])
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
}

const INLINE_TOKEN = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/;

export function parseInline(text: string): InlineSegment[] {
  return text
    .split(INLINE_TOKEN)
    .filter((part) => part.length > 0)
    .map((part): InlineSegment => {
      if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
        return { text: part.slice(2, -2), bold: true };
      }
      if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
        return { text: part.slice(1, -1), code: true };
      }
      if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
        if (part.length > 2) return { text: part.slice(1, -1), italic: true };
      }
      return { text: part };
    });
}
