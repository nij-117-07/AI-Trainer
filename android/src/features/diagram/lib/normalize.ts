// src/features/diagram/lib/normalize.ts
/** Turns raw model output into a diagram result. Markdown fences around the code are removed. */
import type { DiagramFormat, DiagramResult } from "../types";
import { textOf } from "./text";

export function stripCodeFence(code: string): string {
  const match = /^```[\w-]*\n([\s\S]*?)\n?```$/.exec(code.trim());
  return match ? match[1].trim() : code.trim();
}

export function normalizeDiagram(
  raw: { updatedCode?: unknown; answerMessage?: unknown },
  format: DiagramFormat,
): DiagramResult {
  const code = stripCodeFence(textOf(raw.updatedCode));
  if (!code) throw new Error("The model did not return any diagram code. Try again.");
  return { message: textOf(raw.answerMessage), code, format };
}
