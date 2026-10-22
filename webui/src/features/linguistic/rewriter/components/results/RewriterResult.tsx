// src/features/linguistic/rewriter/components/results/RewriterResult.tsx
/**
 * Renders the rewrite output as a composed Markdown document: the polished
 * text, the rationale behind it, and the improvements made.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { RewriteResponse } from "../../types";

function bulletList(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

export function RewriterResult({ result }: { result: RewriteResponse }) {
  const sections: string[] = [];
  if (result.rewritten_text.trim()) {
    sections.push(`## Rewritten Text\n\n> ${result.rewritten_text.trim()}`);
  }
  if (result.rationale.trim()) {
    sections.push(`## Rationale\n\n${result.rationale.trim()}`);
  }
  sections.push(
    result.improvements_made.length
      ? `## Improvements Made\n\n${bulletList(result.improvements_made)}`
      : "## Improvements Made\n\n_No improvements listed._"
  );

  return (
    <Card>
      <CardContent className="p-5">
        <MarkdownContent content={sections.join("\n\n---\n\n")} />
      </CardContent>
    </Card>
  );
}
