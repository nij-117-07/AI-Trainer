// src/features/rewriter/lib/normalize.ts
/** Turns the raw model output into the RewriteResult the screen renders. Every list is checked and empty entries are dropped. */
import type { RewriteResult } from "../types";
import { textList, textOf } from "./text";

export function normalizeRewrite(raw: {
  rationale?: unknown;
  rewrittenText?: unknown;
  improvementsMade?: unknown;
}): RewriteResult {
  return {
    rationale: textOf(raw.rationale),
    rewrittenText: textOf(raw.rewrittenText),
    improvementsMade: textList(raw.improvementsMade),
  };
}
